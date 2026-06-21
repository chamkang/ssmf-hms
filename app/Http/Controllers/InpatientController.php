<?php

namespace App\Http\Controllers;

use App\Models\Admission;
use App\Models\Bed;
use App\Models\Ward;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class InpatientController extends Controller
{
    /** Ward/bed occupancy board. */
    public function board()
    {
        $wards = Ward::where('is_active', true)
            ->with(['beds' => fn ($q) => $q->where('is_active', true)->orderBy('label'),
                'beds.currentAdmission.patient:id,first_name,last_name,mrn'])
            ->orderBy('name')
            ->get();

        return Inertia::render('Inpatient/Board', ['wards' => $wards]);
    }

    public function index(Request $request)
    {
        $status = $request->query('status', 'active');

        $admissions = Admission::with(['patient:id,first_name,last_name,mrn', 'bed.ward', 'attending:id,name'])
            ->when($status !== 'all', fn ($q) => $q->where('status', $status))
            ->latest('admitted_at')
            ->limit(100)
            ->get();

        return Inertia::render('Inpatient/Index', ['admissions' => $admissions, 'status' => $status]);
    }

    public function create()
    {
        return Inertia::render('Inpatient/Create', [
            'freeBeds' => $this->freeBeds(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'bed_id' => 'nullable|exists:beds,id',
            'reason' => 'nullable|string|max:255',
            'admitted_at' => 'nullable|date',
        ]);

        if (! empty($data['bed_id']) && $this->bedTaken((int) $data['bed_id'])) {
            throw ValidationException::withMessages(['bed_id' => 'That bed is already occupied.']);
        }

        $admission = Admission::create($data + [
            'status' => 'active',
            'attending_id' => auth()->id(),
            'admitted_at' => $data['admitted_at'] ?? now(),
        ]);

        return redirect()->route('inpatient.show', $admission)->with('success', "Admission {$admission->reference} created.");
    }

    public function show(Admission $admission)
    {
        $admission->load(['patient:id,first_name,last_name,mrn,dob,phone', 'bed.ward', 'attending:id,name', 'notes.author:id,name']);

        return Inertia::render('Inpatient/Show', [
            'admission' => $admission,
            'freeBeds' => $admission->status === 'active' ? $this->freeBeds() : [],
        ]);
    }

    public function storeNote(Request $request, Admission $admission)
    {
        $data = $request->validate([
            'kind' => 'required|in:progress,nursing,round',
            'note' => 'required|string|max:4000',
            'noted_at' => 'nullable|date',
            'temp' => 'nullable|numeric|min:30|max:45',
            'pulse' => 'nullable|integer|min:0|max:250',
            'bp_sys' => 'nullable|integer|min:0|max:300',
            'bp_dia' => 'nullable|integer|min:0|max:200',
            'spo2' => 'nullable|integer|min:0|max:100',
        ]);

        $admission->notes()->create($data + [
            'noted_at' => $data['noted_at'] ?? now(),
            'author_id' => auth()->id(),
        ]);

        return back()->with('success', 'Note added.');
    }

    /** Move a patient to a different (free) bed. */
    public function transfer(Request $request, Admission $admission)
    {
        $data = $request->validate(['bed_id' => 'required|exists:beds,id']);

        if ($this->bedTaken((int) $data['bed_id'])) {
            throw ValidationException::withMessages(['bed_id' => 'That bed is already occupied.']);
        }
        $admission->update(['bed_id' => $data['bed_id']]);

        return back()->with('success', 'Patient transferred.');
    }

    public function discharge(Request $request, Admission $admission)
    {
        $data = $request->validate([
            'discharge_summary' => 'nullable|string|max:4000',
            'discharged_at' => 'nullable|date',
        ]);

        $admission->update([
            'status' => 'discharged',
            'discharged_at' => $data['discharged_at'] ?? now(),
            'discharge_summary' => $data['discharge_summary'] ?? $admission->discharge_summary,
            'bed_id' => null, // free the bed
        ]);

        return back()->with('success', 'Patient discharged.');
    }

    private function bedTaken(int $bedId): bool
    {
        return Admission::where('bed_id', $bedId)->where('status', 'active')->exists();
    }

    private function freeBeds()
    {
        return Bed::where('is_active', true)
            ->whereDoesntHave('admissions', fn ($q) => $q->where('status', 'active'))
            ->with('ward:id,name')
            ->orderBy('ward_id')->orderBy('label')
            ->get(['id', 'ward_id', 'label']);
    }
}
