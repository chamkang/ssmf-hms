<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Encounter;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FlowBoardController extends Controller
{
    public function index()
    {
        $encounters = Encounter::with(['patient.allergies', 'doctor'])
            ->where('status', 'open')
            ->orderBy('arrived_at')
            ->get();

        $alreadyIn = Encounter::where('status', 'open')->pluck('appointment_id')->filter()->all();

        $arrivals = Appointment::with(['patient', 'doctor', 'service'])
            ->whereDate('starts_at', now()->toDateString())
            ->whereIn('status', ['confirmed', 'pending'])
            ->whereNotIn('id', $alreadyIn ?: [0])
            ->orderBy('starts_at')
            ->get();

        return Inertia::render('FlowBoard/Index', [
            'encounters' => $encounters,
            'stages' => Encounter::STAGES,
            'arrivals' => $arrivals,
        ]);
    }

    public function checkIn(Request $request)
    {
        $data = $request->validate([
            'appointment_id' => 'nullable|exists:appointments,id',
            'patient_id' => 'required_without:appointment_id|nullable|exists:patients,id',
        ]);

        if (! empty($data['appointment_id'])) {
            $appt = Appointment::findOrFail($data['appointment_id']);
            $appt->update(['status' => 'checked_in']);
            Encounter::create([
                'patient_id' => $appt->patient_id,
                'appointment_id' => $appt->id,
                'doctor_id' => $appt->doctor_id,
                'stage' => 'waiting',
                'status' => 'open',
                'arrived_at' => now(),
                'created_by' => auth()->id(),
            ]);
        } else {
            Encounter::create([
                'patient_id' => $data['patient_id'],
                'stage' => 'waiting',
                'status' => 'open',
                'arrived_at' => now(),
                'created_by' => auth()->id(),
            ]);
        }

        return back()->with('success', 'Patient added to the queue.');
    }

    public function advance(Request $request, Encounter $encounter)
    {
        $data = $request->validate(['stage' => 'required|in:'.implode(',', Encounter::STAGES)]);

        $attrs = ['stage' => $data['stage']];
        if ($data['stage'] === 'done') {
            $attrs['status'] = 'closed';
            $attrs['closed_at'] = now();
        }
        $encounter->update($attrs);

        return back()->with('success', 'Queue updated.');
    }
}
