import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTrans } from '@/i18n';
import { Ward } from '@/types';
import { Head, Link, router } from '@inertiajs/react';

export default function Board({ wards }: { wards: Ward[] }) {
    const { t } = useTrans();
    const totalBeds = wards.reduce((s, w) => s + (w.beds?.length ?? 0), 0);
    const occupied = wards.reduce((s, w) => s + (w.beds?.filter((b) => b.current_admission).length ?? 0), 0);

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">{t('ipd.board_title')}</h2>}>
            <Head title={t('ipd.board_title')} />
            <div className="mx-auto max-w-6xl space-y-5 p-4 sm:p-6 lg:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                        {occupied}/{totalBeds} {t('ipd.beds_occupied')} · {totalBeds - occupied} {t('ipd.free')}
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('inpatient.index')} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800">{t('ipd.admissions_list')}</Link>
                        <Link href={route('inpatient.create')} className="rounded-md bg-[#0E9F63] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B7F50]">{t('ipd.admit')}</Link>
                    </div>
                </div>

                {wards.map((w) => (
                    <div key={w.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {w.name} <span className="font-normal text-gray-400">· {w.kind}</span>
                        </h3>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                            {(w.beds ?? []).map((b) => {
                                const adm = b.current_admission;
                                return (
                                    <div
                                        key={b.id}
                                        onClick={() => adm && router.visit(route('inpatient.show', adm.id))}
                                        className={
                                            'rounded-lg border p-3 ' +
                                            (adm
                                                ? 'cursor-pointer border-[#0A3D62]/30 bg-blue-50 hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-900/20'
                                                : 'border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-900/30')
                                        }
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono text-sm font-semibold text-gray-700 dark:text-gray-200">{b.label}</span>
                                            <span className={'h-2.5 w-2.5 rounded-full ' + (adm ? 'bg-[#0A3D62]' : 'bg-green-500')} />
                                        </div>
                                        {adm ? (
                                            <div className="mt-1 truncate text-sm text-gray-800 dark:text-gray-100">
                                                {adm.patient?.full_name}
                                                <div className="font-mono text-xs text-gray-400">{adm.patient?.mrn}</div>
                                            </div>
                                        ) : (
                                            <div className="mt-1 text-sm text-gray-400">{t('ipd.bed_free')}</div>
                                        )}
                                    </div>
                                );
                            })}
                            {(w.beds ?? []).length === 0 && <p className="text-sm text-gray-400">No beds configured.</p>}
                        </div>
                    </div>
                ))}
                {wards.length === 0 && (
                    <p className="rounded-xl border border-dashed border-gray-300 py-10 text-center text-gray-400 dark:border-gray-600">
                        {t('ipd.no_wards')}
                    </p>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
