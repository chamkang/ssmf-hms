import InputError from '@/Components/InputError';
import PatientPicker from '@/Components/PatientPicker';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Bed } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

const field = 'mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-[#0E9F63] focus:ring-[#0E9F63] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200';
const label = 'block text-sm font-medium text-gray-700 dark:text-gray-300';

export default function Create({ freeBeds }: { freeBeds: Bed[] }) {
    const { data, setData, post, processing, errors } = useForm<any>({
        patient_id: '', bed_id: '', reason: '', admitted_at: new Date().toISOString().slice(0, 16),
    });
    const submit = (e: FormEvent) => { e.preventDefault(); post(route('inpatient.store')); };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Admit patient</h2>}>
            <Head title="Admit patient" />
            <div className="mx-auto max-w-2xl p-4 sm:p-6 lg:p-8">
                <form onSubmit={submit} className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div>
                        <label className={label}>Patient *</label>
                        <PatientPicker value={data.patient_id} onChange={(id) => setData('patient_id', id)} />
                        <InputError message={errors.patient_id} className="mt-1" />
                    </div>
                    <div>
                        <label className={label}>Bed</label>
                        <select className={field} value={data.bed_id} onChange={(e) => setData('bed_id', e.target.value)}>
                            <option value="">— assign later —</option>
                            {freeBeds.map((b) => (
                                <option key={b.id} value={b.id}>{b.ward?.name} · {b.label}</option>
                            ))}
                        </select>
                        <InputError message={errors.bed_id} className="mt-1" />
                    </div>
                    <div>
                        <label className={label}>Admitted at</label>
                        <input type="datetime-local" className={field} value={data.admitted_at} onChange={(e) => setData('admitted_at', e.target.value)} />
                    </div>
                    <div>
                        <label className={label}>Reason / diagnosis</label>
                        <input className={field} value={data.reason} onChange={(e) => setData('reason', e.target.value)} placeholder="e.g. labour, post-op observation" />
                    </div>
                    <div className="flex items-center justify-end gap-3">
                        <Link href={route('inpatient.board')} className="text-sm text-gray-500 hover:underline">Cancel</Link>
                        <button disabled={processing || !data.patient_id} className="rounded-md bg-[#0E9F63] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0B7F50] disabled:opacity-50">Admit</button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
