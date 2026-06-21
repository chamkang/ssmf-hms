import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTrans } from '@/i18n';
import { FertilityCase } from '@/types';
import { Head, Link, router } from '@inertiajs/react';

const STATUSES = ['all', 'open', 'active', 'closed'];

const badge: Record<string, string> = {
    open: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
    active: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
    closed: 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
};

export default function Index({
    cases,
    status,
}: {
    cases: FertilityCase[];
    status: string;
}) {
    const { t } = useTrans();
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    {t('fert.cases_title')}
                </h2>
            }
        >
            <Head title={t('nav.fertility')} />
            <div className="mx-auto max-w-6xl space-y-4 p-4 sm:p-6 lg:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex gap-1">
                        {STATUSES.map((s) => (
                            <button
                                key={s}
                                onClick={() =>
                                    router.get(route('fertility.index'), s === 'all' ? {} : { status: s }, { preserveState: true })
                                }
                                className={
                                    'rounded-md px-3 py-1.5 text-sm font-medium ' +
                                    (status === s
                                        ? 'bg-[#0A3D62] text-white'
                                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800')
                                }
                            >
                                {s === 'all' ? t('common.all') : t('fert_status.' + s)}
                            </button>
                        ))}
                    </div>
                    <Link
                        href={route('fertility.create')}
                        className="rounded-md bg-[#0E9F63] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B7F50]"
                    >
                        {t('fert.new_case')}
                    </Link>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-900/40">
                            <tr>
                                <th className="px-4 py-3">{t('common.reference')}</th>
                                <th className="px-4 py-3">{t('fert.col_female')}</th>
                                <th className="px-4 py-3">{t('fert.col_male')}</th>
                                <th className="px-4 py-3">{t('fert.col_diagnosis')}</th>
                                <th className="px-4 py-3 text-center">{t('fert.col_cycles')}</th>
                                <th className="px-4 py-3">{t('common.status')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {cases.map((c) => (
                                <tr
                                    key={c.id}
                                    onClick={() => router.visit(route('fertility.show', c.id))}
                                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/40"
                                >
                                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{c.reference}</td>
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                                        {c.female?.full_name}
                                        <span className="ml-2 font-mono text-xs text-gray-400">{c.female?.mrn}</span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                        {c.male?.full_name ?? <span className="text-gray-400">—</span>}
                                    </td>
                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{c.diagnosis ?? '—'}</td>
                                    <td className="px-4 py-3 text-center">{c.cycles_count ?? 0}</td>
                                    <td className="px-4 py-3">
                                        <span className={'rounded px-2 py-0.5 text-xs font-medium ' + (badge[c.status] ?? '')}>
                                            {t('fert_status.' + c.status)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {cases.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                                        {t('fert.none')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
