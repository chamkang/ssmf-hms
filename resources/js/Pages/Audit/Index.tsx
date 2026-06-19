import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

interface Row {
    id: number;
    time: string | null;
    user: string;
    event: string;
    type: string;
    auditable_id: number | null;
    ip: string | null;
}
interface Paginated {
    data: Row[];
    links: { url: string | null; label: string; active: boolean }[];
}

const eventColor: Record<string, string> = {
    created: 'bg-green-100 text-green-700',
    updated: 'bg-blue-100 text-blue-700',
    deleted: 'bg-red-100 text-red-700',
};

export default function Index({ audits }: { audits: Paginated }) {
    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Audit log</h2>}>
            <Head title="Audit log" />
            <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900/40">
                            <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                                <th className="px-4 py-3">When</th><th className="px-4 py-3">User</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Record</th><th className="px-4 py-3">IP</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {audits.data.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-500">No audit entries.</td></tr>}
                            {audits.data.map((a) => (
                                <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{a.time}</td>
                                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{a.user}</td>
                                    <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${eventColor[a.event] ?? 'bg-gray-100 text-gray-600'}`}>{a.event}</span></td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{a.type} #{a.auditable_id}</td>
                                    <td className="px-4 py-3 text-gray-400">{a.ip}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4 flex flex-wrap gap-1">
                    {audits.links.map((l, i) => (
                        <button key={i} disabled={!l.url} onClick={() => l.url && router.get(l.url, {}, { preserveState: true })}
                            className={`rounded px-3 py-1 text-sm ${l.active ? 'bg-[#0A3D62] text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'} ${!l.url ? 'opacity-40' : ''}`}
                            dangerouslySetInnerHTML={{ __html: l.label }} />
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
