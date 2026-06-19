import InputError from '@/Components/InputError';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Tariff } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent, useEffect, useState } from 'react';

interface PatientHit { id: number; mrn: string | null; label: string; phone: string | null; }
const field = 'mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-[#0E9F63] focus:ring-[#0E9F63] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200';
const label = 'block text-sm font-medium text-gray-700 dark:text-gray-300';
const fcfa = (n: number) => n.toLocaleString() + ' FCFA';

export default function Create({ tariffs }: { tariffs: Tariff[] }) {
    const { data, setData, post, processing, errors } = useForm<any>({ patient_id: '', items: [], notes: '' });
    const [q, setQ] = useState('');
    const [hits, setHits] = useState<PatientHit[]>([]);
    const [picked, setPicked] = useState<PatientHit | null>(null);
    const [mLabel, setMLabel] = useState('');
    const [mPrice, setMPrice] = useState('');

    useEffect(() => {
        if (picked || q.trim().length < 2) { setHits([]); return; }
        const ctrl = new AbortController();
        const t = setTimeout(() => {
            fetch(route('patients.search') + '?q=' + encodeURIComponent(q), { headers: { Accept: 'application/json' }, credentials: 'same-origin', signal: ctrl.signal })
                .then((r) => r.json()).then(setHits).catch(() => {});
        }, 250);
        return () => { clearTimeout(t); ctrl.abort(); };
    }, [q, picked]);

    const addLine = (label: string, unit_price: number, source: string) =>
        setData('items', [...data.items, { label, qty: 1, unit_price, source_type: source }]);
    const setQty = (i: number, qty: number) =>
        setData('items', data.items.map((it: any, idx: number) => (idx === i ? { ...it, qty: Math.max(1, qty) } : it)));
    const removeLine = (i: number) => setData('items', data.items.filter((_: any, idx: number) => idx !== i));
    const addManual = () => {
        const price = parseInt(mPrice || '0', 10);
        if (mLabel.trim() && price >= 0) { addLine(mLabel.trim(), price, 'manual'); setMLabel(''); setMPrice(''); }
    };

    const total = data.items.reduce((s: number, it: any) => s + it.qty * it.unit_price, 0);
    const submit = (e: FormEvent) => { e.preventDefault(); post(route('billing.store')); };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">New invoice</h2>}>
            <Head title="New invoice" />
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
                                    <li key={h.id}><button type="button" onClick={() => { setPicked(h); setData('patient_id', h.id); setHits([]); setQ(h.label); }} className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-200">{h.label} {h.phone ? `· ${h.phone}` : ''}</button></li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div>
                        <label className={label}>Add charges</label>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {tariffs.map((t) => (
                                <button key={t.id} type="button" onClick={() => addLine(t.label, t.amount, 'tariff')} className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:border-[#0E9F63] dark:border-gray-600 dark:text-gray-200">
                                    {t.label} <span className="text-gray-400">({fcfa(t.amount)})</span>
                                </button>
                            ))}
                        </div>
                        <div className="mt-3 flex flex-wrap items-end gap-2">
                            <input className={`${field} mt-0 flex-1`} placeholder="Other charge (e.g. lab, pharmacy)…" value={mLabel} onChange={(e) => setMLabel(e.target.value)} />
                            <input className={`${field} mt-0 w-32`} type="number" placeholder="FCFA" value={mPrice} onChange={(e) => setMPrice(e.target.value)} />
                            <button type="button" onClick={addManual} className="rounded-md bg-[#0A3D62] px-3 py-2 text-sm font-medium text-white hover:bg-[#0E4A78]">Add</button>
                        </div>
                        <InputError message={errors.items} className="mt-1" />
                    </div>

                    {data.items.length > 0 && (
                        <table className="min-w-full text-sm">
                            <thead><tr className="text-left text-xs uppercase tracking-wide text-gray-500"><th className="py-2">Item</th><th className="py-2">Qty</th><th className="py-2 text-right">Unit</th><th className="py-2 text-right">Amount</th><th></th></tr></thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {data.items.map((it: any, i: number) => (
                                    <tr key={i}>
                                        <td className="py-2 text-gray-800 dark:text-gray-200">{it.label}</td>
                                        <td className="py-2"><input type="number" className="w-16 rounded border-gray-300 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200" value={it.qty} onChange={(e) => setQty(i, parseInt(e.target.value || '1', 10))} /></td>
                                        <td className="py-2 text-right text-gray-600 dark:text-gray-400">{fcfa(it.unit_price)}</td>
                                        <td className="py-2 text-right font-medium text-gray-900 dark:text-gray-100">{fcfa(it.qty * it.unit_price)}</td>
                                        <td className="py-2 text-right"><button type="button" onClick={() => removeLine(i)} className="text-xs text-red-500 hover:underline">remove</button></td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot><tr><td colSpan={3} className="py-2 text-right font-semibold text-gray-700 dark:text-gray-300">Total</td><td className="py-2 text-right font-bold text-[#0A3D62] dark:text-blue-300">{fcfa(total)}</td><td></td></tr></tfoot>
                        </table>
                    )}

                    <div className="flex items-center justify-end gap-3">
                        <Link href={route('billing.index')} className="text-sm text-gray-500 hover:underline">Cancel</Link>
                        <button disabled={processing || !data.patient_id || data.items.length === 0} className="rounded-md bg-[#0E9F63] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0B7F50] disabled:opacity-50">Create invoice</button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
