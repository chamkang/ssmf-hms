<?php

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Encounter;
use App\Models\Patient;
use App\Models\Service;
use App\Models\User;
use App\Services\SlotEngine;
use Database\Seeders\ServicesDoctorsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(ServicesDoctorsSeeder::class);
    $this->user = staffUser();
});

function makePatient(string $last = 'Test'): Patient
{
    return Patient::create([
        'first_name' => 'Awa',
        'last_name' => $last,
        'phone' => '+2376'.random_int(10000000, 99999999),
        'language' => 'fr',
    ]);
}

test('a patient can be booked into an available slot and receives a reference', function () {
    $doctor = Doctor::first();
    $service = Service::first();
    $date = Carbon::now()->next(Carbon::TUESDAY)->toDateString();

    $slots = SlotEngine::available($doctor->id, $date);
    expect($slots)->not->toBeEmpty();

    $this->actingAs($this->user)->post('/appointments', [
        'patient_id' => makePatient()->id,
        'doctor_id' => $doctor->id,
        'service_id' => $service->id,
        'date' => $date,
        'time' => $slots[0],
    ])->assertRedirect();

    $appt = Appointment::first();
    expect($appt)->not->toBeNull();
    expect($appt->reference)->toStartWith('SSMF-');
    expect($appt->status)->toBe('confirmed');
});

test('the same slot cannot be double-booked', function () {
    $doctor = Doctor::first();
    $service = Service::first();
    $date = Carbon::now()->next(Carbon::TUESDAY)->toDateString();
    $time = SlotEngine::available($doctor->id, $date)[0];

    $payload = fn (int $pid) => [
        'patient_id' => $pid, 'doctor_id' => $doctor->id, 'service_id' => $service->id, 'date' => $date, 'time' => $time,
    ];

    $this->actingAs($this->user)->post('/appointments', $payload(makePatient('One')->id))->assertRedirect();
    $this->actingAs($this->user)->post('/appointments', $payload(makePatient('Two')->id))->assertSessionHasErrors('time');

    expect(Appointment::count())->toBe(1);
});

test('check-in creates a waiting encounter and advance moves the stage', function () {
    $patient = makePatient();

    $this->actingAs($this->user)->post('/flow-board/check-in', ['patient_id' => $patient->id])->assertRedirect();
    $encounter = Encounter::first();
    expect($encounter->stage)->toBe('waiting');
    expect($encounter->status)->toBe('open');

    $this->actingAs($this->user)->patch("/encounters/{$encounter->id}/advance", ['stage' => 'vitals'])->assertRedirect();
    expect($encounter->fresh()->stage)->toBe('vitals');

    $this->actingAs($this->user)->patch("/encounters/{$encounter->id}/advance", ['stage' => 'done'])->assertRedirect();
    expect($encounter->fresh()->status)->toBe('closed');
});
