import PatientHeader from '@/Components/PatientHeader';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Consultation, PageProps, Patient } from '@/types';
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

const dt = (iso?: string) => (iso ? new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '');

export default function Show({
    patient,
    consultations = [],
}: {
    patient: Patient;
    consultations?: Consultation[];
}) {
    const flash = usePage<PageProps>().props.flash;
    const nok = patient.next_of_kin?.[0];

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Patient record
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

                <div className="flex justify-end gap-2">
                    <Link href={route('patients.edit', patient.id)} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800">
                        Edit
                    </Link>
                    <Link href={route('consultations.start', patient.id)} className="rounded-md bg-[#0E9F63] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B7F50]">
                        + New consultation
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    <Card title="Contact">
                        <Row k="Phone" v={patient.phone} />
                        <Row k="Email" v={patient.email} />
                        <Row k="Address" v={patient.address} />
                    </Card>
                    <Card title="Demographics">
                        <Row k="Sex" v={patient.sex === 'F' ? 'Female' : patient.sex === 'M' ? 'Male' : null} />
                        <Row k="Date of birth" v={patient.dob ? patient.dob.slice(0, 10) : null} />
                        <Row k="Age" v={patient.age != null ? `${patient.age} yrs` : null} />
                        <Row k="Blood group" v={patient.blood_group} />
                    </Card>
                    <Card title="Allergies">
                        {(patient.allergies?.length ?? 0) === 0 ? (
                            <p className="text-sm text-gray-400">No known allergies.</p>
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
                    <Card title="Next of kin">
                        {nok ? (
                            <>
                                <Row k="Name" v={nok.name} />
                                <Row k="Relationship" v={nok.relationship} />
                                <Row k="Phone" v={nok.phone} />
                            </>
                        ) : (
                            <p className="text-sm text-gray-400">Not provided.</p>
                        )}
                    </Card>
                </div>

                {/* Timeline */}
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Timeline</h3>
                    {consultations.length === 0 ? (
                        <p className="text-sm text-gray-400">No consultations yet.</p>
                    ) : (
                        <ol className="space-y-4 border-l border-gray-200 pl-5 dark:border-gray-700">
                            {consultations.map((c) => (
                                <li key={c.id} className="relative">
                                    <span className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-[#0A3D62]" />
                                    <div className="flex flex-wrap items-center gap-2 text-sm">
                                        <span className="font-medium text-gray-900 dark:text-gray-100">{dt(c.created_at)}</span>
                                        <span className="text-gray-500">· {c.author?.name ?? 'Clinician'}</span>
                                        {c.signed_at && <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">signed</span>}
                                    </div>
                                    {(c.diagnoses?.length ?? 0) > 0 && (
                                        <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                                            <span className="text-gray-500">Dx:</span>{' '}
                                            {c.diagnoses!.map((d) => d.label).join('; ')}
                                        </div>
                                    )}
                                    {c.assessment && <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{c.assessment}</p>}
                                    {(c.prescriptions ?? []).map((rx) => (
                                        <div key={rx.id} className="mt-1 text-sm">
                                            <span className="text-gray-500">℞ {rx.items?.length ?? 0} item(s)</span>{' '}
                                            <a href={route('prescriptions.print', rx.id)} target="_blank" rel="noreferrer" className="text-[#0E9F63] hover:underline">print</a>
                                        </div>
                                    ))}
                                </li>
                            ))}
                        </ol>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
