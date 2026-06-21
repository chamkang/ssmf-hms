<?php

use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\AuditController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\ConsultationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FertilityController;
use App\Http\Controllers\FlowBoardController;
use App\Http\Controllers\InpatientController;
use App\Http\Controllers\IntakeController;
use App\Http\Controllers\MaternityController;
use App\Http\Controllers\LabController;
use App\Http\Controllers\LocaleController;
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

Route::post('/locale/{locale}', [LocaleController::class, 'update'])->name('locale.update');

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Patients — view (shared by reception/lab/cashier pickers) vs manage
    Route::middleware('permission:patients.view')->group(function () {
        Route::get('patients', [PatientController::class, 'index'])->name('patients.index');
        Route::get('lookup/patients', [PatientController::class, 'search'])->name('patients.search');
    });
    Route::middleware('permission:patients.manage')->group(function () {
        Route::get('patients/create', [PatientController::class, 'create'])->name('patients.create');
        Route::post('patients', [PatientController::class, 'store'])->name('patients.store');
        Route::get('patients/{patient}/edit', [PatientController::class, 'edit'])->name('patients.edit');
        Route::match(['put', 'patch'], 'patients/{patient}', [PatientController::class, 'update'])->name('patients.update');
    });
    Route::get('patients/{patient}', [PatientController::class, 'show'])->name('patients.show')->middleware('permission:patients.view');

    // Appointments
    Route::middleware('permission:appointments.manage')->group(function () {
        Route::get('appointments/slots', [AppointmentController::class, 'slots'])->name('appointments.slots');
        Route::get('appointments', [AppointmentController::class, 'index'])->name('appointments.index');
        Route::get('appointments/create', [AppointmentController::class, 'create'])->name('appointments.create');
        Route::post('appointments', [AppointmentController::class, 'store'])->name('appointments.store');
        Route::patch('appointments/{appointment}/status', [AppointmentController::class, 'updateStatus'])->name('appointments.status');
    });

    // Reception / flow board
    Route::middleware('permission:reception.queue')->group(function () {
        Route::get('flow-board', [FlowBoardController::class, 'index'])->name('flow-board');
        Route::post('flow-board/check-in', [FlowBoardController::class, 'checkIn'])->name('flow-board.check-in');
        Route::patch('encounters/{encounter}/advance', [FlowBoardController::class, 'advance'])->name('encounters.advance');

        // Web booking intake review
        Route::get('intake', [IntakeController::class, 'index'])->name('intake.index');
        Route::post('intake/{intake}/convert', [IntakeController::class, 'convert'])->name('intake.convert');
        Route::post('intake/{intake}/reject', [IntakeController::class, 'reject'])->name('intake.reject');
    });

    // Consultations & e-prescribing
    Route::middleware('permission:consultations.write')->group(function () {
        Route::get('encounters/{encounter}/consultation', [ConsultationController::class, 'cockpit'])->name('consultations.cockpit');
        Route::get('patients/{patient}/consult', [ConsultationController::class, 'start'])->name('consultations.start');
        Route::post('consultations', [ConsultationController::class, 'store'])->name('consultations.store');
        Route::get('lookup/icd10', [ConsultationController::class, 'icd10'])->name('lookup.icd10');
        Route::get('lookup/drugs', [ConsultationController::class, 'drugs'])->name('lookup.drugs');
        Route::get('prescriptions/{prescription}/print', [PrescriptionController::class, 'print'])->name('prescriptions.print');
    });

    // Laboratory
    Route::middleware('permission:lab.results')->group(function () {
        Route::get('lab', [LabController::class, 'index'])->name('lab.index');
        Route::get('lab/create', [LabController::class, 'create'])->name('lab.create');
        Route::post('lab', [LabController::class, 'store'])->name('lab.store');
        Route::get('lab/{lab}', [LabController::class, 'show'])->name('lab.show');
        Route::patch('lab/{lab}/results', [LabController::class, 'results'])->name('lab.results');
    });

    // Pharmacy
    Route::middleware('permission:pharmacy.dispense')->group(function () {
        Route::get('pharmacy', [PharmacyController::class, 'queue'])->name('pharmacy.queue');
        Route::get('pharmacy/inventory', [PharmacyController::class, 'inventory'])->name('pharmacy.inventory');
        Route::post('pharmacy/inventory', [PharmacyController::class, 'addStock'])->name('pharmacy.add-stock');
        Route::patch('prescriptions/{prescription}/dispense', [PharmacyController::class, 'dispense'])->name('pharmacy.dispense');
    });

    // Billing & cashier
    Route::middleware('permission:billing.manage')->group(function () {
        Route::get('billing', [BillingController::class, 'index'])->name('billing.index');
        Route::get('billing/create', [BillingController::class, 'create'])->name('billing.create');
        Route::get('billing/chargeable', [BillingController::class, 'chargeable'])->name('billing.chargeable');
        Route::get('billing/report', [BillingController::class, 'report'])->name('billing.report');
        Route::post('billing', [BillingController::class, 'store'])->name('billing.store');
        Route::get('billing/{invoice}', [BillingController::class, 'show'])->name('billing.show');
        Route::post('billing/{invoice}/pay', [BillingController::class, 'pay'])->name('billing.pay');
        Route::post('billing/{invoice}/charge', [BillingController::class, 'charge'])->name('billing.charge');
        Route::post('billing/{invoice}/payments/{payment}/status', [BillingController::class, 'paymentStatus'])->name('billing.payment-status');
        Route::get('billing/{invoice}/receipt', [BillingController::class, 'receipt'])->name('billing.receipt');
    });

    // Fertility / ART
    Route::middleware('permission:fertility.manage')->group(function () {
        Route::get('fertility', [FertilityController::class, 'index'])->name('fertility.index');
        Route::get('fertility/create', [FertilityController::class, 'create'])->name('fertility.create');
        Route::post('fertility', [FertilityController::class, 'store'])->name('fertility.store');
        Route::get('fertility/{fertility}', [FertilityController::class, 'show'])->name('fertility.show');
        Route::patch('fertility/{fertility}', [FertilityController::class, 'updateCase'])->name('fertility.update');
        Route::post('fertility/{fertility}/cycles', [FertilityController::class, 'storeCycle'])->name('fertility.cycles.store');
        Route::patch('cycles/{cycle}', [FertilityController::class, 'updateCycle'])->name('fertility.cycles.update');
        Route::post('cycles/{cycle}/monitorings', [FertilityController::class, 'storeMonitoring'])->name('fertility.monitorings.store');
        Route::post('cycles/{cycle}/embryology', [FertilityController::class, 'saveEmbryology'])->name('fertility.embryology.save');
    });

    // Maternity / ANC
    Route::middleware('permission:maternity.manage')->group(function () {
        Route::get('maternity', [MaternityController::class, 'index'])->name('maternity.index');
        Route::get('maternity/create', [MaternityController::class, 'create'])->name('maternity.create');
        Route::post('maternity', [MaternityController::class, 'store'])->name('maternity.store');
        Route::get('maternity/{maternity}', [MaternityController::class, 'show'])->name('maternity.show');
        Route::patch('maternity/{maternity}', [MaternityController::class, 'update'])->name('maternity.update');
        Route::post('maternity/{maternity}/anc', [MaternityController::class, 'storeAncVisit'])->name('maternity.anc.store');
        Route::post('maternity/{maternity}/partograph', [MaternityController::class, 'storePartograph'])->name('maternity.partograph.store');
        Route::post('maternity/{maternity}/delivery', [MaternityController::class, 'saveDelivery'])->name('maternity.delivery.save');
    });

    // Inpatient / IPD
    Route::middleware('permission:inpatient.manage')->group(function () {
        Route::get('inpatient', [InpatientController::class, 'board'])->name('inpatient.board');
        Route::get('inpatient/admissions', [InpatientController::class, 'index'])->name('inpatient.index');
        Route::get('inpatient/admit', [InpatientController::class, 'create'])->name('inpatient.create');
        Route::post('inpatient', [InpatientController::class, 'store'])->name('inpatient.store');
        Route::get('inpatient/{admission}', [InpatientController::class, 'show'])->name('inpatient.show');
        Route::post('inpatient/{admission}/notes', [InpatientController::class, 'storeNote'])->name('inpatient.notes.store');
        Route::patch('inpatient/{admission}/transfer', [InpatientController::class, 'transfer'])->name('inpatient.transfer');
        Route::patch('inpatient/{admission}/discharge', [InpatientController::class, 'discharge'])->name('inpatient.discharge');
    });

    Route::get('reports', [ReportController::class, 'index'])->name('reports.index')->middleware('permission:reports.view');
    Route::get('audit', [AuditController::class, 'index'])->name('audit.index')->middleware('permission:audit.view');
});

require __DIR__.'/auth.php';
