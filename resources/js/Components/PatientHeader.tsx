import { Patient } from '@/types';

const sevColor: Record<string, string> = {
    severe: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
    moderate: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
    mild: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200',
};

export default function PatientHeader({ patient }: { patient: Patient }) {
    const allergies = patient.allergies ?? [];
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0A3D62] text-lg font-semibold text-white">
                        {(patient.first_name?.[0] ?? '') +
                            (patient.last_name?.[0] ?? '')}
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            {patient.full_name}
                        </h2>
                        <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-mono">{patient.mrn ?? '—'}</span>
                            {patient.sex && (
                                <span>
                                    {patient.sex === 'F' ? 'Féminin' : 'Masculin'}
                                </span>
                            )}
                            {patient.age != null && <span>{patient.age} ans</span>}
                            {patient.blood_group && (
                                <span>Groupe {patient.blood_group}</span>
                            )}
                            {patient.phone && <span>{patient.phone}</span>}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    {allergies.length > 0 ? (
                        <div className="flex max-w-md flex-wrap justify-end gap-1.5">
                            <span className="w-full text-right text-xs font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
                                ⚠ Allergies
                            </span>
                            {allergies.map((a, i) => (
                                <span
                                    key={i}
                                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${sevColor[a.severity ?? 'mild'] ?? sevColor.mild}`}
                                >
                                    {a.substance}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/40 dark:text-green-200">
                            Aucune allergie connue
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
