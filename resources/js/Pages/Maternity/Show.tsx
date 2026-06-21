import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Pregnancy, PageProps } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

const field = 'mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-[#0E9F63] focus:ring-[#0E9F63] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200';
const lbl = 'text-xs font-medium text-gray-500';
const card = 'rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800';

function Header({ p }: { p: Pregnancy }) {
    const { data, setData, patch, processing } = useForm({
        status: p.status, risk_level: p.risk_level, risk_factors: p.risk_factors ?? '',
    });
    const save = (e: FormEvent) => { e.preventDefault(); patch(route('maternity.update', p.id), { preserveScroll: true }); };
    return (
        <div className={card}>
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <div className="font-mono text-xs text-gray-400">{p.reference}</div>
                    <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{p.patient?.full_name}</div>
                    <div className="text-sm text-gray-500">
                        {p.patient?.mrn}
                        {p.ga_weeks != null && <> · GA {p.ga_weeks} wk</>}
                        {p.edd && <> · EDD {p.edd}</>}
                        {(p.gravida != null || p.para != null) && <> · G{p.gravida ?? '?'}P{p.para ?? '?'}{p.abortions != null ? `A${p.abortions}` : ''}</>}
                        {p.blood_group && <> · {p.blood_group}{p.rhesus ?? ''}</>}
                    </div>
                </div>
                <form onSubmit={save} className="flex flex-wrap items-end gap-2">
                    <div><label className={lbl}>Status</label><select className={field} value={data.status} onChange={(e) => setData('status', e.target.value)}>{['active', 'delivered', 'closed'].map((s) => <option key={s}>{s}</option>)}</select></div>
                    <div><label className={lbl}>Risk</label><select className={field} value={data.risk_level} onChange={(e) => setData('risk_level', e.target.value)}><option value="low">low</option><option value="high">high</option></select></div>
                    <button disabled={processing} className="rounded-md bg-[#0A3D62] px-3 py-2 text-sm font-medium text-white hover:bg-[#0E4A78]">Save</button>
                </form>
            </div>
            {p.risk_factors && <p className="mt-2 rounded bg-amber-50 px-3 py-1.5 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">{p.risk_factors}</p>}
        </div>
    );
}

