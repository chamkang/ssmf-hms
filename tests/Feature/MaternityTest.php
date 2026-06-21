<?php

use App\Models\Patient;
use App\Models\Pregnancy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;

uses(RefreshDatabase::class);

function ancPatient(): Patient
{
    return Patient::create(['first_name' => 'Awa', 'last_name' => 'Expecting', 'sex' => 'F', 'phone' => '+2376'.random_int(10000000, 99999999), 'language' => 'fr']);
}

test('an antenatal record gets an OB reference and an EDD from the LMP', function () {
    $user = staffUser('midwife');
    $lmp = '2026-01-01';

    $this->actingAs($user)->post(route('maternity.store'), [
        'patient_id' => ancPatient()->id,
        'lmp' => $lmp,
        'gravida' => 2, 'para' => 1,
    ])->assertRedirect();

    $p = Pregnancy::first();
    expect($p->reference)->toStartWith('SSMF-OB-');
    expect($p->edd->toDateString())->toBe(Carbon::parse($lmp)->addDays(280)->toDateString());
});

test('an ANC visit computes gestational age from the LMP', function () {
    $user = staffUser('midwife');
    $p = Pregnancy::create(['patient_id' => ancPatient()->id, 'lmp' => now()->subWeeks(12)->toDateString(), 'status' => 'active', 'risk_level' => 'low']);

    $this->actingAs($user)->post(route('maternity.anc.store', $p), [
        'visit_on' => now()->toDateString(),
        'bp_sys' => 120, 'bp_dia' => 80, 'fundal_height' => 12,
    ])->assertRedirect();

    $v = $p->ancVisits()->first();
    expect($v->ga_weeks)->toBe(12);
});

test('a partograph entry is recorded during labour', function () {
    $user = staffUser('midwife');
    $p = Pregnancy::create(['patient_id' => ancPatient()->id, 'status' => 'active', 'risk_level' => 'low']);

    $this->actingAs($user)->post(route('maternity.partograph.store', $p), [
        'recorded_at' => now()->toDateTimeString(),
        'cervix_cm' => 4, 'fetal_heart_rate' => 140, 'contractions_per10' => 3, 'liquor' => 'C',
    ])->assertRedirect();

    expect($p->partographEntries()->count())->toBe(1);
});

test('saving a delivery upserts and marks the pregnancy delivered', function () {
    $user = staffUser('midwife');
    $p = Pregnancy::create(['patient_id' => ancPatient()->id, 'status' => 'active', 'risk_level' => 'low']);

    $this->actingAs($user)->post(route('maternity.delivery.save', $p), [
        'delivered_at' => now()->toDateTimeString(), 'mode' => 'SVD', 'outcome' => 'live birth', 'baby_sex' => 'F', 'birth_weight' => 3.2, 'apgar_1' => 8, 'apgar_5' => 9,
    ])->assertRedirect();

    $this->actingAs($user)->post(route('maternity.delivery.save', $p), [
        'delivered_at' => now()->toDateTimeString(), 'mode' => 'C-section', 'outcome' => 'live birth',
    ])->assertRedirect();

    expect($p->delivery()->count())->toBe(1); // upsert
    expect($p->delivery()->first()->mode)->toBe('C-section');
    expect($p->fresh()->status)->toBe('delivered');
});

test('staff without maternity.manage cannot reach the module', function () {
    $this->actingAs(staffUser('cashier'))->get(route('maternity.index'))->assertForbidden();
});
