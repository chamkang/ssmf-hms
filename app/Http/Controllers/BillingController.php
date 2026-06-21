<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\LabOrder;
use App\Models\Payment;
use App\Models\Prescription;
use App\Models\Tariff;
use App\Services\FapshiClient;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BillingController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->query('status', 'open');

        $invoices = Invoice::with(['patient', 'items', 'payments'])
            ->when($status !== 'all', fn ($q) => $q->where('status', $status))
            ->latest()
            ->limit(100)
            ->get();

        return Inertia::render('Billing/Index', ['invoices' => $invoices, 'status' => $status]);
    }

    public function create()
    {
        return Inertia::render('Billing/Create', [
            'tariffs' => Tariff::where('is_active', true)->orderBy('sort_order')->get(['id', 'label', 'amount']),
        ]);
    }

    /**
     * Suggest unbilled charges for a patient — completed lab orders and
     * dispensed prescriptions not yet attached to any invoice line.
     */
    public function chargeable(Request $request)
    {
        $patientId = (int) $request->query('patient_id');
        if (! $patientId) {
            return response()->json([]);
        }

        $lines = [];

        $billedLab = InvoiceItem::where('source_type', 'lab')->whereNotNull('source_id')->pluck('source_id')->all();
        $labOrders = LabOrder::with('items.labTest:id,price')
            ->where('patient_id', $patientId)
            ->whereIn('status', ['resulted', 'validated'])
            ->whereNotIn('id', $billedLab)
            ->get();
        foreach ($labOrders as $o) {
            $amount = (int) $o->items->sum(fn ($it) => (int) ($it->labTest->price ?? 0));
            $lines[] = ['label' => "Lab — {$o->reference}", 'qty' => 1, 'unit_price' => $amount, 'source_type' => 'lab', 'source_id' => $o->id];
        }

        $billedRx = InvoiceItem::where('source_type', 'pharmacy')->whereNotNull('source_id')->pluck('source_id')->all();
        $prescriptions = Prescription::with('items.drug:id,price')
            ->where('patient_id', $patientId)
            ->where('status', 'dispensed')
            ->whereNotIn('id', $billedRx)
            ->get();
        foreach ($prescriptions as $rx) {
            $amount = (int) $rx->items->sum(fn ($it) => (int) ($it->drug->price ?? 0));
            $n = $rx->items->count();
            $lines[] = ['label' => "Pharmacy — Rx #{$rx->id} ({$n} item".($n === 1 ? '' : 's').')', 'qty' => 1, 'unit_price' => $amount, 'source_type' => 'pharmacy', 'source_id' => $rx->id];
        }

        return response()->json($lines);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'items' => 'required|array|min:1',
            'items.*.label' => 'required|string|max:160',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|integer|min:0',
            'items.*.source_type' => 'nullable|string|max:20',
            'items.*.source_id' => 'nullable|integer',
            'notes' => 'nullable|string|max:500',
        ]);

        $invoice = Invoice::create([
            'patient_id' => $data['patient_id'],
            'status' => 'open',
            'currency' => 'XAF',
            'notes' => $data['notes'] ?? null,
        ]);

        foreach ($data['items'] as $it) {
            $invoice->items()->create([
                'label' => $it['label'],
                'qty' => $it['qty'],
                'unit_price' => $it['unit_price'],
                'amount' => $it['qty'] * $it['unit_price'],
                'source_type' => $it['source_type'] ?? 'manual',
                'source_id' => $it['source_id'] ?? null,
            ]);
        }

        return redirect()->route('billing.show', $invoice)->with('success', "Invoice {$invoice->reference} created.");
    }

    public function show(Invoice $invoice)
    {
        $invoice->load(['patient', 'items', 'payments.invoice']);

        return Inertia::render('Billing/Show', ['invoice' => $invoice]);
    }

    public function pay(Request $request, Invoice $invoice)
    {
        $data = $request->validate([
            'method' => 'required|in:cash,momo',
            'amount' => 'required|integer|min:1',
            'tendered' => 'nullable|integer|min:0',
            'reference' => 'nullable|string|max:120',
        ]);

        $change = null;
        if ($data['method'] === 'cash' && ! empty($data['tendered'])) {
            $change = max(0, (int) $data['tendered'] - (int) $data['amount']);
        }

        $invoice->payments()->create([
            'method' => $data['method'],
            'provider' => $data['method'] === 'momo' ? 'fapshi' : null,
            'status' => 'confirmed',
            'reference' => $data['reference'] ?? null,
            'amount' => $data['amount'],
            'tendered' => $data['tendered'] ?? null,
            'change_due' => $change,
            'received_by' => auth()->id(),
            'received_at' => now(),
        ]);

        $invoice->refreshStatus();

        $msg = 'Payment recorded.';
        if ($change) {
            $msg = 'Payment received. Change due: '.number_format($change).' FCFA.';
        }

        return back()->with('success', $msg);
    }

    /**
     * Push a live Mobile Money request to the patient's phone via Fapshi.
     * When the gateway is disabled, this records a manual MoMo receipt instead.
     */
    public function charge(Request $request, Invoice $invoice, FapshiClient $fapshi)
    {
        $data = $request->validate([
            'amount' => 'required|integer|min:1',
            'phone' => 'required|string|max:20',
            'reference' => 'nullable|string|max:120',
        ]);

        if ($fapshi->enabled()) {
            try {
                $res = $fapshi->directPay(
                    $data['amount'],
                    $data['phone'],
                    $invoice->patient?->full_name,
                    $invoice->reference ?? (string) $invoice->id,
                );
            } catch (\Throwable $e) {
                return back()->with('error', $e->getMessage());
            }

            $invoice->payments()->create([
                'method' => 'momo',
                'provider' => 'fapshi',
                'status' => 'pending',
                'reference' => $res['transId'],
                'amount' => $data['amount'],
                'received_by' => auth()->id(),
                'received_at' => null,
                'raw' => $res,
            ]);

            return back()->with('success', 'Mobile Money request sent to '.$data['phone'].'. Ask the patient to approve it on their phone, then check the status.');
        }

        // Gateway off — cashier records the MoMo receipt manually.
        $invoice->payments()->create([
            'method' => 'momo',
            'provider' => 'fapshi',
            'status' => 'confirmed',
            'reference' => $data['reference'] ?? null,
            'amount' => $data['amount'],
            'received_by' => auth()->id(),
            'received_at' => now(),
        ]);
        $invoice->refreshStatus();

        return back()->with('success', 'Mobile Money payment recorded.');
    }

    /** Poll Fapshi for a pending MoMo charge and settle it when approved. */
    public function paymentStatus(Invoice $invoice, Payment $payment, FapshiClient $fapshi)
    {
        abort_unless($payment->invoice_id === $invoice->id, 404);

        if ($payment->status !== 'pending' || ! $payment->reference) {
            return back();
        }

        try {
            $res = $fapshi->status($payment->reference);
        } catch (\Throwable $e) {
            return back()->with('error', $e->getMessage());
        }

        $state = strtoupper($res['status'] ?? '');

        if ($state === 'SUCCESSFUL') {
            $payment->update(['status' => 'confirmed', 'received_at' => now(), 'raw' => $res]);
            $invoice->refreshStatus();

            return back()->with('success', 'Mobile Money payment confirmed.');
        }

        if (in_array($state, ['FAILED', 'EXPIRED'], true)) {
            $payment->update(['status' => 'failed', 'raw' => $res]);

            return back()->with('error', 'Mobile Money payment '.strtolower($state).'.');
        }

        return back()->with('success', 'Still pending — ask the patient to approve the prompt on their phone.');
    }

    public function receipt(Invoice $invoice)
    {
        $invoice->load(['patient', 'items', 'payments']);

        return view('receipt', ['inv' => $invoice]);
    }

    public function report(Request $request)
    {
        $date = $request->query('date', now()->toDateString());
        $payments = Payment::where('status', 'confirmed')->whereDate('received_at', $date)->get();
        $byMethod = $payments->groupBy('method');
        $sum = fn ($m) => (int) ($byMethod[$m]?->sum('amount') ?? 0);
        $cnt = fn ($m) => (int) ($byMethod[$m]?->count() ?? 0);

        return Inertia::render('Billing/Report', [
            'date' => $date,
            'cash' => ['count' => $cnt('cash'), 'total' => $sum('cash')],
            'momo' => ['count' => $cnt('momo'), 'total' => $sum('momo')],
            'total' => (int) $payments->sum('amount'),
            'count' => $payments->count(),
        ]);
    }
}
