import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Admission, Bed, PageProps } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEvent } from 'react';

const field = 'mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-[#0E9F63] focus:ring-[#0E9F63] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200';
const lbl = 'text-xs font-medium text-gray-500';
const card = 'rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800';

function NoteForm({ admission }: { admission: Admission }) {
    const { data, setData, post, processing, reset } = useForm<any>({
        kind: 'progress', note: '', noted_at: new Date().toISOString().slice(0, 16),
        temp: '', pulse: '', bp_sys: '', bp_dia: '', spo2: '',
    });
    const submit = (e: FormEvent) => { e.preventDefault(); post(route('inpatient.notes.store', admission.id), { preserveScroll: true, onSuccess: () => reset() }); };
    return (
        <form onSubmit={submit} className="rounded-lg border border-dashed border-gray-300 p-3 dark:border-gray-600">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div><label className={lbl}>Kind</label><select className={field} value={data.kind} onChange={(e) => setData('kind', e.target.value)}>{['progress', 'nursing', 'round'].map((k) => <option key={k}>{k}</option>)}</select></div>
                <div><label className={lbl}>Time</label><input type="datetime-local" className={field} value={data.noted_at} onChange={(e) => setData('noted_at', e.target.value)} /></div>
                <div><label className={lbl}>Temp</label><input className={field} value={data.temp} onChange={(e) => setData('temp', e.target.value)} /></div>
                <div><label className={lbl}>Pulse</label><input className={field} value={data.pulse} onChange={(e) => setData('pulse', e.target.value)} /></div>
                <div><label className={lbl}>BP sys</label><input className={field} value={data.bp_sys} onChange={(e) => setData('bp_sys', e.target.value)} /></div>
                <div><label className={lbl}>BP dia</label><input className={field} value={data.bp_dia} onChange={(e) => setData('bp_dia', e.target.value)} /></div>
                <div><label className={lbl}>SpO₂</label><input className={field} value={data.spo2} onChange={(e) => setData('spo2', e.target.value)} /></div>
            </div>
            <div className="mt-2">
                <textarea className={field} rows={2} value={data.note} onChange={(e) => setData('note', e.target.value)} placeholder="Note…" />
            </div>
            <div className="mt-2 flex justify-end"><button disabled={processing} className="rounded-md bg-[#0A3D62] px-3 py-2 text-sm font-medium text-white hover:bg-[#0E4A78]">Add note</button></div>
        </form>
    );
}

function ManageBar({ admission, freeBeds }: { admission: Admission; freeBeds: Bed[] }) {
    const transfer = useForm<any>({ bed_id: '' });
    const discharge = useForm<any>({ discharge_summary: '', discharged_at: new Date().toISOString().slice(0, 16) });
    const doTransfer = (e: FormEvent) => { e.preventDefault(); transfer.patch(route('inpatient.transfer', admission.id), { preserveScroll: true }); };
    const doDischarge = (e: FormEvent) => { e.preventDefault(); discharge.patch(route('inpatient.discharge', admission.id), { preserveScroll: true }); };
    return (
        <div className="grid gap-4 sm:grid-cols-2">
            <form onSubmit={doTransfer} className={card}>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Transfer bed</h3>
                <div className="flex items-end gap-2">
                    <select className={field} value={transfer.data.bed_id} onChange={(e) => transfer.setData('bed_id', e.target.value)}>
                        <option value="">Select free bed…</option>
                        {freeBeds.map((b) => <option key={b.id} value={b.id}>{b.ward?.name} · {b.label}</option>)}
                    </select>
                    <button disabled={transfer.processing || !transfer.data.bed_id} className="rounded-md bg-[#0A3D62] px-3 py-2 text-sm font-medium text-white hover:bg-[#0E4A78] disabled:opacity-50">Move</button>
                </div>
            </form>
            <form onSubmit={doDischarge} className={card}>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Discharge</h3>
                <textarea className={field} rows={2} value={discharge.data.discharge_summary} onChange={(e) => discharge.setData('discharge_summary', e.target.value)} placeholder="Discharge summary" />
                <div className="mt-2 flex justify-end"><button disabled={discharge.processing} className="rounded-md bg-[#0E9F63] px-3 py-2 text-sm font-semibold text-white hover:bg-[#0B7F50]">Discharge patient</button></div>
            </form>
        </div>
    );
}

export default function Show({ admission, freeBeds }: { admission: Admission; freeBeds: Bed[] }) {
    const flash = usePage<PageProps>().props.flash;
    const notes = admission.notes ?? [];
    const active = admission.status === 'active';

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Admission</h2>}>
            <Head title={admission.reference ?? 'Admission'} />
            <div className="mx-auto max-w-4xl space-y-5 p-4 sm:p-6 lg:p-8">
                {flash?.success && <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-200">{flash.success}</div>}

                <div className={card}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <div className="font-mono text-xs text-gray-400">{admission.reference}</div>
                            <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{admission.patient?.full_name}</div>
                            <div className="text-sm text-gray-500">
                                {admission.patient?.mrn}
                                {admission.bed && <> · {admission.bed.ward?.name} · {admission.bed.label}</>}
                                {admission.reason && <> · {admission.reason}</>}
                            </div>
                            <div className="mt-1 text-xs text-gray-400">
                                Admitted {admission.admitted_at?.replace('T', ' ').slice(0, 16)}
                                {admission.discharged_at && <> · Discharged {admission.discharged_at.replace('T', ' ').slice(0, 16)}</>}
                            </div>
                        </div>
                        <span className={'rounded px-2 py-0.5 text-xs font-medium capitalize ' + (active ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200')}>{admission.status}</span>
                    </div>
                    {admission.discharge_summary && !active && (
                        <p className="mt-3 rounded bg-gray-50 px-3 py-2 text-sm text-gray-700 dark:bg-gray-900/40 dark:text-gray-300">{admission.discharge_summary}</p>
                    )}
                </div>

                {active && <ManageBar admission={admission} freeBeds={freeBeds} />}

                <div className={card}>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Progress notes</h3>
                    {active && <NoteForm admission={admission} />}
                    <div className="mt-4 space-y-3">
                        {notes.map((n) => (
                            <div key={n.id} className="rounded-lg border border-gray-100 p-3 dark:border-gray-700">
                                <div className="flex items-center justify-between text-xs text-gray-400">
                                    <span className="font-medium capitalize text-gray-600 dark:text-gray-300">{n.kind}</span>
                                    <span>{n.noted_at?.replace('T', ' ').slice(0, 16)} · {n.author?.name}</span>
                                </div>
                                {(n.temp || n.pulse || n.bp_sys || n.spo2) && (
                                    <div className="mt-1 text-xs text-gray-500">
                                        {n.temp && <>T {n.temp}°C </>}{n.pulse && <>· P {n.pulse} </>}{n.bp_sys && n.bp_dia && <>· BP {n.bp_sys}/{n.bp_dia} </>}{n.spo2 && <>· SpO₂ {n.spo2}%</>}
                                    </div>
                                )}
                                <p className="mt-1 whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">{n.note}</p>
                            </div>
                        ))}
                        {notes.length === 0 && <p className="text-sm text-gray-400">No notes yet.</p>}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
