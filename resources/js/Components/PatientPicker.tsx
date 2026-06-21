import { useEffect, useState } from 'react';

interface PatientHit {
    id: number;
    mrn: string | null;
    label: string;
    phone: string | null;
}

const field =
    'mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-[#0E9F63] focus:ring-[#0E9F63] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200';

/**
 * Type-ahead search that resolves to a patient id. Reuses the shared
 * /lookup/patients endpoint (gated by patients.view).
 */
export default function PatientPicker({
    value,
    onChange,
    placeholder = 'Name, record or phone…',
    sex,
}: {
    value: number | string | '';
    onChange: (id: number | '') => void;
    placeholder?: string;
    sex?: 'F' | 'M';
}) {
    const [q, setQ] = useState('');
    const [hits, setHits] = useState<PatientHit[]>([]);
    const [picked, setPicked] = useState(false);

    useEffect(() => {
        if (picked || q.trim().length < 2) {
            setHits([]);
            return;
        }
        const ctrl = new AbortController();
        const t = setTimeout(() => {
            fetch(route('patients.search') + '?q=' + encodeURIComponent(q), {
                headers: { Accept: 'application/json' },
                credentials: 'same-origin',
                signal: ctrl.signal,
            })
                .then((r) => r.json())
                .then(setHits)
                .catch(() => {});
        }, 250);
        return () => {
            clearTimeout(t);
            ctrl.abort();
        };
    }, [q, picked]);

    return (
        <div className="relative">
            <input
                className={field}
                value={q}
                placeholder={placeholder}
                onChange={(e) => {
                    setQ(e.target.value);
                    setPicked(false);
                    onChange('');
                }}
            />
            {value !== '' && picked && (
                <button
                    type="button"
                    onClick={() => {
                        onChange('');
                        setPicked(false);
                        setQ('');
                    }}
                    className="absolute right-2 top-2.5 text-xs text-gray-400 hover:text-red-500"
                >
                    clear
                </button>
            )}
            {hits.length > 0 && (
                <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                    {hits.map((h) => (
                        <li key={h.id}>
                            <button
                                type="button"
                                onClick={() => {
                                    onChange(h.id);
                                    setPicked(true);
                                    setHits([]);
                                    setQ(h.label + (h.mrn ? ` · ${h.mrn}` : ''));
                                }}
                                className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                            >
                                {h.label} {h.phone ? `· ${h.phone}` : ''}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            {sex && (
                <p className="mt-1 text-xs text-gray-400">
                    Tip: register the {sex === 'F' ? 'female' : 'male'} partner as a patient first if not found.
                </p>
            )}
        </div>
    );
}