function AncSection({ p }: { p: Pregnancy }) {
    const visits = p.anc_visits ?? [];
    const { data, setData, post, processing, reset } = useForm<any>({
        visit_on: new Date().toISOString().slice(0, 10), weight: '', bp_sys: '', bp_dia: '',
        fundal_height: '', fetal_heart_rate: '', presentation: '', urine_protein: '', urine_glucose: '', hb: '', note: '',
    });
    const submit = (e: FormEvent) => { e.preventDefault(); post(route('maternity.anc.store', p.id), { preserveScroll: true, onSuccess: () => reset() }); };
    return (
        <div className={card}>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Antenatal visits</h3>
            {visits.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="text-left text-xs uppercase tracking-wide text-gray-500"><tr><th className="py-1 pr-3">Date</th><th className="py-1 pr-3">GA</th><th className="py-1 pr-3">Wt</th><th className="py-1 pr-3">BP</th><th className="py-1 pr-3">SFH</th><th className="py-1 pr-3">FHR</th><th className="py-1 pr-3">Pres.</th><th className="py-1 pr-3">Hb</th></tr></thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {visits.map((v) => (
                                <tr key={v.id} className="text-gray-700 dark:text-gray-300">
                                    <td className="py-1 pr-3">{v.visit_on}</td><td className="py-1 pr-3">{v.ga_weeks ?? '—'}</td><td className="py-1 pr-3">{v.weight ?? '—'}</td>
                                    <td className="py-1 pr-3">{v.bp_sys && v.bp_dia ? `${v.bp_sys}/${v.bp_dia}` : '—'}</td><td className="py-1 pr-3">{v.fundal_height ?? '—'}</td>
                                    <td className="py-1 pr-3">{v.fetal_heart_rate ?? '—'}</td><td className="py-1 pr-3">{v.presentation ?? '—'}</td><td className="py-1 pr-3">{v.hb ?? '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <form onSubmit={submit} className="mt-3 rounded-lg border border-dashed border-gray-300 p-3 dark:border-gray-600">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <div><label className={lbl}>Date</label><input type="date" className={field} value={data.visit_on} onChange={(e) => setData('visit_on', e.target.value)} /></div>
                    <div><label className={lbl}>Weight</label><input className={field} value={data.weight} onChange={(e) => setData('weight', e.target.value)} /></div>
                    <div><label className={lbl}>BP sys</label><input className={field} value={data.bp_sys} onChange={(e) => setData('bp_sys', e.target.value)} /></div>
                    <div><label className={lbl}>BP dia</label><input className={field} value={data.bp_dia} onChange={(e) => setData('bp_dia', e.target.value)} /></div>
                    <div><label className={lbl}>SFH (cm)</label><input className={field} value={data.fundal_height} onChange={(e) => setData('fundal_height', e.target.value)} /></div>
                    <div><label className={lbl}>FHR</label><input className={field} value={data.fetal_heart_rate} onChange={(e) => setData('fetal_heart_rate', e.target.value)} /></div>
                    <div><label className={lbl}>Presentation</label><input className={field} value={data.presentation} onChange={(e) => setData('presentation', e.target.value)} placeholder="cephalic" /></div>
                    <div><label className={lbl}>Hb</label><input className={field} value={data.hb} onChange={(e) => setData('hb', e.target.value)} /></div>
                </div>
                <div className="mt-2 flex items-end gap-2">
                    <input className={`${field} flex-1`} value={data.note} onChange={(e) => setData('note', e.target.value)} placeholder="Note (urine, oedema, plan…)" />
                    <button disabled={processing} className="rounded-md bg-[#0A3D62] px-3 py-2 text-sm font-medium text-white hover:bg-[#0E4A78]">Add visit</button>
                </div>
            </form>
        </div>
    );
}

function PartographSection({ p }: { p: Pregnancy }) {
    const entries = p.partograph_entries ?? [];
    const { data, setData, post, processing, reset } = useForm<any>({
        recorded_at: new Date().toISOString().slice(0, 16), cervix_cm: '', descent: '', fetal_heart_rate: '',
        contractions_per10: '', liquor: '', moulding: '', pulse: '', bp_sys: '', bp_dia: '', temp: '', note: '',
    });
    const submit = (e: FormEvent) => { e.preventDefault(); post(route('maternity.partograph.store', p.id), { preserveScroll: true, onSuccess: () => reset() }); };
    return (
        <div className={card}>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Partograph (labour)</h3>
            {entries.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="text-left text-xs uppercase tracking-wide text-gray-500"><tr><th className="py-1 pr-3">Time</th><th className="py-1 pr-3">Cx</th><th className="py-1 pr-3">Desc.</th><th className="py-1 pr-3">FHR</th><th className="py-1 pr-3">Ctx/10</th><th className="py-1 pr-3">Liquor</th><th className="py-1 pr-3">Mould.</th></tr></thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {entries.map((e) => (
                                <tr key={e.id} className="text-gray-700 dark:text-gray-300">
                                    <td className="py-1 pr-3">{e.recorded_at?.replace('T', ' ').slice(0, 16)}</td><td className="py-1 pr-3">{e.cervix_cm ?? '—'}</td><td className="py-1 pr-3">{e.descent ?? '—'}</td>
                                    <td className="py-1 pr-3">{e.fetal_heart_rate ?? '—'}</td><td className="py-1 pr-3">{e.contractions_per10 ?? '—'}</td><td className="py-1 pr-3">{e.liquor ?? '—'}</td><td className="py-1 pr-3">{e.moulding ?? '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <form onSubmit={submit} className="mt-3 rounded-lg border border-dashed border-gray-300 p-3 dark:border-gray-600">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <div className="col-span-2"><label className={lbl}>Time</label><input type="datetime-local" className={field} value={data.recorded_at} onChange={(e) => setData('recorded_at', e.target.value)} /></div>
                    <div><label className={lbl}>Cervix (cm)</label><input className={field} value={data.cervix_cm} onChange={(e) => setData('cervix_cm', e.target.value)} /></div>
                    <div><label className={lbl}>Descent (/5)</label><input className={field} value={data.descent} onChange={(e) => setData('descent', e.target.value)} /></div>
                    <div><label className={lbl}>FHR</label><input className={field} value={data.fetal_heart_rate} onChange={(e) => setData('fetal_heart_rate', e.target.value)} /></div>
                    <div><label className={lbl}>Ctx /10min</label><input className={field} value={data.contractions_per10} onChange={(e) => setData('contractions_per10', e.target.value)} /></div>
                    <div><label className={lbl}>Liquor</label><input className={field} value={data.liquor} onChange={(e) => setData('liquor', e.target.value)} placeholder="C / M / I" /></div>
                    <div><label className={lbl}>Moulding</label><input className={field} value={data.moulding} onChange={(e) => setData('moulding', e.target.value)} placeholder="0 / + / ++" /></div>
                </div>
                <div className="mt-2 flex items-end gap-2">
                    <input className={`${field} flex-1`} value={data.note} onChange={(e) => setData('note', e.target.value)} placeholder="Note" />
                    <button disabled={processing} className="rounded-md bg-[#0A3D62] px-3 py-2 text-sm font-medium text-white hover:bg-[#0E4A78]">Add entry</button>
                </div>
            </form>
        </div>
    );
}

function DeliverySection({ p }: { p: Pregnancy }) {
    const d = p.delivery;
    const { data, setData, post, processing } = useForm<any>({
        delivered_at: d?.delivered_at?.slice(0, 16) ?? '', mode: d?.mode ?? '', outcome: d?.outcome ?? '',
        baby_sex: d?.baby_sex ?? '', birth_weight: d?.birth_weight ?? '', apgar_1: d?.apgar_1 ?? '', apgar_5: d?.apgar_5 ?? '',
        complications: d?.complications ?? '', notes: d?.notes ?? '',
    });
    const submit = (e: FormEvent) => { e.preventDefault(); post(route('maternity.delivery.save', p.id), { preserveScroll: true }); };
    return (
        <div className={card}>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Delivery</h3>
            <form onSubmit={submit}>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <div className="col-span-2"><label className={lbl}>Delivered at</label><input type="datetime-local" className={field} value={data.delivered_at} onChange={(e) => setData('delivered_at', e.target.value)} /></div>
                    <div><label className={lbl}>Mode</label><select className={field} value={data.mode} onChange={(e) => setData('mode', e.target.value)}><option value="">—</option>{['SVD', 'C-section', 'assisted', 'breech'].map((m) => <option key={m}>{m}</option>)}</select></div>
                    <div><label className={lbl}>Outcome</label><select className={field} value={data.outcome} onChange={(e) => setData('outcome', e.target.value)}><option value="">—</option>{['live birth', 'stillbirth'].map((m) => <option key={m}>{m}</option>)}</select></div>
                    <div><label className={lbl}>Baby sex</label><select className={field} value={data.baby_sex} onChange={(e) => setData('baby_sex', e.target.value)}><option value="">—</option><option value="F">F</option><option value="M">M</option></select></div>
                    <div><label className={lbl}>Weight (kg)</label><input className={field} value={data.birth_weight} onChange={(e) => setData('birth_weight', e.target.value)} /></div>
                    <div><label className={lbl}>Apgar 1'</label><input className={field} value={data.apgar_1} onChange={(e) => setData('apgar_1', e.target.value)} /></div>
                    <div><label className={lbl}>Apgar 5'</label><input className={field} value={data.apgar_5} onChange={(e) => setData('apgar_5', e.target.value)} /></div>
                </div>
                <div className="mt-2"><label className={lbl}>Complications</label><textarea className={field} rows={2} value={data.complications} onChange={(e) => setData('complications', e.target.value)} /></div>
                <div className="mt-2 flex justify-end"><button disabled={processing} className="rounded-md bg-[#0E9F63] px-3 py-2 text-sm font-semibold text-white hover:bg-[#0B7F50]">Save delivery</button></div>
            </form>
        </div>
    );
}

export default function Show({ pregnancy }: { pregnancy: Pregnancy }) {
    const flash = usePage<PageProps>().props.flash;
    const [tab, setTab] = useState<'anc' | 'partograph' | 'delivery'>('anc');
    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Antenatal record</h2>}>
            <Head title={pregnancy.reference ?? 'Maternity'} />
            <div className="mx-auto max-w-4xl space-y-5 p-4 sm:p-6 lg:p-8">
                {flash?.success && <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-200">{flash.success}</div>}
                <Header p={pregnancy} />
                <div className="flex gap-1">
                    {(['anc', 'partograph', 'delivery'] as const).map((t) => (
                        <button key={t} onClick={() => setTab(t)} className={'rounded-md px-3 py-1.5 text-sm font-medium capitalize ' + (tab === t ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700')}>
                            {t === 'anc' ? 'Antenatal' : t}
                        </button>
                    ))}
                </div>
                {tab === 'anc' && <AncSection p={pregnancy} />}
                {tab === 'partograph' && <PartographSection p={pregnancy} />}
                {tab === 'delivery' && <DeliverySection p={pregnancy} />}
            </div>
        </AuthenticatedLayout>
    );
}
