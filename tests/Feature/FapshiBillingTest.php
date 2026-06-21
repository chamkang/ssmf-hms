<?php

use App\Models\Invoice;
use App\Models\Patient;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

function chargePatient(): Patient
{
    return Patient::create(['first_name' => 'Awa', 'last_name' => 'Test', 'phone' => '+237670000000', 'language' => 'en']);
}

function chargeInvoice(int $patientId, int $amount): Invoice
{
    $inv = Invoice::create(['patient_id' => $patientId, 'status' => 'open', 'currency' => 'XAF']);
    $inv->items()->create(['label' => 'Consultation', 'qty' => 1, 'unit_price' => $amount, 'amount' => $amount]);

    return $inv;
}

test('when the gateway is enabled a momo charge pushes a request and stays pending', function () {
    config()->set('services.fapshi.enabled', true);
    config()->set('services.fapshi.user', 'u');
    config()->set('services.fapshi.key', 'k');
    Http::fake([
        '*/direct-pay' => Http::response(['transId' => 'TX-ABC', 'message' => 'ok'], 200),
    ]);

    $user = staffUser();
    $inv = chargeInvoice(chargePatient()->id, 5000);

    $this->actingAs($user)->post(route('billing.charge', $inv), [
        'amount' => 5000, 'phone' => '670000000',
    ])->assertRedirect();

    $payment = $inv->payments()->first();
    expect($payment->status)->toBe('pending');
    expect($payment->reference)->toBe('TX-ABC');

    // a pending push is not money in hand
    $inv->refresh()->load('payments');
    expect($inv->paid)->toBe(0);
    expect($inv->status)->toBe('open');

    Http::assertSent(fn ($r) => str_contains($r->url(), '/direct-pay') && $r['phone'] === '670000000');
});

test('polling a successful momo charge confirms it and settles the invoice', function () {
    config()->set('services.fapshi.enabled', true);
    config()->set('services.fapshi.user', 'u');
    config()->set('services.fapshi.key', 'k');
    Http::fake([
        '*/direct-pay' => Http::response(['transId' => 'TX-OK'], 200),
        '*/payment-status/*' => Http::response(['status' => 'SUCCESSFUL', 'amount' => 5000], 200),
    ]);

    $user = staffUser();
    $inv = chargeInvoice(chargePatient()->id, 5000);
    $this->actingAs($user)->post(route('billing.charge', $inv), ['amount' => 5000, 'phone' => '670000000']);
    $payment = $inv->payments()->first();

    $this->actingAs($user)->post(route('billing.payment-status', [$inv->id, $payment->id]))->assertRedirect();

    expect($payment->fresh()->status)->toBe('confirmed');
    $inv->refresh()->load('payments');
    expect($inv->paid)->toBe(5000);
    expect($inv->status)->toBe('paid');
});

test('a failed momo charge is marked failed and never counts as paid', function () {
    config()->set('services.fapshi.enabled', true);
    config()->set('services.fapshi.user', 'u');
    config()->set('services.fapshi.key', 'k');
    Http::fake([
        '*/direct-pay' => Http::response(['transId' => 'TX-NO'], 200),
        '*/payment-status/*' => Http::response(['status' => 'FAILED'], 200),
    ]);

    $user = staffUser();
    $inv = chargeInvoice(chargePatient()->id, 5000);
    $this->actingAs($user)->post(route('billing.charge', $inv), ['amount' => 5000, 'phone' => '670000000']);
    $payment = $inv->payments()->first();

    $this->actingAs($user)->post(route('billing.payment-status', [$inv->id, $payment->id]))->assertRedirect();

    expect($payment->fresh()->status)->toBe('failed');
    $inv->refresh()->load('payments');
    expect($inv->paid)->toBe(0);
    expect($inv->status)->toBe('open');
});

test('when the gateway is disabled a momo charge is recorded immediately as paid', function () {
    // gateway off by default — no HTTP should be attempted
    Http::fake();

    $user = staffUser();
    $inv = chargeInvoice(chargePatient()->id, 5000);

    $this->actingAs($user)->post(route('billing.charge', $inv), [
        'amount' => 5000, 'phone' => '670000000', 'reference' => 'MANUAL-1',
    ])->assertRedirect();

    $payment = $inv->payments()->first();
    expect($payment->status)->toBe('confirmed');
    expect($payment->reference)->toBe('MANUAL-1');
    $inv->refresh()->load('payments');
    expect($inv->status)->toBe('paid');

    Http::assertNothingSent();
});
