import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTrans } from '@/i18n';
import { PageProps } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { FormEvent } from 'react';
import PatientForm from './PatientForm';

export default function Create() {
    const { t } = useTrans();
    const { data, setData, post, processing, errors } = useForm<any>({
        first_name: '',
        last_name: '',
        sex: '',
        dob: '',
        marital_status: '',
        phone: '',
        email: '',
        address: '',
        language: 'fr',
        blood_group: '',
        notes: '',
        allergies: [],
        next_of_kin: { name: '', relationship: '', phone: '' },
        force: false,
    });

    const duplicates = usePage<PageProps>().props.flash?.duplicates ?? [];

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('patients.store'));
    };
    const createAnyway = () =>
        router.post(route('patients.store'), { ...data, force: true });

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    {t('patients.create_title')}
                </h2>
            }
        >
            <Head title={t('patients.create_title')} />
            <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
                {duplicates.length > 0 && (
                    <div className="mb-5 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-700 dark:bg-amber-900/30">
                        <p className="font-semibold text-amber-800 dark:text-amber-200">
                            {t('patients.duplicate_warn')}
                        </p>
                        <ul className="mt-2 space-y-1">
                            {duplicates.map((d) => (
                                <li key={d.id}>
                                    <Link href={route('patients.show', d.id)} className="text-[#0A3D62] underline dark:text-blue-300">
                                        {d.mrn} — {d.first_name} {d.last_name} ({d.phone})
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <button onClick={createAnyway} className="mt-3 rounded-md bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700">
                            {t('patients.create_anyway')}
                        </button>
                    </div>
                )}

                <form onSubmit={submit} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <PatientForm data={data} setData={setData} errors={errors} />
                    <div className="mt-6 flex items-center justify-end gap-3">
                        <Link href={route('patients.index')} className="text-sm text-gray-500 hover:underline">
                            {t('action.cancel')}
                        </Link>
                        <button disabled={processing} className="rounded-md bg-[#0E9F63] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0B7F50] disabled:opacity-50">
                            {t('action.save')}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
