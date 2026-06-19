import InputError from '@/Components/InputError';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { LabTest } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent, useEffect, useState } from 'react';

interface PatientHit { id: number; mrn: string | null; label: string; phone: string | null; }

const field = 'mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-[#0E9F63] focus:ring-[#0E9F63] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200';
const label = 'block text-sm font-medium text-gray-700 dark:text-gray-300';

export default function Create({ tests }: { tests: LabTest[] }) {
    const { data, setData, post, processing, errors } = useForm<any>({
        patient_id: '', test_ids: [], notes: '',
    });
    const [q, setQ] = useState('');
    const [hits, setHits] = useState<PatientHit[]>([]);
    const [picked, setPicked] = useState<PatientHit | null>(null);

    useEffect(() => {
        if (picked || q.trim().length < 2) { setHits([]); return; }
        const ctrl = new AbortController();
        const t = setTimeout(() => {
            fetch(route('patients.search') + '?q=' + encodeURIComponent(q), { headers: { Accept: 'application/json' }, credentials: 'same-origin', signal: ctrl.signal })
                .then((r) => r.json()).then(setHits).catch(() => {});
        }, 250);
        return () => { clearTimeout(t); ctrl.abort(); };
    }, [q, picked]);

    const toggle = (id: number) =>
        setData('test_ids', data.test_ids.includes(id) ? data.test_ids.filter((x: number) => x !== id) : [...data.test_ids, id]);

    const total = tests.filter((t) => data.test_ids.includes(t.id)).reduce((s, t) => s + (t.price ?? 0), 0);

    const submit = (e: FormEvent) => { e.preventDefault(); post(route('lab.store')); };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">New lab order</h2>}>
            <Head title="New lab order" />
            <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
                <form onSubmit={submit} className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="relative">
                        <label className={label}>Patient *</label>
                        <input className={field} value={q} placeholder="Name, record or phone…"
                            onChange={(e) => { setQ(e.target.value); setPicked(null); setData('patient_id', ''); }} />
                        <InputError message={errors.patient_id} className="mt-1" />
                        {hits.length > 0 && (
                            <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                                {hits.map((h) => (
                                    <li key={h.id}>
                                        <button type="button" onClick={() => { setPicked(h); setData('patient_id', h.id); setHits([]); setQ(h.label); }} className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-200">
                                            {h.label} {h.phone ? `· ${h.phone}` : ''}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div>
                        <label className={label}>Tests *</label>
                        <InputError message={errors.test_ids} className="mt-1" />
                        <div className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
                            {tests.map((t) => (
                                <label key={t.id} className="flex items-center justify-between rounded border border-gray-200 px-3 py-2 text-sm dark:border-gray-700">
                                    <span className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                                        <input type="checkbox" checked={data.test_ids.includes(t.id)} onChange={() => toggle(t.id)} />
                                        {t.name}
                                    </span>
                                    <span className="text-gray-400">{(t.price ?? 0).toLocaleString()} FCFA</span>
                                </label>
                            ))}
                        </div>
                        <p className="mt-2 text-right text-sm font-medium text-gray-700 dark:text-gray-300">Total: {total.toLocaleString()} FCFA</p>
                    </div>

                    <div>
                        <label className={label}>Notes</label>
                        <textarea className={field} rows={2} value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        <Link href={route('lab.index')} className="text-sm text-gray-500 hover:underline">Cancel</Link>
                        <button disabled={processing || !data.patient_id || data.test_ids.length === 0} className="rounded-md bg-[#0E9F63] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0B7F50] disabled:opacity-50">Create order</button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
