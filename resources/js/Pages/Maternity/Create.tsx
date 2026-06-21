import InputError from '@/Components/InputError';
import PatientPicker from '@/Components/PatientPicker';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

const field = 'mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-[#0E9F63] focus:ring-[#0E9F63] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200';
const label = 'block text-sm font-medium text-gray-700 dark:text-gray-300';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm<any>({
        patient_id: '', lmp: '', gravida: '', para: '', abortions: '',
        blood_group: '', rhesus: '', risk_level: 'low', risk_factors: '', notes: '',
    });
    const submit = (e: FormEvent) => { e.preventDefault(); post(route('maternity.store')); };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">New antenatal record</h2>}>
            <Head title="New antenatal record" />
            <div className="mx-auto max-w-2xl p-4 sm:p-6 lg:p-8">
                <form onSubmit={submit} className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div>
                        <label className={label}>Patient *</label>
                        <PatientPicker value={data.patient_id} onChange={(id) => setData('patient_id', id)} />
                        <InputError message={errors.patient_id} className="mt-1" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div><label className={label}>LMP</label><input type="date" className={field} value={data.lmp} onChange={(e) => setData('lmp', e.target.value)} /></div>
                        <div><label className={label}>Gravida</label><input className={field} value={data.gravida} onChange={(e) => setData('gravida', e.target.value)} /></div>
                        <div><label className={label}>Para</label><input className={field} value={data.para} onChange={(e) => setData('para', e.target.value)} /></div>
                        <div><label className={label}>Abortions</label><input className={field} value={data.abortions} onChange={(e) => setData('abortions', e.target.value)} /></div>
                        <div><label className={label}>Blood group</label><input className={field} value={data.blood_group} onChange={(e) => setData('blood_group', e.target.value)} placeholder="O" /></div>
                        <div><label className={label}>Rhesus</label>
                            <select className={field} value={data.rhesus} onChange={(e) => setData('rhesus', e.target.value)}><option value="">—</option><option value="+">+</option><option value="-">−</option></select>
                        </div>
                        <div className="col-span-2"><label className={label}>Risk</label>
                            <select className={field} value={data.risk_level} onChange={(e) => setData('risk_level', e.target.value)}><option value="low">Low</option><option value="high">High</option></select>
                        </div>
                    </div>
                    <div><label className={label}>Risk factors</label><textarea className={field} rows={2} value={data.risk_factors} onChange={(e) => setData('risk_factors', e.target.value)} /></div>
                    <div><label className={label}>Notes</label><textarea className={field} rows={2} value={data.notes} onChange={(e) => setData('notes', e.target.value)} /></div>
                    <div className="flex items-center justify-end gap-3">
                        <Link href={route('maternity.index')} className="text-sm text-gray-500 hover:underline">Cancel</Link>
                        <button disabled={processing || !data.patient_id} className="rounded-md bg-[#0E9F63] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0B7F50] disabled:opacity-50">Create record</button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
