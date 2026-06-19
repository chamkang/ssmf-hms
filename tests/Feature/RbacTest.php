<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('a pharmacist reaches pharmacy but is blocked from patient management', function () {
    $pharmacist = staffUser('pharmacist');

    $this->actingAs($pharmacist)->get(route('pharmacy.queue'))->assertOk();
    $this->actingAs($pharmacist)->get(route('patients.index'))->assertOk(); // has patients.view
    $this->actingAs($pharmacist)->get(route('patients.create'))->assertForbidden();
    $this->actingAs($pharmacist)->get(route('billing.index'))->assertForbidden();
});

test('a receptionist reaches reception and billing but not the pharmacy or lab', function () {
    $receptionist = staffUser('receptionist');

    $this->actingAs($receptionist)->get(route('patients.create'))->assertOk();
    $this->actingAs($receptionist)->get(route('flow-board'))->assertOk();
    $this->actingAs($receptionist)->get(route('billing.index'))->assertOk();
    $this->actingAs($receptionist)->get(route('pharmacy.queue'))->assertForbidden();
    $this->actingAs($receptionist)->get(route('lab.index'))->assertForbidden();
});

test('a cashier reaches billing and reports but not clinical consultations', function () {
    $cashier = staffUser('cashier');

    $this->actingAs($cashier)->get(route('billing.index'))->assertOk();
    $this->actingAs($cashier)->get(route('reports.index'))->assertOk();
    $this->actingAs($cashier)->get(route('patients.create'))->assertForbidden();
});

test('a laboratory user reaches the lab but not pharmacy or billing', function () {
    $lab = staffUser('laboratory');

    $this->actingAs($lab)->get(route('lab.index'))->assertOk();
    $this->actingAs($lab)->get(route('pharmacy.queue'))->assertForbidden();
    $this->actingAs($lab)->get(route('billing.index'))->assertForbidden();
});

test('the administrator reaches every protected area', function () {
    $admin = staffUser('admin');

    foreach ([
        'patients.index', 'patients.create', 'appointments.index', 'flow-board',
        'lab.index', 'pharmacy.queue', 'billing.index', 'reports.index', 'audit.index',
    ] as $name) {
        $this->actingAs($admin)->get(route($name))->assertOk();
    }
});

test('a user with no role is forbidden from protected areas', function () {
    // Seed roles/permissions so the gates exist, then create a role-less user.
    (new \Database\Seeders\RolesAndAdminSeeder)->run();
    $nobody = \App\Models\User::factory()->create();

    $this->actingAs($nobody)->get(route('patients.index'))->assertForbidden();
    $this->actingAs($nobody)->get(route('billing.index'))->assertForbidden();
});
