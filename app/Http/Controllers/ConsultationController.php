<?php

namespace App\Http\Controllers;

use App\Models\Consultation;
use App\Models\Drug;
use App\Models\Encounter;
use App\Models\Icd10;
use App\Models\Prescription;
use App\Models\Vital;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ConsultationController extends Controller
{
    public function cockpit(Encounter $encounter)
    {
        $encounter->load(['patient.allergies', 'patient.conditions', 'doctor']);

        return Inertia::render('Consultations/Cockpit', [
            'encounter' => $encounter,
            'patient' => $encounter->patient,
            'vitals' => Vital::where('encounter_id', $encounter->id)->latest()->first(),
        ]);
    }

    public function start(\App\Models\Patient $patient)
    {
        $patient->load(['allergies', 'conditions']);

        return Inertia::render('Consultations/Cockpit', [
            'encounter' => null,
            'patient' => $patient,
            'vitals' => null,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'encounter_id' => 'nullable|exists:encounters,id',
            'patient_id' => 'required|exists:patients,id',
            'subjective' => 'nullable|string',
            'objective' => 'nullable|string',
            'assessment' => 'nullable|string',
            'plan' => 'nullable|string',
            'sign' => 'boolean',
            'vitals' => 'nullable|array',
            'diagnoses' => 'array',
            'diagnoses.*.label' => 'required_with:diagnoses|string|max:255',
            'diagnoses.*.icd10_code' => 'nullable|string|max:10',
            'diagnoses.*.is_primary' => 'boolean',
            'items' => 'array',
            'items.*.drug_text' => 'required_with:items|string|max:255',
        ]);

        $consultation = DB::transaction(function () use ($data) {
            $c = Consultation::create([
                'encounter_id' => $data['encounter_id'] ?? null,
                'patient_id' => $data['patient_id'],
                'user_id' => auth()->id(),
                'subjective' => $data['subjective'] ?? null,
                'objective' => $data['objective'] ?? null,
                'assessment' => $data['assessment'] ?? null,
                'plan' => $data['plan'] ?? null,
                'signed_at' => ! empty($data['sign']) ? now() : null,
            ]);

            foreach (($data['diagnoses'] ?? []) as $d) {
                if (! empty($d['label'])) {
                    $c->diagnoses()->create([
                        'icd10_code' => $d['icd10_code'] ?? null,
                        'label' => $d['label'],
                        'is_primary' => ! empty($d['is_primary']),
                    ]);
                }
            }

            $v = collect($data['vitals'] ?? [])->only(['temp', 'bp_sys', 'bp_dia', 'pulse', 'resp', 'spo2', 'weight', 'height'])
                ->filter(fn ($x) => $x !== null && $x !== '');
            if ($v->isNotEmpty()) {
                Vital::create(array_merge([
                    'encounter_id' => $data['encounter_id'] ?? null,
                    'patient_id' => $data['patient_id'],
                    'recorded_by' => auth()->id(),
                ], $v->toArray()));
            }

            $items = collect($data['items'] ?? [])->filter(fn ($i) => ! empty($i['drug_text']));
            if ($items->isNotEmpty()) {
                $p = Prescription::create([
                    'consultation_id' => $c->id,
                    'patient_id' => $data['patient_id'],
                    'user_id' => auth()->id(),
                    'issued_at' => now(),
                    'status' => 'active',
                ]);
                foreach ($items as $i) {
                    $p->items()->create(collect($i)->only([
                        'drug_id', 'drug_text', 'dose', 'route', 'frequency', 'duration', 'quantity', 'instructions',
                    ])->toArray());
                }
            }

            return $c;
        });

        return redirect()->route('patients.show', $data['patient_id'])
            ->with('success', 'Consultation saved'.($consultation->signed_at ? ' and signed.' : '.'));
    }

    public function icd10(Request $request)
    {
        $q = trim((string) $request->query('q', ''));
        if ($q === '') {
            return response()->json([]);
        }
        $like = '%'.mb_strtolower($q).'%';

        return response()->json(
            Icd10::whereRaw('lower(code) like ?', [$like])
                ->orWhereRaw('lower(title) like ?', [$like])
                ->limit(10)->get(['code', 'title'])
        );
    }

    public function drugs(Request $request)
    {
        $q = trim((string) $request->query('q', ''));
        if ($q === '') {
            return response()->json([]);
        }
        $like = '%'.mb_strtolower($q).'%';

        return response()->json(
            Drug::where('is_active', true)->whereRaw('lower(name) like ?', [$like])->limit(10)->get()
                ->map(fn ($d) => ['id' => $d->id, 'label' => $d->label, 'route' => $d->route])
        );
    }
}
