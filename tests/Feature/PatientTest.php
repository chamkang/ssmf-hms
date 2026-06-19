<?php

use App\Models\Patient;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('an authenticated user can view the patients list', function () {
    $user = staffUser();

    $this->actingAs($user)->get('/patients')->assertOk();
});

test('guests are redirected away from patients', function () {
    $this->get('/patients')->assertRedirect('/login');
});

test('creating a patient assigns an MRN and stores allergies', function () {
    $user = staffUser();

    $this->actingAs($user)->post('/patients', [
        'first_name' => 'Awa',
        'last_name' => 'Mballa',
        'phone' => '+237600000001',
        'language' => 'fr',
        'allergies' => [['substance' => 'Pénicilline', 'severity' => 'severe']],
    ])->assertRedirect();

    $p = Patient::firstWhere('last_name', 'Mballa');
    expect($p)->not->toBeNull();
    expect($p->mrn)->toStartWith('SSMF-P-');
    expect($p->allergies)->toHaveCount(1);
});

test('duplicate phone is flagged and only created when forced', function () {
    $user = staffUser();

    $this->actingAs($user)->post('/patients', [
        'first_name' => 'Awa', 'last_name' => 'Mballa', 'phone' => '+237699999999', 'language' => 'fr',
    ])->assertRedirect();

    // same phone -> flagged, not created
    $this->actingAs($user)->post('/patients', [
        'first_name' => 'Other', 'last_name' => 'Person', 'phone' => '+237699999999', 'language' => 'fr',
    ])->assertSessionHas('duplicates');
    expect(Patient::where('last_name', 'Person')->exists())->toBeFalse();

    // force past the warning -> created
    $this->actingAs($user)->post('/patients', [
        'first_name' => 'Other', 'last_name' => 'Person', 'phone' => '+237699999999', 'language' => 'fr', 'force' => true,
    ])->assertRedirect();
    expect(Patient::where('last_name', 'Person')->exists())->toBeTrue();
});
