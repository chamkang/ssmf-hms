import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTrans } from '@/i18n';
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
    month_label, revenue, appointments, new_patients_month, lab_orders_month, top_diagnoses, art,
}: {
    month_label: string;
    revenue: { today: number; month: number; cash_month: number; momo_month: number };
    appointments: { month: number; no_show: number };
    new_patients_month: number;
    lab_orders_month: number;
    top_diagnoses: { label: string; n: number | string }[];
    art: { total_cycles: number; transfers: number; clinical_pregnancies: number; pregnancy_rate: number; by_type: { type: string; n: number | string }[] };
}) {
    const noShowRate = appointments.month > 0 ? Math.round((appointments.no_show / appointments.month) * 100) : 0;
    const { t } = useTrans();

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">{t('nav.reports')}</h2>}>
            <Head title={t('nav.reports')} />
            <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6 lg:p-8">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm text-gray-500">{t('reports.overview_for')} <span className="font-medium text-gray-700 dark:text-gray-300">{month_label}</span></p>
                    <div className="flex gap-2">
                        <Link href={route('billing.report')} className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800">{t('reports.daily_cash')}</Link>
                        <Link href={route('audit.index')} className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800">{t('reports.audit_log')}</Link>
                    </div>
                </div>

                <div>
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">{t('reports.revenue')}</h3>
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        <Stat label={t('reports.today')} value={fcfa(revenue.today)} />
                        <Stat label={t('reports.this_month')} value={fcfa(revenue.month)} />
                        <Stat label={t('reports.cash_month')} value={fcfa(revenue.cash_month)} />
                        <Stat label={t('reports.momo_month')} value={fcfa(revenue.momo_month)} />
                    </div>
                </div>

                <div>
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">{t('reports.activity')}</h3>
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        <Stat label={t('reports.appointments')} value={String(appointments.month)} />
                        <Stat label={t('reports.no_shows')} value={String(appointments.no_show)} sub={`${noShowRate}% ${t('reports.no_show_rate')}`} />
                        <Stat label={t('reports.new_patients')} value={String(new_patients_month)} />
                        <Stat label={t('reports.lab_orders')} value={String(lab_orders_month)} />
                    </div>
                </div>

                <div>
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">{t('reports.art_title')}</h3>
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        <Stat label={t('reports.art_cycles')} value={String(art.total_cycles)} sub={art.by_type.map((x) => `${x.type} ${x.n}`).join(' · ')} />
                        <Stat label={t('reports.transfers')} value={String(art.transfers)} />
                        <Stat label={t('reports.pregnancies')} value={String(art.clinical_pregnancies)} />
                        <Stat label={t('reports.preg_rate')} value={`${art.pregnancy_rate}%`} sub={t('reports.per_transfer')} />
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">{t('reports.top_dx')}</h3>
                    {top_diagnoses.length === 0 ? (
                        <p className="text-sm text-gray-400">{t('reports.no_dx')}</p>
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
