import CycleChart from '@/Components/CycleChart';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTrans } from '@/i18n';
import { ArtCycle, FertilityCase, PageProps } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

const field =
    'mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-[#0E9F63] focus:ring-[#0E9F63] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200';
const lbl = 'text-xs font-medium text-gray-500';
const card = 'rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800';

const CYCLE_TYPES = ['IVF', 'ICSI', 'IUI', 'FET', 'OI'];
const CYCLE_STATUSES = ['planned', 'stimulating', 'triggered', 'retrieved', 'transferred', 'completed', 'cancelled'];

const statusBadge: Record<string, string> = {
    planned: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
    stimulating: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
    triggered: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200',
    retrieved: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-200',
    transferred: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
    cancelled: 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
};

function CaseHeader({ c }: { c: FertilityCase }) {
    const { data, setData, patch, processing } = useForm({
        status: c.status,
        diagnosis: c.diagnosis ?? '',
        notes: c.notes ?? '',
    });
    const save = (e: FormEvent) => {
        e.preventDefault();
        patch(route('fertility.update', c.id), { preserveScroll: true });
    };
    return (
        <div className={card}>
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <div className="font-mono text-xs text-gray-400">{c.reference}</div>
                    <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {c.female?.full_name}
                        {c.male && <span className="text-gray-400"> &amp; {c.male.full_name}</span>}
                    </div>
                    <div className="text-sm text-gray-500">
                        ♀ {c.female?.mrn}
                        {c.male && <> · ♂ {c.male.mrn}</>}
                        {c.referral_reason && <> · {c.referral_reason}</>}
                    </div>
                </div>
                <form onSubmit={save} className="flex flex-wrap items-end gap-2">
                    <div>
                        <label className={lbl}>Status</label>
                        <select className={field} value={data.status} onChange={(e) => setData('status', e.target.value)}>
                            {['open', 'active', 'closed'].map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={lbl}>Diagnosis</label>
                        <input className={field} value={data.diagnosis} onChange={(e) => setData('diagnosis', e.target.value)} />
                    </div>
                    <button disabled={processing} className="rounded-md bg-[#0A3D62] px-3 py-2 text-sm font-medium text-white hover:bg-[#0E4A78]">
                        Save
                    </button>
                </form>
            </div>
        </div>
    );
}

function StartCycle({ caseId }: { caseId: number }) {
    const [open, setOpen] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        type: 'IVF',
        protocol: '',
        started_on: new Date().toISOString().slice(0, 10),
        notes: '',
    });
    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('fertility.cycles.store', caseId), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setOpen(false);
            },
        });
    };
    if (!open) {
        return (
            <button onClick={() => setOpen(true)} className="rounded-md bg-[#0E9F63] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B7F50]">
                + Start a cycle
            </button>
        );
    }
    return (
        <form onSubmit={submit} className={card}>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">New cycle</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                    <label className={lbl}>Type</label>
                    <select className={field} value={data.type} onChange={(e) => setData('type', e.target.value)}>
                        {CYCLE_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                </div>
                <div>
                    <label className={lbl}>Protocol</label>
                    <input className={field} value={data.protocol} onChange={(e) => setData('protocol', e.target.value)} placeholder="antagonist…" />
                </div>
                <div>
                    <label className={lbl}>Start date</label>
                    <input type="date" className={field} value={data.started_on} onChange={(e) => setData('started_on', e.target.value)} />
                </div>
                <div className="flex items-end gap-2">
                    <button disabled={processing} className="rounded-md bg-[#0E9F63] px-3 py-2 text-sm font-semibold text-white hover:bg-[#0B7F50]">Create</button>
                    <button type="button" onClick={() => setOpen(false)} className="text-sm text-gray-500 hover:underline">Cancel</button>
                </div>
            </div>
        </form>
    );
}

function MonitoringForm({ cycleId }: { cycleId: number }) {
    const { data, setData, post, processing, reset } = useForm<any>({
        monitored_on: new Date().toISOString().slice(0, 10),
        endo_mm: '', right_follicles: '', left_follicles: '',
        e2: '', lh: '', fsh: '', p4: '', note: '',
    });
    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('fertility.monitorings.store', cycleId), { preserveScroll: true, onSuccess: () => reset() });
    };
    return (
        <form onSubmit={submit} className="mt-3 rounded-lg border border-dashed border-gray-300 p-3 dark:border-gray-600">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div><label className={lbl}>Date</label><input type="date" className={field} value={data.monitored_on} onChange={(e) => setData('monitored_on', e.target.value)} /></div>
                <div><label className={lbl}>Endo (mm)</label><input className={field} value={data.endo_mm} onChange={(e) => setData('endo_mm', e.target.value)} /></div>
                <div><label className={lbl}>Right follicles</label><input className={field} value={data.right_follicles} onChange={(e) => setData('right_follicles', e.target.value)} placeholder="12, 14, 16" /></div>
                <div><label className={lbl}>Left follicles</label><input className={field} value={data.left_follicles} onChange={(e) => setData('left_follicles', e.target.value)} placeholder="13, 15" /></div>
                <div><label className={lbl}>E2</label><input className={field} value={data.e2} onChange={(e) => setData('e2', e.target.value)} /></div>
                <div><label className={lbl}>LH</label><input className={field} value={data.lh} onChange={(e) => setData('lh', e.target.value)} /></div>
                <div><label className={lbl}>FSH</label><input className={field} value={data.fsh} onChange={(e) => setData('fsh', e.target.value)} /></div>
                <div><label className={lbl}>P4</label><input className={field} value={data.p4} onChange={(e) => setData('p4', e.target.value)} /></div>
            </div>
            <div className="mt-2 flex items-end gap-2">
                <input className={`${field} flex-1`} value={data.note} onChange={(e) => setData('note', e.target.value)} placeholder="Note (optional)" />
                <button disabled={processing} className="rounded-md bg-[#0A3D62] px-3 py-2 text-sm font-medium text-white hover:bg-[#0E4A78]">Add visit</button>
            </div>
        </form>
    );
}

