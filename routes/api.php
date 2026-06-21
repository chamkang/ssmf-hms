<?php

use App\Http\Controllers\IntakeController;
use Illuminate\Support\Facades\Route;

// Public website → HMS booking intake (shared-secret bearer token).
Route::post('intake/bookings', [IntakeController::class, 'receive'])
    ->middleware('intake.token')
    ->name('api.intake.bookings');
