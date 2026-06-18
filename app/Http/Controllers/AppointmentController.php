<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Service;
use App\Services\SlotEngine;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class AppointmentController extends Controller
{
    public function index(Request $request)
    {
        $date = $request->query('date', now()->toDateString());

        $appointments = Appointment::with(['patient', 'doctor', 'service'])
            ->whereDate('starts_at', $date)
            ->orderBy('starts_at')
            ->get();

        return Inertia::render('Appointments/Index', [
            'appointments' => $appointments,
            'date' => $date,
        ]);
    }

    public function create()
    {
        return Inertia::render('Appointments/Create', [
            'doctors' => Doctor::where('is_active', true)->orderBy('sort_order')->get(['id', 'full_name', 'specialty_fr']),
            'services' => Service::where('is_active', true)->orderBy('sort_order')->get(['id', 'name_fr', 'duration_min']),
        ]);
    }

    public function slots(Request $request)
    {
        $request->validate(['doctor_id' => 'required|integer', 'date' => 'required|date']);

        return response()->json(SlotEngine::available((int) $request->doctor_id, $request->date));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'doctor_id' => 'required|exists:doctors,id',
            'service_id' => 'required|exists:services,id',
            'date' => 'required|date',
            'time' => ['required', 'regex:/^\d{2}:\d{2}$/'],
            'notes' => 'nullable|string|max:1000',
        ]);

        if (! in_array($data['time'], SlotEngine::available((int) $data['doctor_id'], $data['date']), true)) {
            return back()->withErrors(['time' => 'Ce créneau n’est plus disponible.'])->withInput();
        }

        $duration = (int) (Service::find($data['service_id'])?->duration_min ?? 20);
        $startsAt = Carbon::createFromFormat('Y-m-d H:i', "{$data['date']} {$data['time']}");

        try {
            $appointment = Appointment::create([
                'patient_id' => $data['patient_id'],
                'doctor_id' => $data['doctor_id'],
                'service_id' => $data['service_id'],
                'starts_at' => $startsAt,
                'ends_at' => $startsAt->copy()->addMinutes($duration),
                'status' => 'confirmed',
                'source' => 'desk',
                'notes' => $data['notes'] ?? null,
            ]);
        } catch (QueryException $e) {
            if ((string) $e->getCode() === '23000') {
                return back()->withErrors(['time' => 'Ce créneau vient d’être réservé.'])->withInput();
            }
            throw $e;
        }

        return redirect()->route('appointments.index', ['date' => $data['date']])
            ->with('success', "Rendez-vous {$appointment->reference} confirmé.");
    }

    public function updateStatus(Request $request, Appointment $appointment)
    {
        $data = $request->validate([
            'status' => 'required|in:pending,confirmed,checked_in,in_progress,completed,cancelled,no_show',
        ]);
        $appointment->update(['status' => $data['status']]);

        return back()->with('success', 'Statut du rendez-vous mis à jour.');
    }
}
