<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Diagnosis;
use App\Models\LabOrder;
use App\Models\Patient;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index()
    {
        $today = now()->toDateString();
        $monthStart = now()->startOfMonth();

        return Inertia::render('Reports/Index', [
            'month_label' => now()->format('F Y'),
            'revenue' => [
                'today' => (int) Payment::whereDate('received_at', $today)->sum('amount'),
                'month' => (int) Payment::where('received_at', '>=', $monthStart)->sum('amount'),
                'cash_month' => (int) Payment::where('received_at', '>=', $monthStart)->where('method', 'cash')->sum('amount'),
                'momo_month' => (int) Payment::where('received_at', '>=', $monthStart)->where('method', 'momo')->sum('amount'),
            ],
            'appointments' => [
                'month' => Appointment::where('starts_at', '>=', $monthStart)->count(),
                'no_show' => Appointment::where('starts_at', '>=', $monthStart)->where('status', 'no_show')->count(),
            ],
            'new_patients_month' => Patient::where('created_at', '>=', $monthStart)->count(),
            'lab_orders_month' => LabOrder::where('created_at', '>=', $monthStart)->count(),
            'top_diagnoses' => Diagnosis::select('label', DB::raw('count(*) as n'))
                ->groupBy('label')->orderByDesc('n')->limit(8)->get(),
        ]);
    }
}
