<?php

namespace App\Http\Controllers;

use App\Models\Pregnancy;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MaternityController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->query('status', 'active');

        $pregnancies = Pregnancy::with('patient:id,first_name,last_name,mrn,dob')
            ->when($status !== 'all', fn ($q) => $q->where('status', $status))
            ->latest()
            ->limit(100)
            ->get();

        return Inertia::render('Maternity/Index', ['pregnancies' => $pregnancies, 'status' => $status]);
    }

    public function create()
    {
        return Inertia::render('Maternity/Create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'lmp' => 'nullable|date',
            'gravida' => 'nullable|integer|min:0|max:30',
            'para' => 'nullable|integer|min:0|max:30',
            'abortions' => 'nullable|integer|min:0|max:30',
            'blood_group' => 'nullable|string|max:5',
            'rhesus' => 'nullable|string|max:3',
            'risk_level' => 'nullable|in:low,high',
            'risk_factors' => 'nullable|string|max:1000',
            'notes' => 'nullable|string|max:2000',
        ]);

        $pregnancy = Pregnancy::create($data + ['status' => 'active', 'risk_level' => $data['risk_level'] ?? 'low']);

        return redirect()->route('maternity.show', $pregnancy)->with('success', "Antenatal record {$pregnancy->reference} created.");
    }

    public function show(Pregnancy $maternity)
    {
        $maternity->load([
            'patient:id,first_name,last_name,mrn,dob,phone,blood_group',
            'ancVisits',
            'partographEntries',
            'delivery',
        ]);

        return Inertia::render('Maternity/Show', ['pregnancy' => $maternity]);
    }

    public function update(Request $request, Pregnancy $maternity)
    {
        $data = $request->validate([
            'status' => 'required|in:active,delivered,closed',
            'risk_level' => 'required|in:low,high',
            'risk_factors' => 'nullable|string|max:1000',
        ]);
        $maternity->update($data);

        return back()->with('success', 'Record updated.');
    }

    public function storeAncVisit(Request $request, Pregnancy $maternity)
    {
        $data = $request->validate([
            'visit_on' => 'required|date',
            'weight' => 'nullable|numeric|min:0|max:300',
            'bp_sys' => 'nullable|integer|min:0|max:300',
            'bp_dia' => 'nullable|integer|min:0|max:200',
            'fundal_height' => 'nullable|numeric|min:0|max:60',
            'fetal_heart_rate' => 'nullable|integer|min:0|max:250',
            'presentation' => 'nullable|string|max:20',
            'urine_protein' => 'nullable|string|max:20',
            'urine_glucose' => 'nullable|string|max:20',
            'hb' => 'nullable|numeric|min:0|max:25',
            'note' => 'nullable|string|max:255',
        ]);

        $ga = $maternity->lmp
            ? (int) floor($maternity->lmp->diffInDays($data['visit_on']) / 7)
            : null;

        $maternity->ancVisits()->create($data + ['ga_weeks' => $ga, 'recorded_by' => auth()->id()]);

        return back()->with('success', 'Antenatal visit recorded.');
    }

    public function storePartograph(Request $request, Pregnancy $maternity)
    {
        $data = $request->validate([
            'recorded_at' => 'required|date',
            'cervix_cm' => 'nullable|integer|min:0|max:10',
            'descent' => 'nullable|integer|min:0|max:5',
            'fetal_heart_rate' => 'nullable|integer|min:0|max:250',
            'contractions_per10' => 'nullable|integer|min:0|max:10',
            'liquor' => 'nullable|string|max:3',
            'moulding' => 'nullable|string|max:5',
            'pulse' => 'nullable|integer|min:0|max:250',
            'bp_sys' => 'nullable|integer|min:0|max:300',
            'bp_dia' => 'nullable|integer|min:0|max:200',
            'temp' => 'nullable|numeric|min:30|max:45',
            'note' => 'nullable|string|max:255',
        ]);

        $maternity->partographEntries()->create($data + ['recorded_by' => auth()->id()]);

        return back()->with('success', 'Partograph entry added.');
    }

    public function saveDelivery(Request $request, Pregnancy $maternity)
    {
        $data = $request->validate([
            'delivered_at' => 'nullable|date',
            'mode' => 'nullable|string|max:30',
            'outcome' => 'nullable|string|max:30',
            'baby_sex' => 'nullable|in:F,M',
            'birth_weight' => 'nullable|numeric|min:0|max:8',
            'apgar_1' => 'nullable|integer|min:0|max:10',
            'apgar_5' => 'nullable|integer|min:0|max:10',
            'complications' => 'nullable|string|max:1000',
            'notes' => 'nullable|string|max:2000',
        ]);

        $maternity->delivery()->updateOrCreate(
            ['pregnancy_id' => $maternity->id],
            $data + ['recorded_by' => auth()->id()],
        );

        if (! empty($data['delivered_at'])) {
            $maternity->update(['status' => 'delivered']);
        }

        return back()->with('success', 'Delivery record saved.');
    }
}
