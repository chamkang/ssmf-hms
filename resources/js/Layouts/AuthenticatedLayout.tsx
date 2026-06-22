import ApplicationLogo from '@/Components/ApplicationLogo';
import Icon from '@/Components/Icon';
import { usePermissions } from '@/hooks/usePermissions';
import { useTrans } from '@/i18n';
import { Link, router, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';

type NavItem = {
    label: string;
    routeName: string;
    activePattern: string;
    icon: string;
    permission?: string | string[];
};

const NAV_ITEMS: NavItem[] = [
    { label: 'nav.dashboard', routeName: 'dashboard', activePattern: 'dashboard', icon: 'dashboard' },
    { label: 'nav.patients', routeName: 'patients.index', activePattern: 'patients.*', icon: 'patients', permission: 'patients.view' },
    { label: 'nav.appointments', routeName: 'appointments.index', activePattern: 'appointments.*', icon: 'appointments', permission: 'appointments.manage' },
    { label: 'nav.flow_board', routeName: 'flow-board', activePattern: 'flow-board', icon: 'flow', permission: 'reception.queue' },
    { label: 'nav.intake', routeName: 'intake.index', activePattern: 'intake.*', icon: 'intake', permission: 'reception.queue' },
    { label: 'nav.laboratory', routeName: 'lab.index', activePattern: 'lab.*', icon: 'lab', permission: 'lab.results' },
    { label: 'nav.pharmacy', routeName: 'pharmacy.queue', activePattern: 'pharmacy.*', icon: 'pharmacy', permission: 'pharmacy.dispense' },
    { label: 'nav.fertility', routeName: 'fertility.index', activePattern: 'fertility.*', icon: 'fertility', permission: 'fertility.manage' },
    { label: 'nav.maternity', routeName: 'maternity.index', activePattern: 'maternity.*', icon: 'maternity', permission: 'maternity.manage' },
    { label: 'nav.inpatient', routeName: 'inpatient.board', activePattern: 'inpatient.*', icon: 'inpatient', permission: 'inpatient.manage' },
    { label: 'nav.billing', routeName: 'billing.index', activePattern: 'billing.*', icon: 'billing', permission: 'billing.manage' },
    { label: 'nav.reports', routeName: 'reports.index', activePattern: 'reports.*', icon: 'reports', permission: 'reports.view' },
    { label: 'nav.audit', routeName: 'audit.index', activePattern: 'audit.*', icon: 'audit', permission: 'audit.view' },
    { label: 'nav.users', routeName: 'users.index', activePattern: 'users.*', icon: 'users', permission: 'users.manage' },
];

function LanguageToggle() {
    const { locale } = useTrans();
    const switchTo = (l: string) =>
        router.post(route('locale.update', l), {}, { preserveScroll: true });
    return (
        <div className="inline-flex overflow-hidden rounded-lg border border-gray-200 text-xs dark:border-gray-700">
            {['en', 'fr'].map((l) => (
                <button
                    key={l}
                    type="button"
                    onClick={() => switchTo(l)}
                    className={
                        'px-2.5 py-1 font-semibold uppercase transition ' +
                        (locale === l
                            ? 'bg-[#0A3D62] text-white'
                            : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700')
                    }
                >
                    {l}
                </button>
            ))}
        </div>
    );
}

function SidebarContent({
    navItems,
    user,
    role,
    onNavigate,
}: {
    navItems: NavItem[];
    user: { name: string; email: string };
    role?: string | null;
    onNavigate?: () => void;
}) {
    const { t } = useTrans();
    return (
        <div className="flex h-full flex-col bg-[#0A3D62] text-white">
            {/* Brand */}
            <div className="flex items-center gap-3 px-5 py-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <ApplicationLogo className="h-6 w-6 fill-current text-white" />
                </span>
                <div className="leading-tight">
                    <div className="text-sm font-semibold">Saint Sylvester</div>
                    <div className="text-[11px] uppercase tracking-widest text-blue-200/70">HMS</div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
                {navItems.map((item) => {
                    const active = route().current(item.activePattern);
                    return (
                        <Link
                            key={item.routeName}
                            href={route(item.routeName)}
                            onClick={onNavigate}
                            className={
                                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ' +
                                (active
                                    ? 'bg-[#0E9F63] text-white shadow-sm'
                                    : 'text-blue-100/80 hover:bg-white/10 hover:text-white')
                            }
                        >
                            <Icon name={item.icon} className="h-5 w-5 shrink-0" />
                            <span className="truncate">{t(item.label)}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User card */}
            <div className="border-t border-white/10 p-3">
                <Link
                    href={route('profile.edit')}
                    onClick={onNavigate}
                    className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-white/10"
                >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-sm font-semibold">
                        {user.name.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1 leading-tight">
                        <span className="block truncate text-sm font-medium">{user.name}</span>
                        <span className="block truncate text-[11px] text-blue-200/70">
                            {role ? t('role.' + role) : user.email}
                        </span>
                    </span>
                </Link>
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    onClick={onNavigate}
                    className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-blue-100/70 transition hover:bg-white/10 hover:text-white"
                >
                    <Icon name="logout" className="h-5 w-5" />
                    {t('account.logout')}
                </Link>
            </div>
        </div>
    );
}

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const page = usePage().props as any;
    const user = page.auth.user;
    const role = page.auth.role as string | null | undefined;
    const { can } = usePermissions();
    const [drawer, setDrawer] = useState(false);

    const navItems = NAV_ITEMS.filter((item) => !item.permission || can(item.permission));

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Desktop sidebar */}
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
                <SidebarContent navItems={navItems} user={user} role={role} />
            </aside>

            {/* Mobile drawer (opaque) */}
            {drawer && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div
                        className="absolute inset-0 bg-gray-900/50"
                        onClick={() => setDrawer(false)}
                    />
                    <div className="absolute inset-y-0 left-0 w-64 shadow-xl">
                        <SidebarContent
                            navItems={navItems}
                            user={user}
                            role={role}
                            onNavigate={() => setDrawer(false)}
                        />
                    </div>
                </div>
            )}

            {/* Main column */}
            <div className="lg:pl-64">
                {/* Top bar */}
                <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-800 sm:px-6">
                    <button
                        type="button"
                        onClick={() => setDrawer(true)}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
                        aria-label="Open menu"
                    >
                        <Icon name="menu" className="h-6 w-6" />
                    </button>

                    <div className="min-w-0 flex-1">
                        {header ?? (
                            <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                Saint Sylvester
                            </span>
                        )}
                    </div>

                    <LanguageToggle />
                </header>

                <main>{children}</main>
            </div>
        </div>
    );
}
