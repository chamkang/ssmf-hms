<?php

namespace App\Http\Controllers;

use App\Models\ArtCycle;
use App\Models\FertilityCase;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FertilityController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->query('status', 'all');

        $cases = FertilityCase::with(['female:id,first_name,last_name,mrn', 'male:id,first_name,last_name,mrn'])
            ->withCount('cycles')
            ->when($status !== 'all', fn ($q) => $q->where('status', $status))
            ->latest()
            ->limit(100)
            ->get();

        return Inertia::render('Fertility/Index', ['cases' => $cases, 'status' => $status]);
    }

    public function create()
    {
        return Inertia::render('Fertility/Create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'female_patient_id' => 'required|exists:patients,id',
            'male_patient_id' => 'nullable|exists:patients,id|different:female_patient_id',
            'referral_reason' => 'nullable|string|max:255',
            'diagnosis' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:2000',
        ]);

        $case = FertilityCase::create($data + ['status' => 'open']);

        return redirect()->route('fertility.show', $case)->with('success', "Fertility case {$case->reference} created.");
    }

    public function show(FertilityCase $fertility)
    {
        $fertility->load([
            'female:id,first_name,last_name,mrn,dob,phone',
            'male:id,first_name,last_name,mrn,dob,phone',
            'cycles.monitorings',
            'cycles.embryology',
        ]);

        return Inertia::render('Fertility/Show', ['case' => $fertility]);
    }

    public function updateCase(Request $request, FertilityCase $fertility)
    {
        $data = $request->validate([
            'status' => 'required|in:open,active,closed',
            'diagnosis' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:2000',
        ]);
        $fertility->update($data);

        return back()->with('success', 'Case updated.');
    }

    public function storeCycle(Request $request, FertilityCase $fertility)
    {
        $data = $request->validate([
            'type' => 'required|in:IVF,ICSI,IUI,FET,OI',
            'protocol' => 'nullable|string|max:120',
            'started_on' => 'nullable|date',
            'notes' => 'nullable|string|max:2000',
        ]);

        $fertility->cycles()->create($data + ['status' => 'planned']);
        $fertility->update(['status' => 'active']);

        return back()->with('success', 'Cycle started.');
    }

    public function updateCycle(Request $request, ArtCycle $cycle)
    {
        $data = $request->validate([
            'status' => 'required|in:planned,stimulating,triggered,retrieved,transferred,completed,cancelled',
            'protocol' => 'nullable|string|max:120',
            'started_on' => 'nullable|date',
            'trigger_on' => 'nullable|date',
            'notes' => 'nullable|string|max:2000',
        ]);
        $cycle->update($data);

        return back()->with('success', 'Cycle updated.');
    }

    public function storeMonitoring(Request $request, ArtCycle $cycle)
    {
        $data = $request->validate([
            'monitored_on' => 'required|date',
            'endo_mm' => 'nullable|numeric|min:0|max:40',
            'right_follicles' => 'nullable|string|max:255',
            'left_follicles' => 'nullable|string|max:255',
            'e2' => 'nullable|numeric|min:0',
            'lh' => 'nullable|numeric|min:0',
            'fsh' => 'nullable|numeric|min:0',
            'p4' => 'nullable|numeric|min:0',
            'note' => 'nullable|string|max:255',
        ]);

        $cycle->monitorings()->create([
            'monitored_on' => $data['monitored_on'],
            'endo_mm' => $data['endo_mm'] ?? null,
            'right_follicles' => $this->parseFollicles($data['right_follicles'] ?? null),
            'left_follicles' => $this->parseFollicles($data['left_follicles'] ?? null),
            'e2' => $data['e2'] ?? null,
            'lh' => $data['lh'] ?? null,
            'fsh' => $data['fsh'] ?? null,
            'p4' => $data['p4'] ?? null,
            'note' => $data['note'] ?? null,
            'recorded_by' => auth()->id(),
        ]);

        return back()->with('success', 'Monitoring visit recorded.');
    }

    public function saveEmbryology(Request $request, ArtCycle $cycle)
    {
        $data = $request->validate([
            'retrieval_date' => 'nullable|date',
            'oocytes_retrieved' => 'nullable|integer|min:0',
            'mature_mii' => 'nullable|integer|min:0',
            'fertilization_method' => 'nullable|in:IVF,ICSI',
            'fertilized_2pn' => 'nullable|integer|min:0',
            'cleavage_day3' => 'nullable|integer|min:0',
            'blastocysts' => 'nullable|integer|min:0',
            'transfer_date' => 'nullable|date',
            'embryos_transferred' => 'nullable|integer|min:0',
            'embryos_frozen' => 'nullable|integer|min:0',
            'embryo_grade' => 'nullable|string|max:20',
            'beta_hcg' => 'nullable|numeric|min:0',
            'beta_hcg_date' => 'nullable|date',
            'clinical_pregnancy' => 'nullable|boolean',
            'outcome' => 'nullable|string|max:60',
            'notes' => 'nullable|string|max:2000',
        ]);

        $cycle->embryology()->updateOrCreate(
            ['art_cycle_id' => $cycle->id],
            $data + ['recorded_by' => auth()->id()],
        );

        return back()->with('success', 'Embryology record saved.');
    }

    /** Turn "12, 14, 16" into a sorted numeric array of follicle sizes (mm). */
    private function parseFollicles(?string $raw): ?array
    {
        if (! $raw) {
            return null;
        }

        $sizes = collect(preg_split('/[,\s]+/', trim($raw)))
            ->filter(fn ($v) => is_numeric($v))
            ->map(fn ($v) => (float) $v)
            ->sort()
            ->values()
            ->all();

        return empty($sizes) ? null : $sizes;
    }
}
