import InputError from '@/Components/InputError';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTrans } from '@/i18n';
import { PageProps } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEvent } from 'react';

const field = 'mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-[#0E9F63] focus:ring-[#0E9F63] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200';
const label = 'block text-sm font-medium text-gray-700 dark:text-gray-300';

interface U { id: number; name: string; email: string; is_active: boolean; role: string | null; }

export default function Edit({ user, roles }: { user: U; roles: string[] }) {
    const { t } = useTrans();
    const flash = usePage<PageProps>().props.flash;
    const form = useForm<any>({ name: user.name, role: user.role ?? '' });
    const pw = useForm<any>({ password: '' });

    const save = (e: FormEvent) => { e.preventDefault(); form.patch(route('users.update', user.id)); };
    const reset = (e: FormEvent) => { e.preventDefault(); pw.post(route('users.reset-password', user.id), { preserveScroll: true, onSuccess: () => pw.reset('password') }); };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">{t('users.edit_title')} — {user.name}</h2>}>
            <Head title={`${t('users.edit_title')} ${user.name}`} />
            <div className="mx-auto max-w-xl space-y-5 p-4 sm:p-6 lg:p-8">
                {flash?.success && <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-200">{flash.success}</div>}

                <form onSubmit={save} className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div>
                        <label className={label}>{t('users.name')}</label>
                        <input className={field} value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
                        <InputError message={form.errors.name} className="mt-1" />
                    </div>
                    <div>
                        <label className={label}>{t('users.email')}</label>
                        <input className={`${field} opacity-60`} value={user.email} disabled />
                    </div>
                    <div>
                        <label className={label}>{t('users.role')}</label>
                        <select className={field} value={form.data.role} onChange={(e) => form.setData('role', e.target.value)}>
                            {roles.map((r) => <option key={r} value={r}>{t('role.' + r)}</option>)}
                        </select>
                        <InputError message={form.errors.role} className="mt-1" />
                    </div>
                    <div className="flex items-center justify-end gap-3">
                        <Link href={route('users.index')} className="text-sm text-gray-500 hover:underline">{t('action.cancel')}</Link>
                        <button disabled={form.processing} className="rounded-md bg-[#0E9F63] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0B7F50] disabled:opacity-50">{t('action.save')}</button>
                    </div>
                </form>

                <form onSubmit={reset} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">{t('users.reset_pw')}</h3>
                    <div className="flex items-end gap-3">
                        <div className="flex-1">
                            <label className={label}>{t('users.new_password')}</label>
                            <input type="text" className={field} value={pw.data.password} onChange={(e) => pw.setData('password', e.target.value)} autoComplete="off" />
                            <InputError message={pw.errors.password} className="mt-1" />
                        </div>
                        <button disabled={pw.processing || !pw.data.password} className="rounded-md bg-[#0A3D62] px-4 py-2 text-sm font-medium text-white hover:bg-[#0E4A78] disabled:opacity-50">{t('users.set_password')}</button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
