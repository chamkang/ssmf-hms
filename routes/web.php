<?php

use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\AuditController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\ConsultationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FlowBoardController;
use App\Http\Controllers\LabController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\PharmacyController;
use App\Http\Controllers\PrescriptionController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
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

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

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

    Route::get('encounters/{encounter}/consultation', [ConsultationController::class, 'cockpit'])->name('consultations.cockpit');
    Route::get('patients/{patient}/consult', [ConsultationController::class, 'start'])->name('consultations.start');
    Route::post('consultations', [ConsultationController::class, 'store'])->name('consultations.store');
    Route::get('lookup/icd10', [ConsultationController::class, 'icd10'])->name('lookup.icd10');
    Route::get('lookup/drugs', [ConsultationController::class, 'drugs'])->name('lookup.drugs');
    Route::get('prescriptions/{prescription}/print', [PrescriptionController::class, 'print'])->name('prescriptions.print');

    // Laboratory
    Route::get('lab', [LabController::class, 'index'])->name('lab.index');
    Route::get('lab/create', [LabController::class, 'create'])->name('lab.create');
    Route::post('lab', [LabController::class, 'store'])->name('lab.store');
    Route::get('lab/{lab}', [LabController::class, 'show'])->name('lab.show');
    Route::patch('lab/{lab}/results', [LabController::class, 'results'])->name('lab.results');

    // Pharmacy
    Route::get('pharmacy', [PharmacyController::class, 'queue'])->name('pharmacy.queue');
    Route::get('pharmacy/inventory', [PharmacyController::class, 'inventory'])->name('pharmacy.inventory');
    Route::post('pharmacy/inventory', [PharmacyController::class, 'addStock'])->name('pharmacy.add-stock');
    Route::patch('prescriptions/{prescription}/dispense', [PharmacyController::class, 'dispense'])->name('pharmacy.dispense');

    // Billing & cashier
    Route::get('billing', [BillingController::class, 'index'])->name('billing.index');
    Route::get('billing/create', [BillingController::class, 'create'])->name('billing.create');
    Route::get('billing/report', [BillingController::class, 'report'])->name('billing.report');
    Route::post('billing', [BillingController::class, 'store'])->name('billing.store');
    Route::get('billing/{invoice}', [BillingController::class, 'show'])->name('billing.show');
    Route::post('billing/{invoice}/pay', [BillingController::class, 'pay'])->name('billing.pay');
    Route::get('billing/{invoice}/receipt', [BillingController::class, 'receipt'])->name('billing.receipt');

    Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('audit', [AuditController::class, 'index'])->name('audit.index');
});

require __DIR__.'/auth.php';
