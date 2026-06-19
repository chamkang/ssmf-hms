import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

const fcfa = (n: number) => n.toLocaleString() + ' FCFA';

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="text-sm uppercase tracking-wide text-gray-500">{label}</div>
            <div className="mt-1 text-2xl font-bold text-[#0A3D62] dark:text-blue-300">{value}</div>
            {sub && <div className="text-xs text-gray-400">{sub}</div>}
        </div>
    );
}

export default function Index({
    month_label, revenue, appointments, new_patients_month, lab_orders_month, top_diagnoses,
}: {
    month_label: string;
    revenue: { today: number; month: number; cash_month: number; momo_month: number };
    appointments: { month: number; no_show: number };
    new_patients_month: number;
    lab_orders_month: number;
    top_diagnoses: { label: string; n: number | string }[];
}) {
    const noShowRate = appointments.month > 0 ? Math.round((appointments.no_show / appointments.month) * 100) : 0;

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Reports</h2>}>
            <Head title="Reports" />
            <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6 lg:p-8">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm text-gray-500">Overview for <span className="font-medium text-gray-700 dark:text-gray-300">{month_label}</span></p>
                    <div className="flex gap-2">
                        <Link href={route('billing.report')} className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800">Daily cash report</Link>
                        <Link href={route('audit.index')} className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800">Audit log</Link>
                    </div>
                </div>

                <div>
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Revenue</h3>
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        <Stat label="Today" value={fcfa(revenue.today)} />
                        <Stat label="This month" value={fcfa(revenue.month)} />
                        <Stat label="Cash (month)" value={fcfa(revenue.cash_month)} />
                        <Stat label="Mobile Money (month)" value={fcfa(revenue.momo_month)} />
                    </div>
                </div>

                <div>
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Activity (this month)</h3>
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        <Stat label="Appointments" value={String(appointments.month)} />
                        <Stat label="No-shows" value={String(appointments.no_show)} sub={`${noShowRate}% no-show rate`} />
                        <Stat label="New patients" value={String(new_patients_month)} />
                        <Stat label="Lab orders" value={String(lab_orders_month)} />
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Top diagnoses</h3>
                    {top_diagnoses.length === 0 ? (
                        <p className="text-sm text-gray-400">No diagnoses recorded yet.</p>
                    ) : (
                        <ul className="space-y-1 text-sm">
                            {top_diagnoses.map((d, i) => (
                                <li key={i} className="flex justify-between text-gray-800 dark:text-gray-200">
                                    <span>{d.label}</span>
                                    <span className="font-medium text-gray-500">{d.n}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
