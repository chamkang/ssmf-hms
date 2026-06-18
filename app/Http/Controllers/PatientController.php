<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PatientController extends Controller
{
    public function index(Request $request)
    {
        $q = trim((string) $request->query('q', ''));

        $patients = Patient::query()
            ->when($q !== '', function ($query) use ($q) {
                $like = '%'.mb_strtolower($q).'%';
                $query->where(function ($w) use ($like, $q) {
                    // lower()+like is case-insensitive on both Postgres (prod) and SQLite (tests)
                    $w->whereRaw('lower(first_name) like ?', [$like])
                        ->orWhereRaw('lower(last_name) like ?', [$like])
                        ->orWhereRaw('lower(mrn) like ?', [$like])
                        ->orWhere('phone', 'like', "%{$q}%");
                });
            })
            ->orderByDesc('created_at')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Patients/Index', [
            'patients' => $patients,
            'filters' => ['q' => $q],
        ]);
    }

    public function search(Request $request)
    {
        $q = trim((string) $request->query('q', ''));
        if ($q === '') {
            return response()->json([]);
        }
        $like = '%'.mb_strtolower($q).'%';

        $results = Patient::query()
            ->where(function ($w) use ($like, $q) {
                $w->whereRaw('lower(first_name) like ?', [$like])
                    ->orWhereRaw('lower(last_name) like ?', [$like])
                    ->orWhereRaw('lower(mrn) like ?', [$like])
                    ->orWhere('phone', 'like', "%{$q}%");
            })
            ->orderBy('last_name')
            ->limit(10)
            ->get(['id', 'mrn', 'first_name', 'last_name', 'phone'])
            ->map(fn ($p) => [
                'id' => $p->id,
                'mrn' => $p->mrn,
                'label' => "{$p->first_name} {$p->last_name} — {$p->mrn}",
                'phone' => $p->phone,
            ]);

        return response()->json($results);
    }

    public function create()
    {
        return Inertia::render('Patients/Create');
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);

        // Duplicate prevention (PT-2): same phone, or same surname + DOB.
        if (! $request->boolean('force')) {
            $dups = Patient::query()
                ->where(function ($w) use ($data) {
                    $w->where('phone', $data['phone']);
                    if (! empty($data['dob'])) {
                        $w->orWhere(function ($x) use ($data) {
                            $x->whereRaw('lower(last_name) = ?', [mb_strtolower($data['last_name'])])
                                ->where('dob', $data['dob']);
                        });
                    }
                })
                ->limit(5)
                ->get(['id', 'mrn', 'first_name', 'last_name', 'phone', 'dob']);

            if ($dups->isNotEmpty()) {
                return back()->withInput()->with('duplicates', $dups);
            }
        }

        $patient = Patient::create(collect($data)->except(['allergies', 'next_of_kin'])->all());
        $this->syncChildren($patient, $data);

        return redirect()->route('patients.show', $patient)
            ->with('success', "Patient registered — record {$patient->mrn}.");
    }

    public function show(Patient $patient)
    {
        $patient->load(['allergies', 'conditions', 'nextOfKin']);

        $consultations = \App\Models\Consultation::where('patient_id', $patient->id)
            ->with(['author', 'diagnoses', 'prescriptions.items'])
            ->latest()->limit(20)->get();

        return Inertia::render('Patients/Show', [
            'patient' => $patient,
            'consultations' => $consultations,
        ]);
    }

    public function edit(Patient $patient)
    {
        $patient->load(['allergies', 'nextOfKin']);

        return Inertia::render('Patients/Edit', ['patient' => $patient]);
    }

    public function update(Request $request, Patient $patient)
    {
        $data = $this->validateData($request);
        $patient->update(collect($data)->except(['allergies', 'next_of_kin'])->all());
        $this->syncChildren($patient, $data, replace: true);

        return redirect()->route('patients.show', $patient)
            ->with('success', 'Patient record updated.');
    }

    private function validateData(Request $request): array
    {
        return $request->validate([
            'first_name' => 'required|string|max:80',
            'last_name' => 'required|string|max:80',
            'sex' => 'nullable|in:F,M',
            'dob' => 'nullable|date|before_or_equal:today',
            'marital_status' => 'nullable|string|max:20',
            'phone' => 'required|string|max:30',
            'email' => 'nullable|email|max:190',
            'address' => 'nullable|string|max:255',
            'language' => 'nullable|in:fr,en',
            'blood_group' => 'nullable|string|max:5',
            'notes' => 'nullable|string|max:2000',
            'allergies' => 'array',
            'allergies.*.substance' => 'required_with:allergies|string|max:120',
            'allergies.*.severity' => 'nullable|in:mild,moderate,severe',
            'allergies.*.reaction' => 'nullable|string|max:120',
            'next_of_kin' => 'nullable|array',
            'next_of_kin.name' => 'nullable|string|max:120',
            'next_of_kin.relationship' => 'nullable|string|max:60',
            'next_of_kin.phone' => 'nullable|string|max:30',
        ]);
    }

    private function syncChildren(Patient $patient, array $data, bool $replace = false): void
    {
        if ($replace) {
            $patient->allergies()->delete();
            $patient->nextOfKin()->delete();
        }

        foreach (($data['allergies'] ?? []) as $a) {
            if (! empty($a['substance'])) {
                $patient->allergies()->create([
                    'substance' => $a['substance'],
                    'severity' => $a['severity'] ?? null,
                    'reaction' => $a['reaction'] ?? null,
                ]);
            }
        }

        $nok = $data['next_of_kin'] ?? null;
        if ($nok && ! empty($nok['name'])) {
            $patient->nextOfKin()->create([
                'name' => $nok['name'],
                'relationship' => $nok['relationship'] ?? null,
                'phone' => $nok['phone'] ?? null,
            ]);
        }
    }
}
