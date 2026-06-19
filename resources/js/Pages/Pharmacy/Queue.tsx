import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, Prescription } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';

const d = (iso?: string) => (iso ? new Date(iso).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' }) : '');

export default function Queue({ prescriptions }: { prescriptions: Prescription[] }) {
    const flash = usePage<PageProps>().props.flash;

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Pharmacy</h2>}>
            <Head title="Pharmacy" />
            <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
                {flash?.success && <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-200">{flash.success}</div>}

                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Dispensing queue</h3>
                    <Link href={route('pharmacy.inventory')} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800">Inventory</Link>
                </div>

                <div className="space-y-3">
                    {prescriptions.length === 0 && <p className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800">Nothing to dispense.</p>}
                    {prescriptions.map((p) => (
                        <div key={p.id} className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <div>
                                <div className="font-medium text-gray-900 dark:text-gray-100">{p.patient?.full_name} <span className="font-mono text-xs text-gray-400">{p.patient?.mrn}</span></div>
                                <ul className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    {(p.items ?? []).map((it) => (
                                        <li key={it.id}>• {it.drug_text}{it.dose ? ` — ${it.dose}` : ''}{it.frequency ? `, ${it.frequency}` : ''}{it.duration ? `, ${it.duration}` : ''}</li>
                                    ))}
                                </ul>
                                <div className="mt-1 text-xs text-gray-400">{p.author?.name} · {d(p.created_at)}</div>
                            </div>
                            <button onClick={() => router.patch(route('pharmacy.dispense', p.id))} className="rounded-md bg-[#0E9F63] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B7F50]">Dispense</button>
                        </div>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
