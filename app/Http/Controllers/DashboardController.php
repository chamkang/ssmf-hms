<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Encounter;
use App\Models\Invoice;
use App\Models\LabOrder;
use App\Models\Patient;
use App\Models\Payment;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $today = now()->toDateString();

        return Inertia::render('Dashboard', [
            'stats' => [
                'appointments_today' => Appointment::whereDate('starts_at', $today)->count(),
                'in_queue' => Encounter::where('status', 'open')->count(),
                'revenue_today' => (int) Payment::whereDate('received_at', $today)->sum('amount'),
                'open_invoices' => Invoice::whereIn('status', ['open', 'part_paid'])->count(),
                'pending_labs' => LabOrder::where('status', 'ordered')->count(),
                'patients_total' => Patient::count(),
            ],
        ]);
    }
}
