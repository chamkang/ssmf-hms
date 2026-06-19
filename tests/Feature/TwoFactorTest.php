<?php

use App\Services\TwoFactor;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('a user can enrol, confirm, and receives recovery codes', function () {
    $user = staffUser();
    $totp = app(TwoFactor::class);

    // begin enrolment -> a secret is generated, not yet confirmed
    $this->actingAs($user)->post(route('two-factor.enable'))->assertRedirect();
    $user->refresh();
    expect($user->two_factor_secret)->not->toBeNull();
    expect($user->hasTwoFactorEnabled())->toBeFalse();

    // confirm with the current valid code
    $this->actingAs($user)
        ->post(route('two-factor.confirm'), ['code' => $totp->currentCode($user->two_factor_secret)])
        ->assertSessionHas('recoveryCodes');

    $user->refresh();
    expect($user->hasTwoFactorEnabled())->toBeTrue();
    expect($user->two_factor_recovery_codes)->toHaveCount(8);
});

test('an invalid confirmation code is rejected', function () {
    $user = staffUser();
    $this->actingAs($user)->post(route('two-factor.enable'));

    $this->actingAs($user)
        ->post(route('two-factor.confirm'), ['code' => '000000'])
        ->assertSessionHasErrors('code');

    expect($user->fresh()->hasTwoFactorEnabled())->toBeFalse();
});

test('once enabled, login routes the user to the challenge', function () {
    $user = staffUser();
    $totp = app(TwoFactor::class);
    $user->forceFill([
        'two_factor_secret' => $totp->generateSecret(),
        'two_factor_confirmed_at' => now(),
    ])->save();
    $secret = $user->two_factor_secret;

    // a fresh session without passing the challenge is held at the gate
    $this->actingAs($user)->get(route('dashboard'))->assertRedirect(route('two-factor.challenge'));

    // a wrong code fails
    $this->actingAs($user)->post(route('two-factor.verify'), ['code' => '000000'])
        ->assertSessionHasErrors('code');

    // the correct code clears the challenge
    $this->actingAs($user)->post(route('two-factor.verify'), ['code' => $totp->currentCode($secret)])
        ->assertRedirect();
    $this->actingAs($user)->get(route('dashboard'))->assertOk();
});

test('a recovery code clears the challenge and is then consumed', function () {
    $user = staffUser();
    $totp = app(TwoFactor::class);
    $codes = $totp->recoveryCodes();
    $user->forceFill([
        'two_factor_secret' => $totp->generateSecret(),
        'two_factor_recovery_codes' => $codes,
        'two_factor_confirmed_at' => now(),
    ])->save();

    $this->actingAs($user)->post(route('two-factor.verify'), ['recovery_code' => $codes[0]])
        ->assertRedirect();

    // the used code is burned; the rest remain
    expect($user->fresh()->two_factor_recovery_codes)->not->toContain($codes[0]);
    expect($user->fresh()->two_factor_recovery_codes)->toHaveCount(count($codes) - 1);
});

test('disabling active 2FA requires the correct password', function () {
    $user = staffUser();
    $totp = app(TwoFactor::class);
    $user->forceFill([
        'two_factor_secret' => $totp->generateSecret(),
        'two_factor_confirmed_at' => now(),
    ])->save();
    // pass the challenge so middleware lets the request through
    $this->withSession(['two_factor_passed' => true]);

    // wrong password is rejected
    $this->actingAs($user)->withSession(['two_factor_passed' => true])
        ->delete(route('two-factor.disable'), ['password' => 'wrong'])
        ->assertSessionHasErrors('password');
    expect($user->fresh()->hasTwoFactorEnabled())->toBeTrue();

    // factory default password is "password"
    $this->actingAs($user)->withSession(['two_factor_passed' => true])
        ->delete(route('two-factor.disable'), ['password' => 'password'])
        ->assertRedirect();
    expect($user->fresh()->hasTwoFactorEnabled())->toBeFalse();
});
