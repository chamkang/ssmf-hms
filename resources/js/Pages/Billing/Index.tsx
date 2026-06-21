import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTrans } from '@/i18n';
import { Invoice, PageProps } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';

const statusColor: Record<string, string> = {
    open: 'bg-amber-100 text-amber-800',
    part_paid: 'bg-blue-100 text-blue-700',
    paid: 'bg-green-100 text-green-700',
    void: 'bg-gray-100 text-gray-500',
};
const fcfa = (n: number) => n.toLocaleString() + ' FCFA';
const d = (iso?: string) => (iso ? new Date(iso).toLocaleDateString('en-GB') : '');

export default function Index({ invoices, status }: { invoices: Invoice[]; status: string }) {
    const flash = usePage<PageProps>().props.flash;
    const { t } = useTrans();
    const tabs: [string, string][] = [['open', t('billing_status.open')], ['part_paid', t('billing.tab_part')], ['paid', t('billing.tab_paid')], ['all', t('common.all')]];

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">{t('nav.billing')}</h2>}>
            <Head title={t('nav.billing')} />
            <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
                {flash?.success && <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-200">{flash.success}</div>}
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex gap-1">
                        {tabs.map(([k, lbl]) => (
                            <button key={k} onClick={() => router.get(route('billing.index'), { status: k }, { preserveState: true })}
                                className={`rounded px-3 py-1.5 text-sm ${status === k ? 'bg-[#0A3D62] text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}>{lbl}</button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('billing.report')} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800">{t('billing.daily')}</Link>
                        <Link href={route('billing.create')} className="rounded-md bg-[#0E9F63] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B7F50]">{t('billing.new')}</Link>
                    </div>
                </div>
                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900/40">
                            <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                                <th className="px-4 py-3">{t('billing.col_invoice')}</th><th className="px-4 py-3">{t('common.patient')}</th><th className="px-4 py-3">{t('common.total')}</th><th className="px-4 py-3">{t('billing.col_balance')}</th><th className="px-4 py-3">{t('common.status')}</th><th className="px-4 py-3">{t('common.date')}</th><th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {invoices.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-500">{t('billing.none')}</td></tr>}
                            {invoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                                    <td className="px-4 py-3 font-mono text-gray-700 dark:text-gray-300">{inv.reference}</td>
                                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{inv.patient?.full_name}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{fcfa(inv.total)}</td>
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{fcfa(inv.balance)}</td>
                                    <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor[inv.status] ?? ''}`}>{t('billing_status.' + inv.status)}</span></td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{d(inv.created_at)}</td>
                                    <td className="px-4 py-3 text-right"><Link href={route('billing.show', inv.id)} className="font-medium text-[#0E9F63] hover:underline">{t('common.open')}</Link></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
