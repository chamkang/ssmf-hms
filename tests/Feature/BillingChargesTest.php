<?php

use App\Models\Drug;
use App\Models\LabOrder;
use App\Models\LabTest;
use App\Models\Patient;
use App\Models\Prescription;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function chargesPatient(): Patient
{
    return Patient::create(['first_name' => 'Awa', 'last_name' => 'Charges', 'phone' => '+2376'.random_int(10000000, 99999999), 'language' => 'en']);
}

test('chargeable suggests unbilled lab and pharmacy work, then drops them once invoiced', function () {
    $user = staffUser();
    $patient = chargesPatient();

    // a validated lab order: two tests priced 3000 + 2000
    $t1 = LabTest::create(['code' => 'X1', 'name' => 'Test One', 'price' => 3000]);
    $t2 = LabTest::create(['code' => 'X2', 'name' => 'Test Two', 'price' => 2000]);
    $order = LabOrder::create(['patient_id' => $patient->id, 'status' => 'validated']);
    $order->items()->create(['lab_test_id' => $t1->id, 'name' => $t1->name]);
    $order->items()->create(['lab_test_id' => $t2->id, 'name' => $t2->name]);

    // a dispensed prescription: one drug priced 1500
    $drug = Drug::create(['name' => 'Paracetamol', 'price' => 1500]);
    $rx = Prescription::create(['patient_id' => $patient->id, 'status' => 'dispensed', 'issued_at' => now()]);
    $rx->items()->create(['drug_id' => $drug->id, 'drug_text' => 'Paracetamol 500mg']);

    // suggestions appear with computed totals
    $res = $this->actingAs($user)->getJson(route('billing.chargeable', ['patient_id' => $patient->id]));
    $res->assertOk();
    $lines = collect($res->json());
    expect($lines)->toHaveCount(2);
    expect($lines->firstWhere('source_type', 'lab')['unit_price'])->toBe(5000);
    expect($lines->firstWhere('source_type', 'pharmacy')['unit_price'])->toBe(1500);

    // invoice the lab line (carrying its source) — it should no longer be suggested
    $this->actingAs($user)->post(route('billing.store'), [
        'patient_id' => $patient->id,
        'items' => [
            ['label' => "Lab — {$order->reference}", 'qty' => 1, 'unit_price' => 5000, 'source_type' => 'lab', 'source_id' => $order->id],
        ],
    ])->assertRedirect();

    $after = collect($this->actingAs($user)->getJson(route('billing.chargeable', ['patient_id' => $patient->id]))->json());
    expect($after)->toHaveCount(1);
    expect($after->first()['source_type'])->toBe('pharmacy');
});

test('an undispensed prescription is not suggested', function () {
    $user = staffUser();
    $patient = chargesPatient();
    $drug = Drug::create(['name' => 'Amoxicillin', 'price' => 2000]);
    $rx = Prescription::create(['patient_id' => $patient->id, 'status' => 'active', 'issued_at' => now()]); // not dispensed
    $rx->items()->create(['drug_id' => $drug->id, 'drug_text' => 'Amoxicillin 500mg']);

    $lines = collect($this->actingAs($user)->getJson(route('billing.chargeable', ['patient_id' => $patient->id]))->json());
    expect($lines)->toHaveCount(0);
});
