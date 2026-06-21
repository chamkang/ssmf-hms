import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTrans } from '@/i18n';
import { Appointment, Encounter, PageProps } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';

const hm = (iso?: string | null) =>
    iso ? new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '';

export default function Index({
    encounters,
    stages,
    arrivals,
}: {
    encounters: Encounter[];
    stages: string[];
    arrivals: Appointment[];
}) {
    const flash = usePage<PageProps>().props.flash;
    const { t } = useTrans();
    const columns = stages.filter((s) => s !== 'done');

    const advance = (enc: Encounter, stage: string) =>
        router.patch(route('encounters.advance', enc.id), { stage });

    const nextStage = (current: string) => {
        const i = stages.indexOf(current);
        return stages[Math.min(i + 1, stages.length - 1)];
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">{t('flow.title')}</h2>}
        >
            <Head title={t('nav.flow_board')} />
            <div className="mx-auto max-w-[90rem] p-4 sm:p-6 lg:p-8">
                {flash?.success && (
                    <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-200">
                        {flash.success}
                    </div>
                )}

                {arrivals.length > 0 && (
                    <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">{t('flow.expected')}</h3>
                        <div className="flex flex-wrap gap-2">
                            {arrivals.map((a) => (
                                <button
                                    key={a.id}
                                    onClick={() => router.post(route('flow-board.check-in'), { appointment_id: a.id })}
                                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:border-[#0E9F63] dark:border-gray-600 dark:text-gray-200"
                                >
                                    {hm(a.starts_at)} · {a.patient?.full_name} <span className="text-[#0E9F63]">{t('flow.checkin')}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    {columns.map((stage) => {
                        const list = encounters.filter((e) => e.stage === stage);
                        return (
                            <div key={stage} className="rounded-xl bg-gray-100 p-3 dark:bg-gray-900/50">
                                <div className="mb-2 flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('flow_stage.' + stage)}</h3>
                                    <span className="rounded-full bg-white px-2 text-xs text-gray-500 dark:bg-gray-800">{list.length}</span>
                                </div>
                                <div className="space-y-2">
                                    {list.map((enc) => (
                                        <div key={enc.id} className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{enc.patient?.full_name}</div>
                                            <div className="font-mono text-xs text-gray-400">{enc.patient?.mrn}</div>
                                            {(enc.patient?.allergies?.length ?? 0) > 0 && (
                                                <div className="mt-1 text-xs font-medium text-red-600">{t('flow.allergy')}</div>
                                            )}
                                            <div className="mt-1 text-xs text-gray-400">{t('flow.arrived')} {hm(enc.arrived_at)}</div>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                <button onClick={() => advance(enc, nextStage(enc.stage))} className="rounded bg-[#0A3D62] px-2 py-1 text-xs font-medium text-white hover:bg-[#0E4A78]">
                                                    {stage === 'cashier' ? t('flow.finish') : t('flow.next')}
                                                </button>
                                                <Link href={route('consultations.cockpit', enc.id)} className="rounded border border-[#0E9F63] px-2 py-1 text-xs font-medium text-[#0E9F63] hover:bg-[#0E9F63] hover:text-white">
                                                    {t('flow.consult')}
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                    {list.length === 0 && <p className="px-1 py-2 text-xs text-gray-400">—</p>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
