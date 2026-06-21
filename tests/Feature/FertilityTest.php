<?php

use App\Models\ArtCycle;
use App\Models\FertilityCase;
use App\Models\Patient;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function femalePatient(): Patient
{
    return Patient::create(['first_name' => 'Awa', 'last_name' => 'Female', 'sex' => 'F', 'phone' => '+2376'.random_int(10000000, 99999999), 'language' => 'fr']);
}

function malePatient(): Patient
{
    return Patient::create(['first_name' => 'Eric', 'last_name' => 'Male', 'sex' => 'M', 'phone' => '+2376'.random_int(10000000, 99999999), 'language' => 'fr']);
}

test('a fertility case links a couple and gets an ART reference', function () {
    $user = staffUser('doctor');
    $f = femalePatient();
    $m = malePatient();

    $this->actingAs($user)->post(route('fertility.store'), [
        'female_patient_id' => $f->id,
        'male_patient_id' => $m->id,
        'diagnosis' => 'Tubal factor',
    ])->assertRedirect();

    $case = FertilityCase::first();
    expect($case->reference)->toStartWith('SSMF-ART-');
    expect($case->female_patient_id)->toBe($f->id);
    expect($case->male_patient_id)->toBe($m->id);
});

test('starting a cycle references it and activates the case', function () {
    $user = staffUser('doctor');
    $case = FertilityCase::create(['female_patient_id' => femalePatient()->id, 'status' => 'open']);

    $this->actingAs($user)->post(route('fertility.cycles.store', $case), [
        'type' => 'IVF', 'protocol' => 'antagonist', 'started_on' => now()->toDateString(),
    ])->assertRedirect();

    $cycle = ArtCycle::first();
    expect($cycle->reference)->toStartWith('SSMF-CYC-');
    expect($cycle->type)->toBe('IVF');
    expect($case->fresh()->status)->toBe('active');
});

test('a monitoring visit parses follicle sizes and computes the lead follicle', function () {
    $user = staffUser('doctor');
    $case = FertilityCase::create(['female_patient_id' => femalePatient()->id, 'status' => 'active']);
    $cycle = $case->cycles()->create(['type' => 'IVF', 'status' => 'stimulating']);

    $this->actingAs($user)->post(route('fertility.monitorings.store', $cycle), [
        'monitored_on' => now()->toDateString(),
        'endo_mm' => 9.5,
        'right_follicles' => '12, 16, 14',
        'left_follicles' => '13',
        'e2' => 850,
    ])->assertRedirect();

    $m = $cycle->monitorings()->first();
    expect(array_map('floatval', $m->right_follicles))->toBe([12.0, 14.0, 16.0]); // parsed + sorted
    expect($m->follicle_count)->toBe(4);
    expect($m->lead_follicle)->toBe(16.0);
});

test('embryology is upserted — created then updated for the same cycle', function () {
    $user = staffUser('embryologist');
    $case = FertilityCase::create(['female_patient_id' => femalePatient()->id, 'status' => 'active']);
    $cycle = $case->cycles()->create(['type' => 'ICSI', 'status' => 'retrieved']);

    $this->actingAs($user)->post(route('fertility.embryology.save', $cycle), [
        'oocytes_retrieved' => 10, 'mature_mii' => 8, 'fertilization_method' => 'ICSI', 'fertilized_2pn' => 6,
    ])->assertRedirect();

    $this->actingAs($user)->post(route('fertility.embryology.save', $cycle), [
        'oocytes_retrieved' => 10, 'mature_mii' => 8, 'fertilized_2pn' => 6, 'blastocysts' => 3,
        'embryos_transferred' => 1, 'embryos_frozen' => 2, 'clinical_pregnancy' => true, 'outcome' => 'ongoing',
    ])->assertRedirect();

    expect($cycle->embryology()->count())->toBe(1); // upsert, not duplicated
    $e = $cycle->embryology()->first();
    expect($e->blastocysts)->toBe(3);
    expect($e->clinical_pregnancy)->toBeTrue();
});

test('staff without fertility.manage cannot reach the module', function () {
    $receptionist = staffUser('receptionist');

    $this->actingAs($receptionist)->get(route('fertility.index'))->assertForbidden();
    $this->actingAs($receptionist)->get(route('fertility.create'))->assertForbidden();
});