function EmbryologyForm({ cycle }: { cycle: ArtCycle }) {
    const e = cycle.embryology;
    const { data, setData, post, processing } = useForm<any>({
        retrieval_date: e?.retrieval_date ?? '',
        oocytes_retrieved: e?.oocytes_retrieved ?? '',
        mature_mii: e?.mature_mii ?? '',
        fertilization_method: e?.fertilization_method ?? '',
        fertilized_2pn: e?.fertilized_2pn ?? '',
        blastocysts: e?.blastocysts ?? '',
        transfer_date: e?.transfer_date ?? '',
        embryos_transferred: e?.embryos_transferred ?? '',
        embryos_frozen: e?.embryos_frozen ?? '',
        embryo_grade: e?.embryo_grade ?? '',
        beta_hcg: e?.beta_hcg ?? '',
        beta_hcg_date: e?.beta_hcg_date ?? '',
        clinical_pregnancy: e?.clinical_pregnancy ?? false,
        outcome: e?.outcome ?? '',
    });
    const submit = (ev: FormEvent) => {
        ev.preventDefault();
        post(route('fertility.embryology.save', cycle.id), { preserveScroll: true });
    };
    return (
        <form onSubmit={submit} className="mt-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div><label className={lbl}>Retrieval date</label><input type="date" className={field} value={data.retrieval_date} onChange={(e) => setData('retrieval_date', e.target.value)} /></div>
                <div><label className={lbl}>Oocytes</label><input className={field} value={data.oocytes_retrieved} onChange={(e) => setData('oocytes_retrieved', e.target.value)} /></div>
                <div><label className={lbl}>Mature (MII)</label><input className={field} value={data.mature_mii} onChange={(e) => setData('mature_mii', e.target.value)} /></div>
                <div>
                    <label className={lbl}>Method</label>
                    <select className={field} value={data.fertilization_method} onChange={(e) => setData('fertilization_method', e.target.value)}>
                        <option value="">—</option><option>IVF</option><option>ICSI</option>
                    </select>
                </div>
                <div><label className={lbl}>2PN fertilized</label><input className={field} value={data.fertilized_2pn} onChange={(e) => setData('fertilized_2pn', e.target.value)} /></div>
                <div><label className={lbl}>Blastocysts</label><input className={field} value={data.blastocysts} onChange={(e) => setData('blastocysts', e.target.value)} /></div>
                <div><label className={lbl}>Transfer date</label><input type="date" className={field} value={data.transfer_date} onChange={(e) => setData('transfer_date', e.target.value)} /></div>
                <div><label className={lbl}>Transferred</label><input className={field} value={data.embryos_transferred} onChange={(e) => setData('embryos_transferred', e.target.value)} /></div>
                <div><label className={lbl}>Frozen</label><input className={field} value={data.embryos_frozen} onChange={(e) => setData('embryos_frozen', e.target.value)} /></div>
                <div><label className={lbl}>Grade</label><input className={field} value={data.embryo_grade} onChange={(e) => setData('embryo_grade', e.target.value)} placeholder="4AA" /></div>
                <div><label className={lbl}>β-hCG</label><input className={field} value={data.beta_hcg} onChange={(e) => setData('beta_hcg', e.target.value)} /></div>
                <div><label className={lbl}>β-hCG date</label><input type="date" className={field} value={data.beta_hcg_date} onChange={(e) => setData('beta_hcg_date', e.target.value)} /></div>
                <div>
                    <label className={lbl}>Outcome</label>
                    <select className={field} value={data.outcome} onChange={(e) => setData('outcome', e.target.value)}>
                        <option value="">—</option>
                        {['negative', 'biochemical', 'ongoing', 'miscarriage', 'live birth'].map((o) => <option key={o}>{o}</option>)}
                    </select>
                </div>
                <label className="flex items-end gap-2 pb-2 text-sm text-gray-700 dark:text-gray-300">
                    <input type="checkbox" checked={!!data.clinical_pregnancy} onChange={(e) => setData('clinical_pregnancy', e.target.checked)} className="rounded border-gray-300 text-[#0E9F63]" />
                    Clinical pregnancy
                </label>
            </div>
            <div className="mt-2 flex justify-end">
                <button disabled={processing} className="rounded-md bg-[#0E9F63] px-3 py-2 text-sm font-semibold text-white hover:bg-[#0B7F50]">Save embryology</button>
            </div>
        </form>
    );
}

