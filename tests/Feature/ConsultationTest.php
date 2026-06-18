<?php

use App\Models\Consultation;
use App\Models\Patient;
use App\Models\Prescription;
use App\Models\User;
use Database\Seeders\ClinicalRefSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('a consultation saves SOAP, a diagnosis and a prescription, and can be signed', function () {
    $user = User::factory()->create();
    $patient = Patient::create([
        'first_name' => 'Awa', 'last_name' => 'Test', 'phone' => '+237600000010', 'language' => 'en',
    ]);

    $this->actingAs($user)->post(route('consultations.store'), [
        'patient_id' => $patient->id,
        'subjective' => 'Headache for 2 days',
        'assessment' => 'Migraine',
        'sign' => true,
        'vitals' => ['temp' => '37.2', 'bp_sys' => '120', 'bp_dia' => '80'],
        'diagnoses' => [['label' => 'G43 — Migraine', 'icd10_code' => 'G43', 'is_primary' => true]],
        'items' => [['drug_text' => 'Paracetamol 500 mg tablet', 'dose' => '1 tab', 'frequency' => '3x/day', 'duration' => '3 days']],
    ])->assertRedirect();

    $c = Consultation::first();
    expect($c)->not->toBeNull();
    expect($c->signed_at)->not->toBeNull();
    expect($c->diagnoses)->toHaveCount(1);

    $rx = Prescription::first();
    expect($rx)->not->toBeNull();
    expect($rx->items)->toHaveCount(1);
});

test('the ICD-10 lookup returns matches', function () {
    $this->seed(ClinicalRefSeeder::class);
    $user = User::factory()->create();

    $res = $this->actingAs($user)->getJson(route('lookup.icd10').'?q=hyperten');
    $res->assertOk();
    expect($res->json())->not->toBeEmpty();
});
