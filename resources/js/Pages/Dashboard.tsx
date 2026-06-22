import Icon from '@/Components/Icon';
import { usePermissions } from '@/hooks/usePermissions';
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

const tints: Record<string, string> = {
    blue: 'bg-blue-50 text-[#0A3D62] dark:bg-blue-900/30 dark:text-blue-200',
    green: 'bg-emerald-50 text-[#0E9F63] dark:bg-emerald-900/30 dark:text-emerald-200',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
};

function StatCard({ icon, label, value, href, tint }: { icon: string; label: string; value: string | number; href: string; tint: string }) {
    return (
        <Link
            href={href}
            className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
        >
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tints[tint]}`}>
                <Icon name={icon} className="h-6 w-6" />
            </span>
            <span className="min-w-0">
                <span className="block text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{value}</span>
                <span className="block truncate text-sm text-gray-500 dark:text-gray-400">{label}</span>
            </span>
        </Link>
    );
}

export default function Dashboard({ stats }: { stats: Stats }) {
    const user = usePage<PageProps>().props.auth.user;
    const role = usePage<PageProps>().props.auth.role;
    const { t, locale } = useTrans();
    const { can } = usePermissions();

    const today = new Date().toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-GB', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

    const cards = [
        { perm: 'appointments.manage', icon: 'appointments', tint: 'blue', label: t('dashboard.appts_today'), value: stats.appointments_today, href: route('appointments.index') },
        { perm: 'reception.queue', icon: 'clock', tint: 'amber', label: t('dashboard.in_queue'), value: stats.in_queue, href: route('flow-board') },
        { perm: 'billing.manage', icon: 'billing', tint: 'green', label: t('dashboard.revenue_today'), value: fcfa(stats.revenue_today), href: route('billing.report') },
        { perm: 'billing.manage', icon: 'billing', tint: 'blue', label: t('dashboard.open_invoices'), value: stats.open_invoices, href: route('billing.index') },
        { perm: 'lab.results', icon: 'lab', tint: 'amber', label: t('dashboard.pending_labs'), value: stats.pending_labs, href: route('lab.index') },
        { perm: 'patients.view', icon: 'patients', tint: 'green', label: t('dashboard.total_patients'), value: stats.patients_total, href: route('patients.index') },
    ].filter((c) => can(c.perm));

    const ghost = 'inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:border-[#0E9F63] hover:text-[#0E9F63] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200';
    const actions = [
        { perm: 'patients.manage', icon: 'patients', label: t('dashboard.new_patient'), href: route('patients.create'), primary: true },
        { perm: 'appointments.manage', icon: 'appointments', label: t('dashboard.new_appointment'), href: route('appointments.create'), primary: false },
        { perm: 'reception.queue', icon: 'flow', label: t('dashboard.open_flow'), href: route('flow-board'), primary: false },
        { perm: 'lab.results', icon: 'lab', label: t('dash.go_lab'), href: route('lab.index'), primary: false },
        { perm: 'pharmacy.dispense', icon: 'pharmacy', label: t('dash.go_pharmacy'), href: route('pharmacy.queue'), primary: false },
        { perm: 'billing.manage', icon: 'billing', label: t('dash.go_billing'), href: route('billing.create'), primary: false },
        { perm: 'fertility.manage', icon: 'fertility', label: t('dash.go_fertility'), href: route('fertility.index'), primary: false },
        { perm: 'maternity.manage', icon: 'maternity', label: t('dash.go_maternity'), href: route('maternity.index'), primary: false },
        { perm: 'inpatient.manage', icon: 'inpatient', label: t('dash.go_inpatient'), href: route('inpatient.board'), primary: false },
    ].filter((a) => can(a.perm));

    return (
        <AuthenticatedLayout header={<h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{t('dashboard.title')}</h2>}>
            <Head title={t('dashboard.title')} />
            <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
                {/* Greeting */}
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                            {t('dashboard.welcome', { name: user.name })}
                        </h1>
                        <p className="mt-1 text-sm capitalize text-gray-500 dark:text-gray-400">{today}</p>
                    </div>
                    {role && (
                        <span className="rounded-full bg-[#0A3D62]/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#0A3D62] dark:bg-blue-900/30 dark:text-blue-200">
                            {t('role.' + role)}
                        </span>
                    )}
                </div>

                {/* KPI cards */}
                {cards.length > 0 && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {cards.map((c) => (
                            <StatCard key={c.label} icon={c.icon} tint={c.tint} label={c.label} value={c.value} href={c.href} />
                        ))}
                    </div>
                )}

                {/* Quick actions */}
                {actions.length > 0 && (
                    <div>
                        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                            {t('dashboard.quick_actions')}
                        </h2>
                        <div className="flex flex-wrap gap-3">
                            {actions.map((a) => (
                                <Link
                                    key={a.label}
                                    href={a.href}
                                    className={
                                        a.primary
                                            ? 'inline-flex items-center gap-2 rounded-xl bg-[#0E9F63] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0B7F50]'
                                            : ghost
                                    }
                                >
                                    <Icon name={a.icon} className="h-4 w-4" />
                                    {a.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
