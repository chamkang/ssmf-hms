import InputError from '@/Components/InputError';
import PatientHeader from '@/Components/PatientHeader';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Encounter, Patient, Vital } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent, useEffect, useState } from 'react';

const field =
    'mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-[#0E9F63] focus:ring-[#0E9F63] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200';
const label = 'block text-sm font-medium text-gray-700 dark:text-gray-300';
const sectionTitle = 'mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500';

interface Icd {
    code: string;
    title: string;
}
interface DrugHit {
    id: number;
    label: string;
    route: string | null;
}

export default function Cockpit({
    encounter,
    patient,
}: {
    encounter?: Encounter | null;
    patient: Patient;
    vitals?: Vital | null;
}) {
    const { data, setData, post, processing, errors } = useForm<any>({
        encounter_id: encounter?.id ?? null,
        patient_id: patient.id,
        subjective: '',
        objective: '',
        assessment: '',
        plan: '',
        sign: false,
        vitals: { temp: '', bp_sys: '', bp_dia: '', pulse: '', spo2: '', weight: '' },
        diagnoses: [],
        items: [],
    });

    // ICD-10 search
    const [icdQ, setIcdQ] = useState('');
    const [icdHits, setIcdHits] = useState<Icd[]>([]);
    useEffect(() => {
        if (icdQ.trim().length < 2) {
            setIcdHits([]);
            return;
        }
        const ctrl = new AbortController();
        const t = setTimeout(() => {
            fetch(route('lookup.icd10') + '?q=' + encodeURIComponent(icdQ), {
                headers: { Accept: 'application/json' },
                credentials: 'same-origin',
                signal: ctrl.signal,
            })
                .then((r) => r.json())
                .then(setIcdHits)
                .catch(() => {});
        }, 250);
        return () => {
            clearTimeout(t);
            ctrl.abort();
        };
    }, [icdQ]);

    const addDx = (code: string, text: string) => {
        setData('diagnoses', [
            ...data.diagnoses,
            { icd10_code: code, label: text, is_primary: data.diagnoses.length === 0 },
        ]);
        setIcdQ('');
        setIcdHits([]);
    };
    const removeDx = (i: number) =>
        setData('diagnoses', data.diagnoses.filter((_: any, idx: number) => idx !== i));
    const setPrimary = (i: number) =>
        setData('diagnoses', data.diagnoses.map((d: any, idx: number) => ({ ...d, is_primary: idx === i })));

    // Drug search
    const [drugQ, setDrugQ] = useState('');
    const [drugHits, setDrugHits] = useState<DrugHit[]>([]);
    useEffect(() => {
        if (drugQ.trim().length < 2) {
            setDrugHits([]);
            return;
        }
        const ctrl = new AbortController();
        const t = setTimeout(() => {
            fetch(route('lookup.drugs') + '?q=' + encodeURIComponent(drugQ), {
                headers: { Accept: 'application/json' },
                credentials: 'same-origin',
                signal: ctrl.signal,
            })
                .then((r) => r.json())
                .then(setDrugHits)
                .catch(() => {});
        }, 250);
        return () => {
            clearTimeout(t);
            ctrl.abort();
        };
    }, [drugQ]);

    const addItem = (text: string, drugId: number | null, routeVal: string | null) => {
        setData('items', [
            ...data.items,
            { drug_id: drugId, drug_text: text, dose: '', route: routeVal ?? 'oral', frequency: '', duration: '', quantity: '', instructions: '' },
        ]);
        setDrugQ('');
        setDrugHits([]);
    };
    const setItem = (i: number, key: string, val: string) =>
        setData('items', data.items.map((it: any, idx: number) => (idx === i ? { ...it, [key]: val } : it)));
    const removeItem = (i: number) =>
        setData('items', data.items.filter((_: any, idx: number) => idx !== i));

    const setVital = (k: string, v: string) => setData('vitals', { ...data.vitals, [k]: v });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('consultations.store'));
    };

    const hasAllergies = (patient.allergies?.length ?? 0) > 0;

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Consultation</h2>}
        >
            <Head title={`Consultation — ${patient.full_name}`} />
            <div className="mx-auto max-w-5xl space-y-5 p-4 sm:p-6 lg:p-8">
                <PatientHeader patient={patient} />
                {hasAllergies && (
                    <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:border-red-700 dark:bg-red-900/30 dark:text-red-200">
                        ⚠ This patient has recorded allergies — review before prescribing.
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6">
                    {/* Vitals */}
                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <h3 className={sectionTitle}>Vitals</h3>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
                            {[
                                ['temp', 'Temp °C'], ['bp_sys', 'BP sys'], ['bp_dia', 'BP dia'],
                                ['pulse', 'Pulse'], ['spo2', 'SpO₂ %'], ['weight', 'Weight kg'],
                            ].map(([k, lbl]) => (
                                <div key={k}>
                                    <label className="text-xs text-gray-500">{lbl}</label>
                                    <input className={field} value={data.vitals[k]} onChange={(e) => setVital(k, e.target.value)} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SOAP */}
                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <h3 className={sectionTitle}>Clinical note (SOAP)</h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div><label className={label}>Subjective</label><textarea rows={4} className={field} value={data.subjective} onChange={(e) => setData('subjective', e.target.value)} /></div>
                            <div><label className={label}>Objective</label><textarea rows={4} className={field} value={data.objective} onChange={(e) => setData('objective', e.target.value)} /></div>
                            <div><label className={label}>Assessment</label><textarea rows={4} className={field} value={data.assessment} onChange={(e) => setData('assessment', e.target.value)} /></div>
                            <div><label className={label}>Plan</label><textarea rows={4} className={field} value={data.plan} onChange={(e) => setData('plan', e.target.value)} /></div>
                        </div>
                    </div>

                    {/* Diagnoses */}
                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <h3 className={sectionTitle}>Diagnoses (ICD-10)</h3>
                        <div className="relative">
                            <input className={field} placeholder="Search ICD-10 code or title…" value={icdQ}
                                onChange={(e) => setIcdQ(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (icdQ.trim()) addDx('', icdQ.trim()); } }} />
                            {icdHits.length > 0 && (
                                <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                                    {icdHits.map((c) => (
                                        <li key={c.code}>
                                            <button type="button" onClick={() => addDx(c.code, `${c.code} — ${c.title}`)} className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-200">
                                                <span className="font-mono">{c.code}</span> — {c.title}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <ul className="mt-3 space-y-1">
                            {data.diagnoses.map((d: any, i: number) => (
                                <li key={i} className="flex items-center justify-between rounded bg-gray-50 px-3 py-1.5 text-sm dark:bg-gray-900/40">
                                    <span className="text-gray-800 dark:text-gray-200">{d.label}</span>
                                    <span className="flex items-center gap-3">
                                        <label className="flex items-center gap-1 text-xs text-gray-500">
                                            <input type="radio" name="primaryDx" checked={d.is_primary} onChange={() => setPrimary(i)} /> primary
                                        </label>
                                        <button type="button" onClick={() => removeDx(i)} className="text-xs text-red-500 hover:underline">remove</button>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Prescription */}
                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <h3 className={sectionTitle}>Prescription</h3>
                        <div className="relative">
                            <input className={field} placeholder="Search the drug formulary…" value={drugQ}
                                onChange={(e) => setDrugQ(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (drugQ.trim()) addItem(drugQ.trim(), null, 'oral'); } }} />
                            {drugHits.length > 0 && (
                                <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                                    {drugHits.map((d) => (
                                        <li key={d.id}>
                                            <button type="button" onClick={() => addItem(d.label, d.id, d.route)} className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-200">
                                                {d.label}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="mt-3 space-y-3">
                            {data.items.map((it: any, i: number) => (
                                <div key={i} className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="font-medium text-gray-900 dark:text-gray-100">{it.drug_text}</span>
                                        <button type="button" onClick={() => removeItem(i)} className="text-xs text-red-500 hover:underline">remove</button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                        <input className={`${field} mt-0`} placeholder="Dose" value={it.dose} onChange={(e) => setItem(i, 'dose', e.target.value)} />
                                        <input className={`${field} mt-0`} placeholder="Frequency" value={it.frequency} onChange={(e) => setItem(i, 'frequency', e.target.value)} />
                                        <input className={`${field} mt-0`} placeholder="Duration" value={it.duration} onChange={(e) => setItem(i, 'duration', e.target.value)} />
                                        <input className={`${field} mt-0`} placeholder="Instructions" value={it.instructions} onChange={(e) => setItem(i, 'instructions', e.target.value)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <input type="checkbox" checked={data.sign} onChange={(e) => setData('sign', e.target.checked)} />
                            Sign this consultation
                        </label>
                        <div className="flex items-center gap-3">
                            <Link href={route('patients.show', patient.id)} className="text-sm text-gray-500 hover:underline">Cancel</Link>
                            <button disabled={processing} className="rounded-md bg-[#0E9F63] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0B7F50] disabled:opacity-50">Save consultation</button>
                        </div>
                    </div>
                    <InputError message={errors.patient_id} />
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
