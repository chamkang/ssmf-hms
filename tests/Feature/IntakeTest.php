<?php

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\IntakeBooking;
use App\Models\Patient;
use App\Models\Service;
use Database\Seeders\ServicesDoctorsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;

uses(RefreshDatabase::class);

beforeEach(function () {
    config()->set('services.intake.token', 'secret-token');
});

test('the intake endpoint rejects a missing or wrong token', function () {
    $this->postJson(route('api.intake.bookings'), ['first_name' => 'A', 'last_name' => 'B'])
        ->assertUnauthorized();

    $this->withHeaders(['Authorization' => 'Bearer wrong'])
        ->postJson(route('api.intake.bookings'), ['first_name' => 'A', 'last_name' => 'B'])
        ->assertUnauthorized();
});

test('a web booking creates a patient and a pending intake', function () {
    $res = $this->withHeaders(['Authorization' => 'Bearer secret-token'])
        ->postJson(route('api.intake.bookings'), [
            'web_reference' => 'WEB-1',
            'first_name' => 'Awa', 'last_name' => 'Online', 'phone' => '+237670000123', 'language' => 'fr',
            'reason' => 'Consultation',
        ]);

    $res->assertCreated()->assertJsonPath('status', 'pending');
    $intake = IntakeBooking::first();
    expect($intake->status)->toBe('pending');
    expect($intake->patient_id)->not->toBeNull();
    expect(Patient::where('phone', '+237670000123')->exists())->toBeTrue();
});

test('a repeated web_reference is idempotent and matches an existing patient by phone', function () {
    $patient = Patient::create(['first_name' => 'Existing', 'last_name' => 'Patient', 'phone' => '+237670000999', 'language' => 'fr']);

    $first = $this->withHeaders(['Authorization' => 'Bearer secret-token'])
        ->postJson(route('api.intake.bookings'), ['web_reference' => 'WEB-2', 'first_name' => 'X', 'last_name' => 'Y', 'phone' => '+237670000999']);
    $first->assertCreated();
    expect(IntakeBooking::first()->patient_id)->toBe($patient->id); // matched, not created

    // same reference again -> no duplicate
    $this->withHeaders(['Authorization' => 'Bearer secret-token'])
        ->postJson(route('api.intake.bookings'), ['web_reference' => 'WEB-2', 'first_name' => 'X', 'last_name' => 'Y', 'phone' => '+237670000999'])
        ->assertOk()->assertJsonPath('duplicate', true);

    expect(IntakeBooking::count())->toBe(1);
    expect(Patient::count())->toBe(1);
});

test('reception converts an intake into a confirmed appointment', function () {
    $this->seed(ServicesDoctorsSeeder::class);
    $user = staffUser('receptionist');
    $patient = Patient::create(['first_name' => 'Awa', 'last_name' => 'Web', 'phone' => '+237670000222', 'language' => 'fr']);
    $intake = IntakeBooking::create(['first_name' => 'Awa', 'last_name' => 'Web', 'phone' => '+237670000222', 'status' => 'pending', 'patient_id' => $patient->id]);

    $doctor = Doctor::first();
    $service = Service::first();
    $date = Carbon::now()->next(Carbon::TUESDAY)->toDateString();
    $time = \App\Services\SlotEngine::available($doctor->id, $date)[0];

    $this->actingAs($user)->post(route('intake.convert', $intake), [
        'doctor_id' => $doctor->id, 'service_id' => $service->id, 'date' => $date, 'time' => $time,
    ])->assertRedirect();

    $intake->refresh();
    expect($intake->status)->toBe('converted');
    expect($intake->appointment_id)->not->toBeNull();
    expect(Appointment::find($intake->appointment_id)->source)->toBe('website');
});

test('reception can dismiss a booking, and non-reception staff cannot view the queue', function () {
    $intake = IntakeBooking::create(['first_name' => 'A', 'last_name' => 'B', 'status' => 'pending']);

    $this->actingAs(staffUser('receptionist'))->post(route('intake.reject', $intake))->assertRedirect();
    expect($intake->fresh()->status)->toBe('rejected');

    $this->actingAs(staffUser('pharmacist'))->get(route('intake.index'))->assertForbidden();
});
