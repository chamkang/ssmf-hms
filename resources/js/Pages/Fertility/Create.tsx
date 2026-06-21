import InputError from '@/Components/InputError';
import PatientPicker from '@/Components/PatientPicker';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTrans } from '@/i18n';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

const field =
    'mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-[#0E9F63] focus:ring-[#0E9F63] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200';
const label = 'block text-sm font-medium text-gray-700 dark:text-gray-300';

const DIAGNOSES = [
    'Tubal factor',
    'Male factor',
    'PCOS / anovulation',
    'Endometriosis',
    'Diminished ovarian reserve',
    'Unexplained',
];

export default function Create() {
    const { t } = useTrans();
    const { data, setData, post, processing, errors } = useForm<any>({
        female_patient_id: '',
        male_patient_id: '',
        referral_reason: '',
        diagnosis: '',
        notes: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('fertility.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    {t('fert.create_title')}
                </h2>
            }
        >
            <Head title={t('fert.create_title')} />
            <div className="mx-auto max-w-2xl p-4 sm:p-6 lg:p-8">
                <form
                    onSubmit={submit}
                    className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                >
                    <div>
                        <label className={label}>{t('fert.female_req')}</label>
                        <PatientPicker
                            value={data.female_patient_id}
                            onChange={(id) => setData('female_patient_id', id)}
                            sex="F"
                        />
                        <InputError message={errors.female_patient_id} className="mt-1" />
                    </div>

                    <div>
                        <label className={label}>{t('fert.male')}</label>
                        <PatientPicker
                            value={data.male_patient_id}
                            onChange={(id) => setData('male_patient_id', id)}
                            sex="M"
                        />
                        <InputError message={errors.male_patient_id} className="mt-1" />
                    </div>

                    <div>
                        <label className={label}>{t('fert.diagnosis')}</label>
                        <select
                            className={field}
                            value={data.diagnosis}
                            onChange={(e) => setData('diagnosis', e.target.value)}
                        >
                            <option value="">—</option>
                            {DIAGNOSES.map((d) => (
                                <option key={d} value={d}>
                                    {d}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className={label}>{t('fert.referral')}</label>
                        <input
                            className={field}
                            value={data.referral_reason}
                            onChange={(e) => setData('referral_reason', e.target.value)}
                            placeholder="e.g. 3 years primary infertility"
                        />
                    </div>

                    <div>
                        <label className={label}>{t('common.notes')}</label>
                        <textarea
                            className={field}
                            rows={3}
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        <Link href={route('fertility.index')} className="text-sm text-gray-500 hover:underline">
                            {t('action.cancel')}
                        </Link>
                        <button
                            disabled={processing || !data.female_patient_id}
                            className="rounded-md bg-[#0E9F63] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0B7F50] disabled:opacity-50"
                        >
                            {t('fert.create_btn')}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
