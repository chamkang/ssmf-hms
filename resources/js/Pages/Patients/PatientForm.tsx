import InputError from '@/Components/InputError';

interface Props {
    data: any;
    setData: (key: any, value?: any) => void;
    errors: Record<string, any>;
}

const field =
    'mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-[#0E9F63] focus:ring-[#0E9F63] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200';
const label = 'block text-sm font-medium text-gray-700 dark:text-gray-300';

export default function PatientForm({ data, setData, errors }: Props) {
    const allergies: any[] = data.allergies ?? [];
    const setAllergy = (i: number, key: string, val: string) =>
        setData(
            'allergies',
            allergies.map((a, idx) => (idx === i ? { ...a, [key]: val } : a)),
        );
    const addAllergy = () =>
        setData('allergies', [
            ...allergies,
            { substance: '', severity: '', reaction: '' },
        ]);
    const removeAllergy = (i: number) =>
        setData(
            'allergies',
            allergies.filter((_, idx) => idx !== i),
        );

    const nok = data.next_of_kin ?? { name: '', relationship: '', phone: '' };
    const setNok = (key: string, val: string) =>
        setData('next_of_kin', { ...nok, [key]: val });

    return (
        <div className="space-y-8">
            <section>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                    Identité
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className={label}>Prénom *</label>
                        <input className={field} value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} />
                        <InputError message={errors.first_name} className="mt-1" />
                    </div>
                    <div>
                        <label className={label}>Nom *</label>
                        <input className={field} value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} />
                        <InputError message={errors.last_name} className="mt-1" />
                    </div>
                    <div>
                        <label className={label}>Sexe</label>
                        <select className={field} value={data.sex ?? ''} onChange={(e) => setData('sex', e.target.value)}>
                            <option value="">—</option>
                            <option value="F">Féminin</option>
                            <option value="M">Masculin</option>
                        </select>
                        <InputError message={errors.sex} className="mt-1" />
                    </div>
                    <div>
                        <label className={label}>Date de naissance</label>
                        <input type="date" className={field} value={data.dob ?? ''} onChange={(e) => setData('dob', e.target.value)} />
                        <InputError message={errors.dob} className="mt-1" />
                    </div>
                    <div>
                        <label className={label}>Situation matrimoniale</label>
                        <select className={field} value={data.marital_status ?? ''} onChange={(e) => setData('marital_status', e.target.value)}>
                            <option value="">—</option>
                            <option value="single">Célibataire</option>
                            <option value="married">Marié(e)</option>
                            <option value="divorced">Divorcé(e)</option>
                            <option value="widowed">Veuf / Veuve</option>
                        </select>
                    </div>
                    <div>
                        <label className={label}>Groupe sanguin</label>
                        <input className={field} value={data.blood_group ?? ''} onChange={(e) => setData('blood_group', e.target.value)} placeholder="O+, A-…" />
                    </div>
                </div>
            </section>

            <section>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                    Coordonnées
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className={label}>Téléphone *</label>
                        <input className={field} value={data.phone} onChange={(e) => setData('phone', e.target.value)} placeholder="+237 6…" />
                        <InputError message={errors.phone} className="mt-1" />
                    </div>
                    <div>
                        <label className={label}>E-mail</label>
                        <input type="email" className={field} value={data.email ?? ''} onChange={(e) => setData('email', e.target.value)} />
                        <InputError message={errors.email} className="mt-1" />
                    </div>
                    <div className="sm:col-span-2">
                        <label className={label}>Adresse</label>
                        <input className={field} value={data.address ?? ''} onChange={(e) => setData('address', e.target.value)} />
                    </div>
                </div>
            </section>

            <section>
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                        Allergies
                    </h3>
                    <button type="button" onClick={addAllergy} className="text-sm font-medium text-[#0E9F63] hover:underline">
                        + Ajouter
                    </button>
                </div>
                {allergies.length === 0 && (
                    <p className="text-sm text-gray-400">Aucune allergie renseignée.</p>
                )}
                <div className="space-y-2">
                    {allergies.map((a, i) => (
                        <div key={i} className="flex flex-wrap items-center gap-2">
                            <input className={`${field} mt-0 flex-1`} placeholder="Substance" value={a.substance} onChange={(e) => setAllergy(i, 'substance', e.target.value)} />
                            <select className={`${field} mt-0 w-44`} value={a.severity ?? ''} onChange={(e) => setAllergy(i, 'severity', e.target.value)}>
                                <option value="">Gravité…</option>
                                <option value="mild">Légère</option>
                                <option value="moderate">Modérée</option>
                                <option value="severe">Sévère</option>
                            </select>
                            <button type="button" onClick={() => removeAllergy(i)} className="text-sm text-red-500 hover:underline">
                                Retirer
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                    Proche à prévenir
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                        <label className={label}>Nom</label>
                        <input className={field} value={nok.name ?? ''} onChange={(e) => setNok('name', e.target.value)} />
                    </div>
                    <div>
                        <label className={label}>Lien</label>
                        <input className={field} value={nok.relationship ?? ''} onChange={(e) => setNok('relationship', e.target.value)} />
                    </div>
                    <div>
                        <label className={label}>Téléphone</label>
                        <input className={field} value={nok.phone ?? ''} onChange={(e) => setNok('phone', e.target.value)} />
                    </div>
                </div>
            </section>

            <section>
                <label className={label}>Notes</label>
                <textarea className={field} rows={3} value={data.notes ?? ''} onChange={(e) => setData('notes', e.target.value)} />
            </section>
        </div>
    );
}
