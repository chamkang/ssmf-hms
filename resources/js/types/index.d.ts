export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
}

export interface PatientAllergy {
    id?: number;
    substance: string;
    reaction?: string | null;
    severity?: string | null;
}

export interface PatientCondition {
    id?: number;
    label: string;
    since?: string | null;
    status?: string | null;
}

export interface NextOfKin {
    id?: number;
    name: string;
    relationship?: string | null;
    phone?: string | null;
}

export interface Patient {
    id: number;
    mrn: string | null;
    first_name: string;
    last_name: string;
    full_name: string;
    sex: string | null;
    dob: string | null;
    age: number | null;
    marital_status: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    language: string | null;
    blood_group: string | null;
    notes: string | null;
    created_at?: string;
    allergies?: PatientAllergy[];
    conditions?: PatientCondition[];
    next_of_kin?: NextOfKin[];
}

export interface Doctor {
    id: number;
    full_name: string;
    specialty_fr?: string | null;
    specialty_en?: string | null;
    onmc?: string | null;
}

export interface Service {
    id: number;
    name_fr?: string;
    name_en?: string;
    duration_min?: number;
}

export interface Appointment {
    id: number;
    reference: string | null;
    starts_at: string;
    ends_at: string;
    status: string;
    source?: string;
    notes?: string | null;
    patient?: Patient;
    doctor?: Doctor;
    service?: Service;
}

export interface Encounter {
    id: number;
    stage: string;
    status: string;
    arrived_at?: string | null;
    appointment_id?: number | null;
    patient?: Patient;
    doctor?: Doctor | null;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    flash: {
        success?: string;
        error?: string;
        duplicates?: Patient[];
    };
};
