<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('an admin can create a staff account with a role, and that user can log in', function () {
    $admin = staffUser('admin');

    $this->actingAs($admin)->post(route('users.store'), [
        'name' => 'Dr Awa', 'email' => 'awa@ssmf.local', 'role' => 'doctor', 'password' => 'Temp#1234',
    ])->assertRedirect(route('users.index'));

    $user = User::firstWhere('email', 'awa@ssmf.local');
    expect($user)->not->toBeNull();
    expect($user->hasRole('doctor'))->toBeTrue();
    expect($user->is_active)->toBeTrue();

    // the new account can authenticate (log the admin out first — /login is guest-only)
    $this->post(route('logout'));
    $this->post(route('login'), ['email' => 'awa@ssmf.local', 'password' => 'Temp#1234'])->assertRedirect();
    $this->assertAuthenticatedAs($user->fresh());
});

test('non-admins cannot reach user management', function () {
    $this->actingAs(staffUser('doctor'))->get(route('users.index'))->assertForbidden();
    $this->actingAs(staffUser('receptionist'))->get(route('users.create'))->assertForbidden();
});

test('an admin can change a user role and reset their password', function () {
    $admin = staffUser('admin');
    $target = staffUser('nurse');

    $this->actingAs($admin)->patch(route('users.update', $target), ['name' => $target->name, 'role' => 'midwife'])->assertRedirect();
    expect($target->fresh()->hasRole('midwife'))->toBeTrue();
    expect($target->fresh()->hasRole('nurse'))->toBeFalse();

    $this->actingAs($admin)->post(route('users.reset-password', $target), ['password' => 'NewTemp#99'])->assertRedirect();
    $this->post(route('logout'));
    $this->post(route('login'), ['email' => $target->email, 'password' => 'NewTemp#99'])->assertRedirect();
    $this->assertAuthenticatedAs($target->fresh());
});

test('an admin cannot deactivate or demote their own account', function () {
    $admin = staffUser('admin');

    $this->actingAs($admin)->patch(route('users.toggle', $admin), [])->assertSessionHasErrors('is_active');
    expect($admin->fresh()->is_active)->toBeTrue();

    $this->actingAs($admin)->patch(route('users.update', $admin), ['name' => $admin->name, 'role' => 'doctor'])->assertSessionHasErrors('role');
    expect($admin->fresh()->hasRole('admin'))->toBeTrue();
});

test('a deactivated account cannot log in', function () {
    $admin = staffUser('admin');
    $target = staffUser('cashier');

    $this->actingAs($admin)->patch(route('users.toggle', $target))->assertRedirect();
    expect($target->fresh()->is_active)->toBeFalse();

    // log the admin out, then the deactivated account must be refused (factory password is "password")
    $this->post(route('logout'));
    $this->post(route('login'), ['email' => $target->email, 'password' => 'password'])->assertSessionHasErrors('email');
    $this->assertGuest();
});
