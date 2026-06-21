<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\ArtCycle;
use App\Models\Diagnosis;
use App\Models\EmbryologyRecord;
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

        // Only settled money counts (a pending MoMo push is not revenue).
        $confirmed = fn () => Payment::where('status', 'confirmed');

        $transfers = EmbryologyRecord::where('embryos_transferred', '>', 0)->count();
        $pregnancies = EmbryologyRecord::where('clinical_pregnancy', true)->count();

        return Inertia::render('Reports/Index', [
            'month_label' => now()->format('F Y'),
            'revenue' => [
                'today' => (int) $confirmed()->whereDate('received_at', $today)->sum('amount'),
                'month' => (int) $confirmed()->where('received_at', '>=', $monthStart)->sum('amount'),
                'cash_month' => (int) $confirmed()->where('received_at', '>=', $monthStart)->where('method', 'cash')->sum('amount'),
                'momo_month' => (int) $confirmed()->where('received_at', '>=', $monthStart)->where('method', 'momo')->sum('amount'),
            ],
            'art' => [
                'total_cycles' => ArtCycle::count(),
                'transfers' => $transfers,
                'clinical_pregnancies' => $pregnancies,
                'pregnancy_rate' => $transfers > 0 ? round($pregnancies / $transfers * 100, 1) : 0,
                'by_type' => ArtCycle::select('type', DB::raw('count(*) as n'))->groupBy('type')->orderByDesc('n')->get(),
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
