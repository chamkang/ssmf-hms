import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTrans } from '@/i18n';
import { Head, router } from '@inertiajs/react';

const fcfa = (n: number) => n.toLocaleString() + ' FCFA';

function Stat({ title, count, total, paymentsLabel, accent }: { title: string; count: number; total: number; paymentsLabel: string; accent?: boolean }) {
    return (
        <div className={`rounded-xl border p-5 shadow-sm ${accent ? 'border-[#0A3D62] bg-[#0A3D62] text-white' : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'}`}>
            <div className={`text-sm uppercase tracking-wide ${accent ? 'text-blue-100' : 'text-gray-500'}`}>{title}</div>
            <div className="mt-2 text-2xl font-bold">{fcfa(total)}</div>
            <div className={`text-xs ${accent ? 'text-blue-100' : 'text-gray-400'}`}>{count} {paymentsLabel}</div>
        </div>
    );
}

export default function Report({
    date, cash, momo, total, count,
}: {
    date: string;
    cash: { count: number; total: number };
    momo: { count: number; total: number };
    total: number;
    count: number;
}) {
    const { t } = useTrans();
    const pl = (n: number) => (n === 1 ? t('billing.payment') : t('billing.payments'));
    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">{t('reports.daily_cash')}</h2>}>
            <Head title={t('billing.daily')} />
            <div className="mx-auto max-w-4xl space-y-5 p-4 sm:p-6 lg:p-8">
                <input type="date" value={date} onChange={(e) => router.get(route('billing.report'), { date: e.target.value }, { preserveState: true })}
                    className="rounded-md border-gray-300 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Stat title={t('billing.cash')} count={cash.count} total={cash.total} paymentsLabel={pl(cash.count)} />
                    <Stat title={t('billing.momo')} count={momo.count} total={momo.total} paymentsLabel={pl(momo.count)} />
                    <Stat title={t('billing.total_collected')} count={count} total={total} paymentsLabel={pl(count)} accent />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
