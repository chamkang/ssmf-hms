import InputError from '@/Components/InputError';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTrans } from '@/i18n';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

const field = 'mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-[#0E9F63] focus:ring-[#0E9F63] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200';
const label = 'block text-sm font-medium text-gray-700 dark:text-gray-300';

export default function Create({ roles }: { roles: string[] }) {
    const { t } = useTrans();
    const { data, setData, post, processing, errors } = useForm<any>({ name: '', email: '', role: '', password: '' });
    const submit = (e: FormEvent) => { e.preventDefault(); post(route('users.store')); };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">{t('users.create_title')}</h2>}>
            <Head title={t('users.create_title')} />
            <div className="mx-auto max-w-xl p-4 sm:p-6 lg:p-8">
                <form onSubmit={submit} className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div>
                        <label className={label}>{t('users.name')}</label>
                        <input className={field} value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        <InputError message={errors.name} className="mt-1" />
                    </div>
                    <div>
                        <label className={label}>{t('users.email')}</label>
                        <input type="email" className={field} value={data.email} onChange={(e) => setData('email', e.target.value)} />
                        <InputError message={errors.email} className="mt-1" />
                    </div>
                    <div>
                        <label className={label}>{t('users.role')}</label>
                        <select className={field} value={data.role} onChange={(e) => setData('role', e.target.value)}>
                            <option value="">—</option>
                            {roles.map((r) => <option key={r} value={r}>{t('role.' + r)}</option>)}
                        </select>
                        <InputError message={errors.role} className="mt-1" />
                    </div>
                    <div>
                        <label className={label}>{t('users.temp_password')}</label>
                        <input type="text" className={field} value={data.password} onChange={(e) => setData('password', e.target.value)} autoComplete="off" />
                        <p className="mt-1 text-xs text-gray-400">{t('users.temp_hint')}</p>
                        <InputError message={errors.password} className="mt-1" />
                    </div>
                    <div className="flex items-center justify-end gap-3">
                        <Link href={route('users.index')} className="text-sm text-gray-500 hover:underline">{t('action.cancel')}</Link>
                        <button disabled={processing || !data.role} className="rounded-md bg-[#0E9F63] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0B7F50] disabled:opacity-50">{t('users.create_btn')}</button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
