import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTrans } from '@/i18n';
import { PageProps } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

interface Stats {
    appointments_today: number;
    in_queue: number;
    revenue_today: number;
    open_invoices: number;
    pending_labs: number;
    patients_total: number;
}

const fcfa = (n: number) => n.toLocaleString() + ' FCFA';

function StatCard({ label, value, href, color }: { label: string; value: string | number; href: string; color: string }) {
    return (
        <Link href={href} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
            <div className={`text-3xl font-bold ${color}`}>{value}</div>
            <div className="mt-1 text-sm text-gray-500">{label}</div>
        </Link>
    );
}

export default function Dashboard({ stats }: { stats: Stats }) {
    const user = usePage<PageProps>().props.auth.user;
    const { t } = useTrans();

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">{t('dashboard.title')}</h2>}>
            <Head title={t('dashboard.title')} />
            <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
                <p className="text-gray-600 dark:text-gray-400">{t('dashboard.welcome', { name: user.name })}</p>

                <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                    <StatCard label={t('dashboard.appts_today')} value={stats.appointments_today} href={route('appointments.index')} color="text-[#0A3D62] dark:text-blue-300" />
                    <StatCard label={t('dashboard.in_queue')} value={stats.in_queue} href={route('flow-board')} color="text-amber-600" />
                    <StatCard label={t('dashboard.revenue_today')} value={fcfa(stats.revenue_today)} href={route('billing.report')} color="text-[#0E9F63]" />
                    <StatCard label={t('dashboard.open_invoices')} value={stats.open_invoices} href={route('billing.index')} color="text-[#0A3D62] dark:text-blue-300" />
                    <StatCard label={t('dashboard.pending_labs')} value={stats.pending_labs} href={route('lab.index')} color="text-amber-600" />
                    <StatCard label={t('dashboard.total_patients')} value={stats.patients_total} href={route('patients.index')} color="text-[#0E9F63]" />
                </div>

                <div className="flex flex-wrap gap-3">
                    <Link href={route('patients.create')} className="rounded-md bg-[#0E9F63] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B7F50]">{t('dashboard.new_patient')}</Link>
                    <Link href={route('appointments.create')} className="rounded-md bg-[#0A3D62] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0E4A78]">{t('dashboard.new_appointment')}</Link>
                    <Link href={route('flow-board')} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800">{t('dashboard.open_flow')}</Link>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
