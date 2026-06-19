<?php

use App\Models\Invoice;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = staffUser();
});

function billingPatient(): Patient
{
    return Patient::create(['first_name' => 'Awa', 'last_name' => 'Test', 'phone' => '+2376'.random_int(10000000, 99999999), 'language' => 'en']);
}

function openInvoice(int $patientId, int $amount): Invoice
{
    $inv = Invoice::create(['patient_id' => $patientId, 'status' => 'open', 'currency' => 'XAF']);
    $inv->items()->create(['label' => 'Consultation', 'qty' => 1, 'unit_price' => $amount, 'amount' => $amount]);

    return $inv;
}

test('an invoice is created with a reference and a computed total', function () {
    $patient = billingPatient();

    $this->actingAs($this->user)->post(route('billing.store'), [
        'patient_id' => $patient->id,
        'items' => [
            ['label' => 'Consultation', 'qty' => 1, 'unit_price' => 5000, 'source_type' => 'tariff'],
            ['label' => 'Lab — FBC', 'qty' => 1, 'unit_price' => 3000, 'source_type' => 'lab'],
        ],
    ])->assertRedirect();

    $inv = Invoice::first();
    expect($inv->reference)->toStartWith('SSMF-INV-');
    expect($inv->total)->toBe(8000);
    expect($inv->balance)->toBe(8000);
    expect($inv->status)->toBe('open');
});

test('a cash payment computes change and moves the invoice from part-paid to paid', function () {
    $patient = billingPatient();
    $inv = openInvoice($patient->id, 5000);

    // partial cash payment
    $this->actingAs($this->user)->post(route('billing.pay', $inv), ['method' => 'cash', 'amount' => 2000, 'tendered' => 2000])->assertRedirect();
    expect($inv->fresh()->status)->toBe('part_paid');
    expect($inv->fresh()->balance)->toBe(3000);

    // settle the rest, paying with a 5000 note -> 2000 change
    $this->actingAs($this->user)->post(route('billing.pay', $inv), ['method' => 'cash', 'amount' => 3000, 'tendered' => 5000])->assertRedirect();
    $inv->refresh();
    expect($inv->status)->toBe('paid');
    expect($inv->balance)->toBe(0);
    expect($inv->payments()->latest('id')->first()->change_due)->toBe(2000);
});

test('a mobile-money payment is recorded against the invoice', function () {
    $patient = billingPatient();
    $inv = openInvoice($patient->id, 5000);

    $this->actingAs($this->user)->post(route('billing.pay', $inv), ['method' => 'momo', 'amount' => 5000, 'reference' => 'TX-123'])->assertRedirect();
    $inv->refresh();
    expect($inv->status)->toBe('paid');
    expect($inv->payments()->first()->provider)->toBe('fapshi');
});
