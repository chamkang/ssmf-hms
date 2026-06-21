import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { usePermissions } from '@/hooks/usePermissions';
import { useTrans } from '@/i18n';
import { Link, router, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';

type NavItem = {
    label: string;
    routeName: string;
    activePattern: string;
    permission?: string | string[];
};

const NAV_ITEMS: NavItem[] = [
    { label: 'nav.dashboard', routeName: 'dashboard', activePattern: 'dashboard' },
    { label: 'nav.patients', routeName: 'patients.index', activePattern: 'patients.*', permission: 'patients.view' },
    { label: 'nav.appointments', routeName: 'appointments.index', activePattern: 'appointments.*', permission: 'appointments.manage' },
    { label: 'nav.flow_board', routeName: 'flow-board', activePattern: 'flow-board', permission: 'reception.queue' },
    { label: 'nav.laboratory', routeName: 'lab.index', activePattern: 'lab.*', permission: 'lab.results' },
    { label: 'nav.pharmacy', routeName: 'pharmacy.queue', activePattern: 'pharmacy.*', permission: 'pharmacy.dispense' },
    { label: 'nav.fertility', routeName: 'fertility.index', activePattern: 'fertility.*', permission: 'fertility.manage' },
    { label: 'nav.maternity', routeName: 'maternity.index', activePattern: 'maternity.*', permission: 'maternity.manage' },
    { label: 'nav.inpatient', routeName: 'inpatient.board', activePattern: 'inpatient.*', permission: 'inpatient.manage' },
    { label: 'nav.billing', routeName: 'billing.index', activePattern: 'billing.*', permission: 'billing.manage' },
    { label: 'nav.reports', routeName: 'reports.index', activePattern: 'reports.*', permission: 'reports.view' },
    { label: 'nav.audit', routeName: 'audit.index', activePattern: 'audit.*', permission: 'audit.view' },
];

function LanguageToggle() {
    const { locale } = useTrans();
    const switchTo = (l: string) =>
        router.post(route('locale.update', l), {}, { preserveScroll: true });

    return (
        <div className="inline-flex overflow-hidden rounded-md border border-gray-200 text-xs dark:border-gray-700">
            {['en', 'fr'].map((l) => (
                <button
                    key={l}
                    type="button"
                    onClick={() => switchTo(l)}
                    className={
                        'px-2 py-1 font-medium uppercase ' +
                        (locale === l
                            ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900'
                            : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700')
                    }
                >
                    {l}
                </button>
            ))}
        </div>
    );
}

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user;
    const { can } = usePermissions();
    const { t } = useTrans();

    const navItems = NAV_ITEMS.filter(
        (item) => !item.permission || can(item.permission),
    );

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <nav className="border-b border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800 dark:text-gray-200" />
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                {navItems.map((item) => (
                                    <NavLink
                                        key={item.routeName}
                                        href={route(item.routeName)}
                                        active={route().current(
                                            item.activePattern,
                                        )}
                                    >
                                        {t(item.label)}
                                    </NavLink>
                                ))}
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center sm:gap-3">
                            <LanguageToggle />
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none dark:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                                            >
                                                {user.name}

                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link
                                            href={route('profile.edit')}
                                        >
                                            {t('account.profile')}
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                        >
                                            {t('account.logout')}
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none dark:text-gray-500 dark:hover:bg-gray-900 dark:hover:text-gray-400 dark:focus:bg-gray-900 dark:focus:text-gray-400"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        {navItems.map((item) => (
                            <ResponsiveNavLink
                                key={item.routeName}
                                href={route(item.routeName)}
                                active={route().current(item.activePattern)}
                            >
                                {t(item.label)}
                            </ResponsiveNavLink>
                        ))}
                    </div>

                    <div className="border-t border-gray-200 pb-1 pt-4 dark:border-gray-600">
                        <div className="px-4">
                            <div className="text-base font-medium text-gray-800 dark:text-gray-200">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-gray-500">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                {t('account.profile')}
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                {t('account.logout')}
                            </ResponsiveNavLink>
                            <div className="px-4 pt-3">
                                <div className="mb-1 text-xs font-medium uppercase text-gray-400">
                                    {t('account.language')}
                                </div>
                                <LanguageToggle />
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow dark:bg-gray-800">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
