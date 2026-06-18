import PatientHeader from '@/Components/PatientHeader';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, Patient } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ReactNode } from 'react';

function Card({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                {title}
            </h3>
            {children}
        </div>
    );
}

function Row({ k, v }: { k: string; v: ReactNode }) {
    return (
        <div className="flex justify-between gap-4 py-1 text-sm">
            <span className="text-gray-500">{k}</span>
            <span className="text-right text-gray-900 dark:text-gray-200">{v || '—'}</span>
        </div>
    );
}

export default function Show({ patient }: { patient: Patient }) {
    const flash = usePage<PageProps>().props.flash;
    const nok = patient.next_of_kin?.[0];

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Dossier patient
                </h2>
            }
        >
            <Head title={patient.full_name} />
            <div className="mx-auto max-w-5xl space-y-5 p-4 sm:p-6 lg:p-8">
                {flash?.success && (
                    <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-200">
                        {flash.success}
                    </div>
                )}

                <PatientHeader patient={patient} />

                <div className="flex justify-end">
                    <Link href={route('patients.edit', patient.id)} className="rounded-md bg-[#0A3D62] px-4 py-2 text-sm font-medium text-white hover:bg-[#0E4A78]">
                        Modifier
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    <Card title="Coordonnées">
                        <Row k="Téléphone" v={patient.phone} />
                        <Row k="E-mail" v={patient.email} />
                        <Row k="Adresse" v={patient.address} />
                    </Card>
                    <Card title="État civil">
                        <Row k="Sexe" v={patient.sex === 'F' ? 'Féminin' : patient.sex === 'M' ? 'Masculin' : null} />
                        <Row k="Naissance" v={patient.dob ? patient.dob.slice(0, 10) : null} />
                        <Row k="Âge" v={patient.age != null ? `${patient.age} ans` : null} />
                        <Row k="Groupe sanguin" v={patient.blood_group} />
                    </Card>
                    <Card title="Allergies">
                        {(patient.allergies?.length ?? 0) === 0 ? (
                            <p className="text-sm text-gray-400">Aucune allergie connue.</p>
                        ) : (
                            <ul className="space-y-1 text-sm">
                                {patient.allergies!.map((a) => (
                                    <li key={a.id} className="text-gray-800 dark:text-gray-200">
                                        • {a.substance}
                                        {a.severity ? ` (${a.severity})` : ''}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>
                    <Card title="Antécédents">
                        {(patient.conditions?.length ?? 0) === 0 ? (
                            <p className="text-sm text-gray-400">Aucun antécédent renseigné.</p>
                        ) : (
                            <ul className="space-y-1 text-sm">
                                {patient.conditions!.map((c) => (
                                    <li key={c.id} className="text-gray-800 dark:text-gray-200">• {c.label}</li>
                                ))}
                            </ul>
                        )}
                    </Card>
                    <Card title="Proche à prévenir">
                        {nok ? (
                            <>
                                <Row k="Nom" v={nok.name} />
                                <Row k="Lien" v={nok.relationship} />
                                <Row k="Téléphone" v={nok.phone} />
                            </>
                        ) : (
                            <p className="text-sm text-gray-400">Non renseigné.</p>
                        )}
                    </Card>
                    <Card title="Chronologie">
                        <p className="text-sm text-gray-400">
                            Les consultations, ordonnances et résultats apparaîtront ici
                            (modules à venir).
                        </p>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
