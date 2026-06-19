<?php

namespace App\Http\Controllers;

use App\Models\LabOrder;
use App\Models\LabTest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LabController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->query('status', 'active');

        $orders = LabOrder::with(['patient', 'items'])
            ->when($status === 'active', fn ($q) => $q->whereIn('status', ['ordered', 'resulted']))
            ->when(! in_array($status, ['active', 'all'], true), fn ($q) => $q->where('status', $status))
            ->latest()
            ->limit(100)
            ->get();

        return Inertia::render('Lab/Index', ['orders' => $orders, 'status' => $status]);
    }

    public function create()
    {
        return Inertia::render('Lab/Create', [
            'tests' => LabTest::where('is_active', true)->orderBy('sort_order')
                ->get(['id', 'code', 'name', 'price', 'unit', 'specimen']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'test_ids' => 'required|array|min:1',
            'test_ids.*' => 'exists:lab_tests,id',
            'notes' => 'nullable|string|max:500',
        ]);

        $order = LabOrder::create([
            'patient_id' => $data['patient_id'],
            'ordered_by' => auth()->id(),
            'status' => 'ordered',
            'notes' => $data['notes'] ?? null,
        ]);

        foreach (LabTest::whereIn('id', $data['test_ids'])->get() as $t) {
            $order->items()->create([
                'lab_test_id' => $t->id, 'name' => $t->name, 'unit' => $t->unit,
                'ref_low' => $t->ref_low, 'ref_high' => $t->ref_high,
            ]);
        }

        return redirect()->route('lab.show', $order)->with('success', "Lab order {$order->reference} created.");
    }

    public function show(LabOrder $lab)
    {
        $lab->load(['patient', 'items']);

        return Inertia::render('Lab/Show', ['order' => $lab]);
    }

    public function results(Request $request, LabOrder $lab)
    {
        $data = $request->validate([
            'results' => 'array',
            'results.*.id' => 'required|exists:lab_order_items,id',
            'results.*.value' => 'nullable|string|max:120',
            'validate' => 'boolean',
        ]);

        foreach (($data['results'] ?? []) as $row) {
            $item = $lab->items()->find($row['id']);
            if (! $item) {
                continue;
            }
            $value = $row['value'] ?? null;
            $flag = null;
            if ($value !== null && $value !== '' && is_numeric($value)) {
                if ($item->ref_low !== null && (float) $value < (float) $item->ref_low) {
                    $flag = 'low';
                } elseif ($item->ref_high !== null && (float) $value > (float) $item->ref_high) {
                    $flag = 'high';
                } elseif ($item->ref_low !== null || $item->ref_high !== null) {
                    $flag = 'normal';
                }
            }
            $item->update([
                'value' => $value,
                'flag' => $flag,
                'resulted_at' => ($value !== null && $value !== '') ? now() : null,
            ]);
        }

        $lab->update(['status' => ! empty($data['validate']) ? 'validated' : 'resulted']);

        return back()->with('success', ! empty($data['validate']) ? 'Results validated.' : 'Results saved.');
    }
}
