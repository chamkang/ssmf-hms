<?php

use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\FlowBoardController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::resource('patients', PatientController::class)->except(['destroy']);
    Route::get('lookup/patients', [PatientController::class, 'search'])->name('patients.search');

    Route::get('appointments/slots', [AppointmentController::class, 'slots'])->name('appointments.slots');
    Route::resource('appointments', AppointmentController::class)->only(['index', 'create', 'store']);
    Route::patch('appointments/{appointment}/status', [AppointmentController::class, 'updateStatus'])->name('appointments.status');

    Route::get('flow-board', [FlowBoardController::class, 'index'])->name('flow-board');
    Route::post('flow-board/check-in', [FlowBoardController::class, 'checkIn'])->name('flow-board.check-in');
    Route::patch('encounters/{encounter}/advance', [FlowBoardController::class, 'advance'])->name('encounters.advance');
});

require __DIR__.'/auth.php';
