import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTrans } from '@/i18n';
import { LabOrder, PageProps } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { FormEvent } from 'react';

const flagColor: Record<string, string> = {
    low: 'bg-blue-100 text-blue-700',
    high: 'bg-red-100 text-red-700',
    normal: 'bg-green-100 text-green-700',
};

export default function Show({ order }: { order: LabOrder }) {
    const flash = usePage<PageProps>().props.flash;
    const { t } = useTrans();
    const items = order.items ?? [];
    const { data, setData, patch, processing } = useForm<any>({
        results: items.map((i) => ({ id: i.id, value: i.value ?? '' })),
        validate: false,
    });

    const setVal = (id: number, value: string) =>
        setData('results', data.results.map((r: any) => (r.id === id ? { ...r, value } : r)));

    const save = (e: FormEvent) => { e.preventDefault(); patch(route('lab.results', order.id)); };
    const validate = () => router.patch(route('lab.results', order.id), { results: data.results, validate: true });

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">{t('nav.laboratory')} · {order.reference}</h2>}>
            <Head title={order.reference ?? t('nav.laboratory')} />
            <div className="mx-auto max-w-3xl space-y-5 p-4 sm:p-6 lg:p-8">
                {flash?.success && <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-200">{flash.success}</div>}

                <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{order.patient?.full_name}</span>
                    <span className="ml-2 font-mono text-gray-400">{order.patient?.mrn}</span>
                    <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">{t('lab_status.' + order.status)}</span>
                </div>

                <form onSubmit={save} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                                <th className="py-2">{t('lab.col_test')}</th><th className="py-2">{t('common.reference')}</th><th className="py-2">{t('lab.col_result')}</th><th className="py-2">{t('lab.col_flag')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {items.map((it) => {
                                const r = data.results.find((x: any) => x.id === it.id);
                                const range = it.ref_low != null || it.ref_high != null ? `${it.ref_low ?? ''}–${it.ref_high ?? ''} ${it.unit ?? ''}` : '—';
                                return (
                                    <tr key={it.id}>
                                        <td className="py-2 pr-3 text-gray-800 dark:text-gray-200">{it.name}</td>
                                        <td className="py-2 pr-3 text-gray-400">{range}</td>
                                        <td className="py-2 pr-3">
                                            <input className="w-32 rounded-md border-gray-300 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                                                value={r?.value ?? ''} onChange={(e) => setVal(it.id, e.target.value)} placeholder={it.unit ?? ''} />
                                        </td>
                                        <td className="py-2">{it.flag && <span className={`rounded-full px-2 py-0.5 text-xs ${flagColor[it.flag] ?? ''}`}>{it.flag}</span>}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    <div className="mt-5 flex items-center justify-end gap-3">
                        <Link href={route('lab.index')} className="text-sm text-gray-500 hover:underline">{t('common.back')}</Link>
                        <button type="submit" disabled={processing} className="rounded-md border border-[#0A3D62] px-4 py-2 text-sm font-medium text-[#0A3D62] hover:bg-[#0A3D62] hover:text-white disabled:opacity-50">{t('lab.save_results')}</button>
                        <button type="button" onClick={validate} disabled={processing} className="rounded-md bg-[#0E9F63] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B7F50] disabled:opacity-50">{t('lab.save_validate')}</button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
