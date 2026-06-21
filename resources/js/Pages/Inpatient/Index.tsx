import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Admission } from '@/types';
import { Head, Link, router } from '@inertiajs/react';

const STATUSES = ['active', 'discharged', 'all'];

export default function Index({ admissions, status }: { admissions: Admission[]; status: string }) {
    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Admissions</h2>}>
            <Head title="Admissions" />
            <div className="mx-auto max-w-6xl space-y-4 p-4 sm:p-6 lg:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex gap-1">
                        {STATUSES.map((s) => (
                            <button key={s} onClick={() => router.get(route('inpatient.index'), s === 'all' ? {} : { status: s }, { preserveState: true })}
                                className={'rounded-md px-3 py-1.5 text-sm font-medium capitalize ' + (status === s ? 'bg-[#0A3D62] text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800')}>
                                {s}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('inpatient.board')} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800">Bed board</Link>
                        <Link href={route('inpatient.create')} className="rounded-md bg-[#0E9F63] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B7F50]">+ Admit patient</Link>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-900/40">
                            <tr><th className="px-4 py-3">Reference</th><th className="px-4 py-3">Patient</th><th className="px-4 py-3">Bed</th><th className="px-4 py-3">Admitted</th><th className="px-4 py-3">Attending</th><th className="px-4 py-3">Status</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {admissions.map((a) => (
                                <tr key={a.id} onClick={() => router.visit(route('inpatient.show', a.id))} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/40">
                                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{a.reference}</td>
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{a.patient?.full_name}<span className="ml-2 font-mono text-xs text-gray-400">{a.patient?.mrn}</span></td>
                                    <td className="px-4 py-3">{a.bed ? `${a.bed.ward?.name} · ${a.bed.label}` : '—'}</td>
                                    <td className="px-4 py-3">{a.admitted_at?.replace('T', ' ').slice(0, 16)}</td>
                                    <td className="px-4 py-3">{a.attending?.name ?? '—'}</td>
                                    <td className="px-4 py-3"><span className={'rounded px-2 py-0.5 text-xs font-medium capitalize ' + (a.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200')}>{a.status}</span></td>
                                </tr>
                            ))}
                            {admissions.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">No admissions.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
