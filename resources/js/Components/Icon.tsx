import { SVGProps } from 'react';

/** Minimal inline icon set (Heroicons-style outlines) — no icon dependency. */
const PATHS: Record<string, string> = {
    dashboard: 'M3 12l9-9 9 9M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10',
    patients: 'M15 19a4 4 0 00-8 0M9 11a3 3 0 100-6 3 3 0 000 6zm10 8a3 3 0 00-5-2.2M17 11a3 3 0 10-2-5.2',
    appointments: 'M8 2v3M16 2v3M3.5 8h17M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z',
    flow: 'M4 5h4v14H4zM10 5h4v9h-4zM16 5h4v6h-4z',
    lab: 'M9 3h6M10 3v6l-5 9a2 2 0 001.8 3h10.4A2 2 0 0019 18l-5-9V3',
    pharmacy: 'M10.5 3.5a4.95 4.95 0 017 7l-7 7a4.95 4.95 0 01-7-7zM7 7l10 10',
    fertility: 'M12 21s-7-4.6-9.3-9A5 5 0 0112 5a5 5 0 019.3 7c-2.3 4.4-9.3 9-9.3 9z',
    maternity: 'M12 7a2 2 0 100-4 2 2 0 000 4zM9 21v-6l-2-3a3 3 0 015-3l1.5 2H17M12 12v9',
    inpatient: 'M3 18V8a1 1 0 011-1h11a4 4 0 014 4v7M3 14h18M7 11h3M3 18h18',
    intake: 'M3 7l9 6 9-6M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z',
    billing: 'M6 2h9l3 3v17l-2.5-1.5L13 22l-2.5-1.5L8 22l-2-1.5V2zM9 8h6M9 12h6M9 16h3',
    reports: 'M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-8',
    audit: 'M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6zM9 12l2 2 4-4',
    users: 'M17 20a5 5 0 00-10 0M12 11a3 3 0 100-6 3 3 0 000 6zM21 20a4 4 0 00-3-3.9M19 11a3 3 0 00-2-5.2',
    logout: 'M15 12H3m12 0l-4-4m4 4l-4 4M9 4h8a1 1 0 011 1v14a1 1 0 01-1 1H9',
    profile: 'M12 12a4 4 0 100-8 4 4 0 000 8zM5 21a7 7 0 0114 0',
    menu: 'M4 6h16M4 12h16M4 18h16',
    close: 'M6 6l12 12M18 6L6 18',
    clock: 'M12 7v5l3 2M12 21a9 9 0 110-18 9 9 0 010 18z',
};

export default function Icon({ name, className = 'h-5 w-5', ...props }: { name: string } & SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
            {...props}
        >
            <path d={PATHS[name] ?? PATHS.dashboard} />
        </svg>
    );
}
