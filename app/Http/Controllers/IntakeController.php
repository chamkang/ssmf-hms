<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\IntakeBooking;
use App\Models\Patient;
use App\Models\Service;
use App\Services\SlotEngine;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class IntakeController extends Controller
{
    /**
     * Receive a booking pushed by the public website (token-authenticated).
     * Matches an existing patient by phone or creates one, then files a
     * pending intake for reception to confirm into a real appointment.
     * Idempotent on web_reference.
     */
    public function receive(Request $request): JsonResponse
    {
        $data = $request->validate([
            'web_reference' => 'nullable|string|max:120',
            'first_name' => 'required|string|max:120',
            'last_name' => 'required|string|max:120',
            'phone' => 'nullable|string|max:30',
            'email' => 'nullable|email|max:160',
            'sex' => 'nullable|in:F,M',
            'dob' => 'nullable|date',
            'language' => 'nullable|in:fr,en',
            'service_id' => 'nullable|exists:services,id',
            'doctor_id' => 'nullable|exists:doctors,id',
            'preferred_at' => 'nullable|date',
            'reason' => 'nullable|string|max:255',
        ]);

        // Idempotency: a repeated push for the same web booking returns the original.
        if (! empty($data['web_reference'])) {
            $existing = IntakeBooking::where('web_reference', $data['web_reference'])->first();
            if ($existing) {
                return response()->json(['id' => $existing->id, 'status' => $existing->status, 'duplicate' => true], 200);
            }
        }

        // Match an existing patient by phone, else create one from the web details.
        $patient = null;
        if (! empty($data['phone'])) {
            $patient = Patient::where('phone', $data['phone'])->first();
        }
        if (! $patient) {
            $patient = Patient::create([
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'phone' => $data['phone'] ?? null,
                'email' => $data['email'] ?? null,
                'sex' => $data['sex'] ?? null,
                'dob' => $data['dob'] ?? null,
                'language' => $data['language'] ?? 'fr',
            ]);
        }

        $intake = IntakeBooking::create($data + [
            'language' => $data['language'] ?? 'fr',
            'status' => 'pending',
            'patient_id' => $patient->id,
        ]);

        return response()->json(['id' => $intake->id, 'patient_mrn' => $patient->mrn, 'status' => 'pending'], 201);
    }

    /** Reception review queue of pending web bookings. */
    public function index()
    {
        $bookings = IntakeBooking::with(['patient:id,first_name,last_name,mrn,phone', 'service:id,name_en,name_fr', 'doctor:id,full_name'])
            ->where('status', 'pending')
            ->latest()
            ->get();

        return Inertia::render('Intake/Index', [
            'bookings' => $bookings,
            'doctors' => \App\Models\Doctor::where('is_active', true)->orderBy('sort_order')->get(['id', 'full_name']),
            'services' => Service::where('is_active', true)->orderBy('sort_order')->get(['id', 'name_en', 'duration_min']),
        ]);
    }

    /** Confirm an intake into a real appointment using the picked slot. */
    public function convert(Request $request, IntakeBooking $intake)
    {
        abort_unless($intake->status === 'pending', 422);

        $data = $request->validate([
            'doctor_id' => 'required|exists:doctors,id',
            'service_id' => 'required|exists:services,id',
            'date' => 'required|date',
            'time' => ['required', 'regex:/^\d{2}:\d{2}$/'],
        ]);

        if (! in_array($data['time'], SlotEngine::available((int) $data['doctor_id'], $data['date']), true)) {
            return back()->withErrors(['time' => 'This time slot is no longer available.']);
        }

        $duration = (int) (Service::find($data['service_id'])?->duration_min ?? 20);
        $startsAt = Carbon::createFromFormat('Y-m-d H:i', "{$data['date']} {$data['time']}");

        try {
            $appointment = Appointment::create([
                'patient_id' => $intake->patient_id,
                'doctor_id' => $data['doctor_id'],
                'service_id' => $data['service_id'],
                'starts_at' => $startsAt,
                'ends_at' => $startsAt->copy()->addMinutes($duration),
                'status' => 'confirmed',
                'source' => 'website',
                'notes' => $intake->reason,
            ]);
        } catch (QueryException $e) {
            if ((string) $e->getCode() === '23000') {
                return back()->withErrors(['time' => 'This slot was just taken.']);
            }
            throw $e;
        }

        $intake->update(['status' => 'converted', 'appointment_id' => $appointment->id]);

        return back()->with('success', "Booking confirmed as {$appointment->reference}.");
    }

    public function reject(IntakeBooking $intake)
    {
        abort_unless($intake->status === 'pending', 422);
        $intake->update(['status' => 'rejected']);

        return back()->with('success', 'Booking dismissed.');
    }
}
