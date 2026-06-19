import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { LabOrder, PageProps } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';

const statusColor: Record<string, string> = {
    ordered: 'bg-amber-100 text-amber-800',
    resulted: 'bg-blue-100 text-blue-700',
    validated: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};
const d = (iso?: string) => (iso ? new Date(iso).toLocaleDateString('en-GB') : '');

export default function Index({ orders, status }: { orders: LabOrder[]; status: string }) {
    const flash = usePage<PageProps>().props.flash;
    const tabs: [string, string][] = [['active', 'Active'], ['validated', 'Validated'], ['all', 'All']];

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Laboratory</h2>}>
            <Head title="Laboratory" />
            <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
                {flash?.success && (
                    <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-200">{flash.success}</div>
                )}
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex gap-1">
                        {tabs.map(([k, lbl]) => (
                            <button key={k} onClick={() => router.get(route('lab.index'), { status: k }, { preserveState: true })}
                                className={`rounded px-3 py-1.5 text-sm ${status === k ? 'bg-[#0A3D62] text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
                                {lbl}
                            </button>
                        ))}
                    </div>
                    <Link href={route('lab.create')} className="rounded-md bg-[#0E9F63] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B7F50]">+ New lab order</Link>
                </div>
                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900/40">
                            <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                                <th className="px-4 py-3">Reference</th><th className="px-4 py-3">Patient</th><th className="px-4 py-3">Tests</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Date</th><th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {orders.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-500">No lab orders.</td></tr>}
                            {orders.map((o) => (
                                <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                                    <td className="px-4 py-3 font-mono text-gray-700 dark:text-gray-300">{o.reference}</td>
                                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{o.patient?.full_name}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{o.items?.length ?? 0}</td>
                                    <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor[o.status] ?? 'bg-gray-100 text-gray-700'}`}>{o.status}</span></td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{d(o.created_at)}</td>
                                    <td className="px-4 py-3 text-right"><Link href={route('lab.show', o.id)} className="font-medium text-[#0E9F63] hover:underline">Open</Link></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
