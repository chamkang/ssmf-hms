import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTrans } from '@/i18n';
import { Doctor, IntakeBooking, PageProps, Service } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { FormEvent, useEffect, useState } from 'react';

const field = 'rounded-md border-gray-300 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200';

function ConvertRow({ booking, doctors, services }: { booking: IntakeBooking; doctors: Doctor[]; services: Service[] }) {
    const { t } = useTrans();
    const preferredDate = booking.preferred_at ? booking.preferred_at.slice(0, 10) : new Date().toISOString().slice(0, 10);
    const { data, setData, post, processing, errors } = useForm<any>({
        doctor_id: booking.doctor?.id ?? '',
        service_id: booking.service?.id ?? '',
        date: preferredDate,
        time: '',
    });
    const [slots, setSlots] = useState<string[]>([]);

    useEffect(() => {
        if (!data.doctor_id || !data.date) { setSlots([]); return; }
        fetch(route('appointments.slots') + `?doctor_id=${data.doctor_id}&date=${data.date}`, { headers: { Accept: 'application/json' }, credentials: 'same-origin' })
            .then((r) => r.json()).then(setSlots).catch(() => setSlots([]));
    }, [data.doctor_id, data.date]);

    const convert = (e: FormEvent) => { e.preventDefault(); post(route('intake.convert', booking.id), { preserveScroll: true }); };

    return (
        <form onSubmit={convert} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                        {booking.full_name}
                        {booking.patient?.mrn && <span className="ml-2 font-mono text-xs text-gray-400">{booking.patient.mrn}</span>}
                    </div>
                    <div className="text-sm text-gray-500">
                        {booking.phone ?? '—'}
                        {booking.service && <> · {booking.service.name_en ?? booking.service.name_fr}</>}
                        {booking.preferred_at && <> · {t('intake.wants')} {booking.preferred_at.replace('T', ' ').slice(0, 16)}</>}
                    </div>
                    {booking.reason && <div className="mt-0.5 text-sm text-gray-600 dark:text-gray-300">“{booking.reason}”</div>}
                </div>
                <button type="button" onClick={() => router.post(route('intake.reject', booking.id), {}, { preserveScroll: true })} className="text-xs text-red-500 hover:underline">{t('intake.dismiss')}</button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <select className={field} value={data.doctor_id} onChange={(e) => setData('doctor_id', e.target.value)}>
                    <option value="">{t('intake.doctor_ph')}</option>
                    {doctors.map((d) => <option key={d.id} value={d.id}>{d.full_name}</option>)}
                </select>
                <select className={field} value={data.service_id} onChange={(e) => setData('service_id', e.target.value)}>
                    <option value="">{t('intake.service_ph')}</option>
                    {services.map((s) => <option key={s.id} value={s.id}>{s.name_en}</option>)}
                </select>
                <input type="date" className={field} value={data.date} onChange={(e) => setData('date', e.target.value)} />
                <select className={field} value={data.time} onChange={(e) => setData('time', e.target.value)}>
                    <option value="">{slots.length ? t('intake.time_ph') : t('intake.no_slots')}</option>
                    {slots.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>
            {errors.time && <p className="mt-1 text-xs text-red-500">{errors.time}</p>}
            <div className="mt-3 flex justify-end">
                <button disabled={processing || !data.doctor_id || !data.service_id || !data.time} className="rounded-md bg-[#0E9F63] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B7F50] disabled:opacity-50">
                    {t('intake.confirm')}
                </button>
            </div>
        </form>
    );
}

export default function Index({ bookings, doctors, services }: { bookings: IntakeBooking[]; doctors: Doctor[]; services: Service[] }) {
    const flash = usePage<PageProps>().props.flash;
    const { t } = useTrans();
    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">{t('intake.title')}</h2>}>
            <Head title={t('intake.title')} />
            <div className="mx-auto max-w-4xl space-y-4 p-4 sm:p-6 lg:p-8">
                {flash?.success && <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-200">{flash.success}</div>}
                <p className="text-sm text-gray-500">{t('intake.subtitle')}</p>
                {bookings.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-gray-300 py-10 text-center text-gray-400 dark:border-gray-600">{t('intake.none')}</p>
                ) : (
                    bookings.map((b) => <ConvertRow key={b.id} booking={b} doctors={doctors} services={services} />)
                )}
            </div>
        </AuthenticatedLayout>
    );
}
