import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTrans } from '@/i18n';
import { PageProps } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';

interface Row {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    two_factor: boolean;
    role: string | null;
}

export default function Index({ users }: { users: Row[] }) {
    const flash = usePage<PageProps>().props.flash;
    const { t } = useTrans();
    const roleLabel = (r: string | null) => (r ? t('role.' + r) : '—');

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">{t('users.title')}</h2>}>
            <Head title={t('users.title')} />
            <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
                {flash?.success && <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-200">{flash.success}</div>}

                <div className="mb-4 flex justify-end">
                    <Link href={route('users.create')} className="rounded-md bg-[#0E9F63] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B7F50]">{t('users.new')}</Link>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900/40">
                            <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                                <th className="px-4 py-3">{t('users.col_name')}</th>
                                <th className="px-4 py-3">{t('users.col_email')}</th>
                                <th className="px-4 py-3">{t('users.col_role')}</th>
                                <th className="px-4 py-3">{t('users.col_2fa')}</th>
                                <th className="px-4 py-3">{t('common.status')}</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {users.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-500">{t('users.none')}</td></tr>}
                            {users.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{u.name}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{u.email}</td>
                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{roleLabel(u.role)}</td>
                                    <td className="px-4 py-3 text-gray-500">{u.two_factor ? t('users.yes') : t('users.no')}</td>
                                    <td className="px-4 py-3">
                                        <span className={'rounded-full px-2.5 py-0.5 text-xs font-medium ' + (u.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300')}>
                                            {u.is_active ? t('users.active') : t('users.inactive')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <span className="flex justify-end gap-3">
                                            <Link href={route('users.edit', u.id)} className="text-xs font-medium text-[#0E9F63] hover:underline">{t('action.edit')}</Link>
                                            <button onClick={() => router.patch(route('users.toggle', u.id), {}, { preserveScroll: true })} className="text-xs font-medium text-gray-500 hover:underline">
                                                {u.is_active ? t('users.deactivate') : t('users.activate')}
                                            </button>
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
