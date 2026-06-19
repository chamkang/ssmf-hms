<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('the UI defaults to English and can be switched to French', function () {
    $user = staffUser();

    // default locale is English
    $this->actingAs($user)->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page->where('locale', 'en'));

    // switch to French — remembered in the session and reflected in shared props
    $this->actingAs($user)->post(route('locale.update', 'fr'))->assertRedirect();
    expect(session('locale'))->toBe('fr');

    $this->actingAs($user)->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page->where('locale', 'fr'));
});

test('an unsupported locale is ignored', function () {
    $user = staffUser();

    $this->actingAs($user)->post(route('locale.update', 'de'))->assertRedirect();
    expect(session('locale'))->toBeNull();
});
