<?php

use App\Models\Admission;
use App\Models\Bed;
use App\Models\Patient;
use Database\Seeders\WardsBedsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(WardsBedsSeeder::class);
});

function ipdPatient(): Patient
{
    return Patient::create(['first_name' => 'Awa', 'last_name' => 'Inpatient', 'phone' => '+2376'.random_int(10000000, 99999999), 'language' => 'fr']);
}

test('admitting a patient references the admission and occupies the bed', function () {
    $user = staffUser('nurse');
    $bed = Bed::first();

    $this->actingAs($user)->post(route('inpatient.store'), [
        'patient_id' => ipdPatient()->id, 'bed_id' => $bed->id, 'reason' => 'labour',
    ])->assertRedirect();

    $adm = Admission::first();
    expect($adm->reference)->toStartWith('SSMF-ADM-');
    expect($adm->status)->toBe('active');
    expect($bed->fresh()->is_occupied)->toBeTrue();
});

test('a bed already occupied cannot be double-assigned', function () {
    $user = staffUser('nurse');
    $bed = Bed::first();
    Admission::create(['patient_id' => ipdPatient()->id, 'bed_id' => $bed->id, 'status' => 'active', 'admitted_at' => now()]);

    $this->actingAs($user)->post(route('inpatient.store'), [
        'patient_id' => ipdPatient()->id, 'bed_id' => $bed->id,
    ])->assertSessionHasErrors('bed_id');
});

test('a progress note can be added to an admission', function () {
    $user = staffUser('nurse');
    $adm = Admission::create(['patient_id' => ipdPatient()->id, 'bed_id' => Bed::first()->id, 'status' => 'active', 'admitted_at' => now()]);

    $this->actingAs($user)->post(route('inpatient.notes.store', $adm), [
        'kind' => 'round', 'note' => 'Stable overnight.', 'temp' => 37, 'pulse' => 78,
    ])->assertRedirect();

    expect($adm->notes()->count())->toBe(1);
});

test('discharge frees the bed and closes the admission', function () {
    $user = staffUser('nurse');
    $bed = Bed::first();
    $adm = Admission::create(['patient_id' => ipdPatient()->id, 'bed_id' => $bed->id, 'status' => 'active', 'admitted_at' => now()]);

    $this->actingAs($user)->patch(route('inpatient.discharge', $adm), ['discharge_summary' => 'Recovered well.'])->assertRedirect();

    $adm->refresh();
    expect($adm->status)->toBe('discharged');
    expect($adm->discharged_at)->not->toBeNull();
    expect($bed->fresh()->is_occupied)->toBeFalse();
});

test('a patient can be transferred to a free bed', function () {
    $user = staffUser('nurse');
    $beds = Bed::take(2)->get();
    $adm = Admission::create(['patient_id' => ipdPatient()->id, 'bed_id' => $beds[0]->id, 'status' => 'active', 'admitted_at' => now()]);

    $this->actingAs($user)->patch(route('inpatient.transfer', $adm), ['bed_id' => $beds[1]->id])->assertRedirect();

    expect($adm->fresh()->bed_id)->toBe($beds[1]->id);
});

test('staff without inpatient.manage cannot reach the module', function () {
    $this->actingAs(staffUser('cashier'))->get(route('inpatient.board'))->assertForbidden();
});
