import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Appointment, PageProps } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';

const statusFr: Record<string, string> = {
    pending: 'En attente',
    confirmed: 'Confirmé',
    checked_in: 'Arrivé',
    in_progress: 'En consultation',
    completed: 'Terminé',
    cancelled: 'Annulé',
    no_show: 'Absent',
};
const statusColor: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-700',
    confirmed: 'bg-blue-100 text-blue-700',
    checked_in: 'bg-amber-100 text-amber-800',
    in_progress: 'bg-indigo-100 text-indigo-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    no_show: 'bg-red-100 text-red-700',
};

const hm = (iso: string) => new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

export default function Index({
    appointments,
    date,
}: {
    appointments: Appointment[];
    date: string;
}) {
    const flash = usePage<PageProps>().props.flash;

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Rendez-vous</h2>}
        >
            <Head title="Rendez-vous" />
            <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
                {flash?.success && (
                    <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-200">
                        {flash.success}
                    </div>
                )}

                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => router.get(route('appointments.index'), { date: e.target.value }, { preserveState: true })}
                        className="rounded-md border-gray-300 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                    />
                    <div className="flex gap-2">
                        <Link href={route('flow-board')} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800">
                            File d’attente
                        </Link>
                        <Link href={route('appointments.create')} className="rounded-md bg-[#0E9F63] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B7F50]">
                            + Nouveau rendez-vous
                        </Link>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900/40">
                            <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                                <th className="px-4 py-3">Heure</th>
                                <th className="px-4 py-3">Patient</th>
                                <th className="px-4 py-3">Médecin</th>
                                <th className="px-4 py-3">Service</th>
                                <th className="px-4 py-3">Statut</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {appointments.length === 0 && (
                                <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-500">Aucun rendez-vous pour cette date.</td></tr>
                            )}
                            {appointments.map((a) => (
                                <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{hm(a.starts_at)}</td>
                                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{a.patient?.full_name ?? '—'}<div className="font-mono text-xs text-gray-400">{a.patient?.mrn}</div></td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{a.doctor?.full_name ?? '—'}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{a.service?.name_fr ?? '—'}</td>
                                    <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor[a.status] ?? 'bg-gray-100 text-gray-700'}`}>{statusFr[a.status] ?? a.status}</span></td>
                                    <td className="px-4 py-3 text-right">
                                        {['pending', 'confirmed'].includes(a.status) && (
                                            <span className="flex justify-end gap-3">
                                                <button onClick={() => router.post(route('flow-board.check-in'), { appointment_id: a.id })} className="text-xs font-medium text-[#0E9F63] hover:underline">Arrivée</button>
                                                <button onClick={() => router.patch(route('appointments.status', a.id), { status: 'cancelled' })} className="text-xs font-medium text-red-500 hover:underline">Annuler</button>
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
