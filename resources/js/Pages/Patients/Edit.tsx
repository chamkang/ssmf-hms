import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Patient } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import PatientForm from './PatientForm';

export default function Edit({ patient }: { patient: Patient }) {
    const nok = patient.next_of_kin?.[0];
    const { data, setData, put, processing, errors } = useForm<any>({
        first_name: patient.first_name,
        last_name: patient.last_name,
        sex: patient.sex ?? '',
        dob: (patient.dob ?? '').slice(0, 10),
        marital_status: patient.marital_status ?? '',
        phone: patient.phone ?? '',
        email: patient.email ?? '',
        address: patient.address ?? '',
        language: patient.language ?? 'fr',
        blood_group: patient.blood_group ?? '',
        notes: patient.notes ?? '',
        allergies: (patient.allergies ?? []).map((a) => ({
            substance: a.substance,
            severity: a.severity ?? '',
            reaction: a.reaction ?? '',
        })),
        next_of_kin: nok
            ? { name: nok.name, relationship: nok.relationship ?? '', phone: nok.phone ?? '' }
            : { name: '', relationship: '', phone: '' },
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        put(route('patients.update', patient.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Modifier — {patient.full_name}
                </h2>
            }
        >
            <Head title={`Modifier ${patient.full_name}`} />
            <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
                <form onSubmit={submit} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <PatientForm data={data} setData={setData} errors={errors} />
                    <div className="mt-6 flex items-center justify-end gap-3">
                        <Link href={route('patients.show', patient.id)} className="text-sm text-gray-500 hover:underline">
                            Annuler
                        </Link>
                        <button disabled={processing} className="rounded-md bg-[#0E9F63] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0B7F50] disabled:opacity-50">
                            Enregistrer
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
