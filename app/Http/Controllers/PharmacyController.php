<?php

namespace App\Http\Controllers;

use App\Models\Dispense;
use App\Models\Drug;
use App\Models\Prescription;
use App\Models\StockBatch;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PharmacyController extends Controller
{
    public function queue()
    {
        return Inertia::render('Pharmacy/Queue', [
            'prescriptions' => Prescription::with(['patient', 'items', 'author'])
                ->where('status', 'active')
                ->latest()->limit(100)->get(),
        ]);
    }

    public function dispense(Request $request, Prescription $prescription)
    {
        if ($prescription->status === 'active') {
            Dispense::create([
                'prescription_id' => $prescription->id,
                'dispensed_by' => auth()->id(),
                'dispensed_at' => now(),
                'note' => $request->input('note'),
            ]);
            $prescription->update(['status' => 'dispensed']);
        }

        return back()->with('success', 'Prescription dispensed.');
    }

    public function inventory()
    {
        return Inertia::render('Pharmacy/Inventory', [
            'batches' => StockBatch::with('drug')->orderBy('expiry_date')->get(),
            'drugs' => Drug::where('is_active', true)->orderBy('name')->get(['id', 'name', 'strength', 'form']),
            'today' => now()->toDateString(),
        ]);
    }

    public function addStock(Request $request)
    {
        $data = $request->validate([
            'drug_id' => 'required|exists:drugs,id',
            'batch_no' => 'nullable|string|max:60',
            'quantity' => 'required|integer|min:1',
            'expiry_date' => 'nullable|date',
        ]);
        StockBatch::create($data);

        return back()->with('success', 'Stock added.');
    }
}
