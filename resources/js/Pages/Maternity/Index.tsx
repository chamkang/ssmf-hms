import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Pregnancy } from '@/types';
import { Head, Link, router } from '@inertiajs/react';

const STATUSES = ['active', 'delivered', 'closed', 'all'];

const badge: Record<string, string> = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
    delivered: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200',
    closed: 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
};

export default function Index({ pregnancies, status }: { pregnancies: Pregnancy[]; status: string }) {
    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Maternity</h2>}>
            <Head title="Maternity" />
            <div className="mx-auto max-w-6xl space-y-4 p-4 sm:p-6 lg:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex gap-1">
                        {STATUSES.map((s) => (
                            <button key={s} onClick={() => router.get(route('maternity.index'), s === 'all' ? {} : { status: s }, { preserveState: true })}
                                className={'rounded-md px-3 py-1.5 text-sm font-medium capitalize ' + (status === s ? 'bg-[#0A3D62] text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800')}>
                                {s}
                            </button>
                        ))}
                    </div>
                    <Link href={route('maternity.create')} className="rounded-md bg-[#0E9F63] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B7F50]">+ New record</Link>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-900/40">
                            <tr><th className="px-4 py-3">Reference</th><th className="px-4 py-3">Patient</th><th className="px-4 py-3">GA</th><th className="px-4 py-3">EDD</th><th className="px-4 py-3">Risk</th><th className="px-4 py-3">Status</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {pregnancies.map((p) => (
                                <tr key={p.id} onClick={() => router.visit(route('maternity.show', p.id))} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/40">
                                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.reference}</td>
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{p.patient?.full_name}<span className="ml-2 font-mono text-xs text-gray-400">{p.patient?.mrn}</span></td>
                                    <td className="px-4 py-3">{p.ga_weeks != null ? `${p.ga_weeks} wk` : '—'}</td>
                                    <td className="px-4 py-3">{p.edd ?? '—'}</td>
                                    <td className="px-4 py-3">{p.risk_level === 'high' ? <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/40 dark:text-red-200">high</span> : <span className="text-gray-400">low</span>}</td>
                                    <td className="px-4 py-3"><span className={'rounded px-2 py-0.5 text-xs font-medium capitalize ' + (badge[p.status] ?? '')}>{p.status}</span></td>
                                </tr>
                            ))}
                            {pregnancies.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">No antenatal records.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
