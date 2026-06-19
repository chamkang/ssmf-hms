<?php

use App\Models\Dispense;
use App\Models\Drug;
use App\Models\LabOrder;
use App\Models\LabTest;
use App\Models\Patient;
use App\Models\Prescription;
use App\Models\StockBatch;
use App\Models\User;
use Database\Seeders\ClinicalRefSeeder;
use Database\Seeders\LabTestSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(LabTestSeeder::class);
    $this->seed(ClinicalRefSeeder::class);
    $this->user = User::factory()->create();
});

function aPatient(): Patient
{
    return Patient::create(['first_name' => 'Awa', 'last_name' => 'Test', 'phone' => '+2376'.random_int(10000000, 99999999), 'language' => 'en']);
}

test('a lab order is created with a reference, then results are entered and auto-flagged', function () {
    $patient = aPatient();
    $hb = LabTest::where('code', 'HB')->first(); // ref 12–16

    $this->actingAs($this->user)->post(route('lab.store'), [
        'patient_id' => $patient->id,
        'test_ids' => [$hb->id],
    ])->assertRedirect();

    $order = LabOrder::first();
    expect($order->reference)->toStartWith('SSMF-LAB-');
    expect($order->items)->toHaveCount(1);

    $item = $order->items->first();
    $this->actingAs($this->user)->patch(route('lab.results', $order), [
        'results' => [['id' => $item->id, 'value' => '10']], // below ref_low -> low
        'validate' => true,
    ])->assertRedirect();

    expect($item->fresh()->flag)->toBe('low');
    expect($order->fresh()->status)->toBe('validated');
});

test('dispensing marks a prescription dispensed and stock can be received', function () {
    $patient = aPatient();
    $rx = Prescription::create([
        'patient_id' => $patient->id, 'user_id' => $this->user->id, 'issued_at' => now(), 'status' => 'active',
    ]);
    $rx->items()->create(['drug_text' => 'Paracetamol 500 mg tablet', 'dose' => '1 tab']);

    $this->actingAs($this->user)->patch(route('pharmacy.dispense', $rx))->assertRedirect();
    expect($rx->fresh()->status)->toBe('dispensed');
    expect(Dispense::count())->toBe(1);

    $drug = Drug::first();
    $this->actingAs($this->user)->post(route('pharmacy.add-stock'), [
        'drug_id' => $drug->id, 'batch_no' => 'B-001', 'quantity' => 50, 'expiry_date' => now()->addYear()->toDateString(),
    ])->assertRedirect();
    expect(StockBatch::count())->toBe(1);
});
