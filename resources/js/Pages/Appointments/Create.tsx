import InputError from '@/Components/InputError';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Doctor, Service } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent, useEffect, useState } from 'react';

interface PatientHit {
    id: number;
    mrn: string | null;
    label: string;
    phone: string | null;
}

const field =
    'mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-[#0E9F63] focus:ring-[#0E9F63] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200';
const label = 'block text-sm font-medium text-gray-700 dark:text-gray-300';

export default function Create({
    doctors,
    services,
}: {
    doctors: Doctor[];
    services: Service[];
}) {
    const { data, setData, post, processing, errors } = useForm<any>({
        patient_id: '',
        doctor_id: '',
        service_id: '',
        date: '',
        time: '',
        notes: '',
    });

    const [q, setQ] = useState('');
    const [hits, setHits] = useState<PatientHit[]>([]);
    const [picked, setPicked] = useState<PatientHit | null>(null);
    const [slots, setSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    useEffect(() => {
        if (picked || q.trim().length < 2) {
            setHits([]);
            return;
        }
        const ctrl = new AbortController();
        const t = setTimeout(() => {
            fetch(route('patients.search') + '?q=' + encodeURIComponent(q), {
                headers: { Accept: 'application/json' },
                credentials: 'same-origin',
                signal: ctrl.signal,
            })
                .then((r) => r.json())
                .then(setHits)
                .catch(() => {});
        }, 250);
        return () => {
            clearTimeout(t);
            ctrl.abort();
        };
    }, [q, picked]);

    useEffect(() => {
        if (!data.doctor_id || !data.date) {
            setSlots([]);
            return;
        }
        setLoadingSlots(true);
        setData('time', '');
        fetch(route('appointments.slots') + '?doctor_id=' + data.doctor_id + '&date=' + data.date, {
            headers: { Accept: 'application/json' },
            credentials: 'same-origin',
        })
            .then((r) => r.json())
            .then((s: string[]) => setSlots(s))
            .catch(() => setSlots([]))
            .finally(() => setLoadingSlots(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.doctor_id, data.date]);

    const pick = (h: PatientHit) => {
        setPicked(h);
        setData('patient_id', h.id);
        setHits([]);
        setQ(h.label);
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('appointments.store'));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">New appointment</h2>}
        >
            <Head title="New appointment" />
            <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
                <form onSubmit={submit} className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    {/* Patient */}
                    <div className="relative">
                        <label className={label}>Patient *</label>
                        <input
                            className={field}
                            value={q}
                            placeholder="Name, record or phone…"
                            onChange={(e) => {
                                setQ(e.target.value);
                                setPicked(null);
                                setData('patient_id', '');
                            }}
                        />
                        <InputError message={errors.patient_id} className="mt-1" />
                        {hits.length > 0 && (
                            <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                                {hits.map((h) => (
                                    <li key={h.id}>
                                        <button type="button" onClick={() => pick(h)} className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-200">
                                            {h.label} {h.phone ? `· ${h.phone}` : ''}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <p className="mt-1 text-xs text-gray-400">
                            Patient not found?{' '}
                            <Link href={route('patients.create')} className="text-[#0E9F63] hover:underline">Register a new patient</Link>.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className={label}>Doctor *</label>
                            <select className={field} value={data.doctor_id} onChange={(e) => setData('doctor_id', e.target.value)}>
                                <option value="">—</option>
                                {doctors.map((d) => (
                                    <option key={d.id} value={d.id}>{d.full_name}{d.specialty_en ? ` — ${d.specialty_en}` : ''}</option>
                                ))}
                            </select>
                            <InputError message={errors.doctor_id} className="mt-1" />
                        </div>
                        <div>
                            <label className={label}>Service *</label>
                            <select className={field} value={data.service_id} onChange={(e) => setData('service_id', e.target.value)}>
                                <option value="">—</option>
                                {services.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name_en ?? s.name_fr}</option>
                                ))}
                            </select>
                            <InputError message={errors.service_id} className="mt-1" />
                        </div>
                        <div>
                            <label className={label}>Date *</label>
                            <input type="date" className={field} value={data.date} onChange={(e) => setData('date', e.target.value)} />
                            <InputError message={errors.date} className="mt-1" />
                        </div>
                    </div>

                    {/* Slots */}
                    <div>
                        <label className={label}>Time slot *</label>
                        {!data.doctor_id || !data.date ? (
                            <p className="mt-1 text-sm text-gray-400">Choose a doctor and date.</p>
                        ) : loadingSlots ? (
                            <p className="mt-1 text-sm text-gray-400">Loading slots…</p>
                        ) : slots.length === 0 ? (
                            <p className="mt-1 text-sm text-amber-600">No slots available on that day.</p>
                        ) : (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {slots.map((s) => (
                                    <button
                                        type="button"
                                        key={s}
                                        onClick={() => setData('time', s)}
                                        className={`rounded-md border px-3 py-1.5 text-sm ${data.time === s ? 'border-[#0E9F63] bg-[#0E9F63] text-white' : 'border-gray-300 text-gray-700 hover:border-[#0E9F63] dark:border-gray-600 dark:text-gray-200'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}
                        <InputError message={errors.time} className="mt-1" />
                    </div>

                    <div>
                        <label className={label}>Notes</label>
                        <textarea className={field} rows={2} value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        <Link href={route('appointments.index')} className="text-sm text-gray-500 hover:underline">Cancel</Link>
                        <button disabled={processing || !data.patient_id || !data.time} className="rounded-md bg-[#0E9F63] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0B7F50] disabled:opacity-50">
                            Confirm appointment
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