function CycleCard({ cycle }: { cycle: ArtCycle }) {
    const [tab, setTab] = useState<'monitoring' | 'embryology'>('monitoring');
    const status = useForm({
        status: cycle.status,
        protocol: cycle.protocol ?? '',
        started_on: cycle.started_on ?? '',
        trigger_on: cycle.trigger_on ?? '',
        notes: cycle.notes ?? '',
    });
    const saveStatus = (e: FormEvent) => {
        e.preventDefault();
        status.patch(route('fertility.cycles.update', cycle.id), { preserveScroll: true });
    };
    const ms = cycle.monitorings ?? [];

    return (
        <div className={card}>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <span className="font-mono text-xs text-gray-400">{cycle.reference}</span>
                    <span className="ml-2 font-semibold text-gray-900 dark:text-gray-100">{cycle.type}</span>
                    {cycle.protocol && <span className="ml-2 text-sm text-gray-500">· {cycle.protocol}</span>}
                </div>
                <span className={'rounded px-2 py-0.5 text-xs font-medium capitalize ' + (statusBadge[cycle.status] ?? '')}>{cycle.status}</span>
            </div>

            <form onSubmit={saveStatus} className="mt-3 flex flex-wrap items-end gap-2 border-b border-gray-100 pb-4 dark:border-gray-700">
                <div>
                    <label className={lbl}>Stage</label>
                    <select className={field} value={status.data.status} onChange={(e) => status.setData('status', e.target.value)}>
                        {CYCLE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div><label className={lbl}>Trigger date</label><input type="date" className={field} value={status.data.trigger_on ?? ''} onChange={(e) => status.setData('trigger_on', e.target.value)} /></div>
                <button disabled={status.processing} className="rounded-md bg-[#0A3D62] px-3 py-2 text-sm font-medium text-white hover:bg-[#0E4A78]">Update</button>
            </form>

            <div className="mt-3 flex gap-1">
                {(['monitoring', 'embryology'] as const).map((t) => (
                    <button key={t} onClick={() => setTab(t)} className={'rounded-md px-3 py-1.5 text-sm font-medium capitalize ' + (tab === t ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700')}>
                        {t}
                    </button>
                ))}
            </div>

            {tab === 'monitoring' ? (
                <div className="mt-3">
                    <CycleChart monitorings={ms} />
                    {ms.length > 0 && (
                        <div className="mt-3 overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="text-left text-xs uppercase tracking-wide text-gray-500">
                                    <tr><th className="py-1 pr-3">Date</th><th className="py-1 pr-3">Endo</th><th className="py-1 pr-3">Follicles</th><th className="py-1 pr-3">Lead</th><th className="py-1 pr-3">E2</th><th className="py-1 pr-3">LH</th><th className="py-1 pr-3">P4</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {ms.map((m) => (
                                        <tr key={m.id} className="text-gray-700 dark:text-gray-300">
                                            <td className="py-1 pr-3">{m.monitored_on}</td>
                                            <td className="py-1 pr-3">{m.endo_mm ?? '—'}</td>
                                            <td className="py-1 pr-3">{m.follicle_count ?? 0} (R{m.right_follicles?.length ?? 0}/L{m.left_follicles?.length ?? 0})</td>
                                            <td className="py-1 pr-3">{m.lead_follicle ?? '—'}</td>
                                            <td className="py-1 pr-3">{m.e2 ?? '—'}</td>
                                            <td className="py-1 pr-3">{m.lh ?? '—'}</td>
                                            <td className="py-1 pr-3">{m.p4 ?? '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <MonitoringForm cycleId={cycle.id} />
                </div>
            ) : (
                <EmbryologyForm cycle={cycle} />
            )}
        </div>
    );
}

export default function Show({ case: c }: { case: FertilityCase }) {
    const flash = usePage<PageProps>().props.flash;
    const { t } = useTrans();
    const cycles = c.cycles ?? [];

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">{t('fert.case_title')}</h2>}>
            <Head title={c.reference ?? t('fert.case_title')} />
            <div className="mx-auto max-w-4xl space-y-5 p-4 sm:p-6 lg:p-8">
                {flash?.success && <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-200">{flash.success}</div>}

                <CaseHeader c={c} />

                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{t('fert.cycles_title')}</h3>
                    <StartCycle caseId={c.id} />
                </div>

                {cycles.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-gray-300 py-10 text-center text-gray-400 dark:border-gray-600">
                        {t('fert.no_cycles')}
                    </p>
                ) : (
                    cycles.map((cy) => <CycleCard key={cy.id} cycle={cy} />)
                )}
            </div>
        </AuthenticatedLayout>
    );
}
