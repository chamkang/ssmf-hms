<?php

use App\Models\Invoice;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
});

test('dashboard, reports and audit pages load for an authenticated user', function () {
    $this->actingAs($this->user)->get(route('dashboard'))->assertOk();
    $this->actingAs($this->user)->get(route('reports.index'))->assertOk();
    $this->actingAs($this->user)->get(route('audit.index'))->assertOk();
});

test('reports reflect a payment taken today', function () {
    $patient = Patient::create(['first_name' => 'Awa', 'last_name' => 'Test', 'phone' => '+237600000099', 'language' => 'en']);
    $inv = Invoice::create(['patient_id' => $patient->id, 'status' => 'open', 'currency' => 'XAF']);
    $inv->items()->create(['label' => 'Consultation', 'qty' => 1, 'unit_price' => 5000, 'amount' => 5000]);
    $inv->payments()->create(['method' => 'cash', 'amount' => 5000, 'received_by' => $this->user->id, 'received_at' => now()]);

    $this->actingAs($this->user)->get(route('reports.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('Reports/Index')
            ->where('revenue.today', 5000)
            ->where('revenue.cash_month', 5000)
        );
});
