import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, Patient } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

interface Paginated {
    data: Patient[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
}

export default function Index({
    patients,
    filters,
}: {
    patients: Paginated;
    filters: { q: string };
}) {
    const [q, setQ] = useState(filters.q ?? '');
    const flash = usePage<PageProps>().props.flash;

    const search = (e: FormEvent) => {
        e.preventDefault();
        router.get(route('patients.index'), { q }, { preserveState: true, replace: true });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Patients
                </h2>
            }
        >
            <Head title="Patients" />
            <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
                {flash?.success && (
                    <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-200">
                        {flash.success}
                    </div>
                )}

                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <form onSubmit={search} className="flex gap-2">
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Rechercher (nom, dossier, téléphone)…"
                            className="w-72 rounded-md border-gray-300 text-sm shadow-sm focus:border-[#0E9F63] focus:ring-[#0E9F63] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                        />
                        <button className="rounded-md bg-[#0A3D62] px-4 py-2 text-sm font-medium text-white hover:bg-[#0E4A78]">
                            Rechercher
                        </button>
                    </form>
                    <Link
                        href={route('patients.create')}
                        className="rounded-md bg-[#0E9F63] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B7F50]"
                    >
                        + Nouveau patient
                    </Link>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900/40">
                            <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                                <th className="px-4 py-3">Dossier</th>
                                <th className="px-4 py-3">Nom</th>
                                <th className="px-4 py-3">Sexe / Âge</th>
                                <th className="px-4 py-3">Téléphone</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {patients.data.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                                        Aucun patient trouvé.
                                    </td>
                                </tr>
                            )}
                            {patients.data.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                                    <td className="px-4 py-3 font-mono text-gray-700 dark:text-gray-300">{p.mrn}</td>
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{p.full_name}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                        {(p.sex ?? '—')}
                                        {p.age != null ? ` · ${p.age} ans` : ''}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{p.phone ?? '—'}</td>
                                    <td className="px-4 py-3 text-right">
                                        <Link href={route('patients.show', p.id)} className="font-medium text-[#0E9F63] hover:underline">
                                            Voir
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 flex flex-wrap gap-1">
                    {patients.links.map((l, i) => (
                        <button
                            key={i}
                            disabled={!l.url}
                            onClick={() => l.url && router.get(l.url, {}, { preserveState: true })}
                            className={`rounded px-3 py-1 text-sm ${l.active ? 'bg-[#0A3D62] text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'} ${!l.url ? 'opacity-40' : ''}`}
                            dangerouslySetInnerHTML={{ __html: l.label }}
                        />
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
