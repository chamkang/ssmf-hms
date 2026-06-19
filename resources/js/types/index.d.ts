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

export interface Vital {
    id?: number;
    temp?: number | null;
    bp_sys?: number | null;
    bp_dia?: number | null;
    pulse?: number | null;
    resp?: number | null;
    spo2?: number | null;
    weight?: number | null;
    height?: number | null;
}

export interface Diagnosis {
    id?: number;
    icd10_code?: string | null;
    label: string;
    is_primary?: boolean;
}

export interface PrescriptionItem {
    id?: number;
    drug_text: string;
    dose?: string | null;
    route?: string | null;
    frequency?: string | null;
    duration?: string | null;
    quantity?: string | null;
    instructions?: string | null;
}

export interface Prescription {
    id: number;
    issued_at?: string | null;
    created_at?: string;
    status?: string;
    items?: PrescriptionItem[];
    patient?: Patient;
    author?: { name: string } | null;
}

export interface LabTest {
    id: number;
    code: string;
    name: string;
    price?: number;
    unit?: string | null;
    specimen?: string | null;
}

export interface LabOrderItem {
    id: number;
    name: string;
    unit?: string | null;
    ref_low?: number | string | null;
    ref_high?: number | string | null;
    value?: string | null;
    flag?: string | null;
}

export interface LabOrder {
    id: number;
    reference: string | null;
    status: string;
    created_at?: string;
    notes?: string | null;
    patient?: Patient;
    items?: LabOrderItem[];
}

export interface StockBatch {
    id: number;
    batch_no?: string | null;
    quantity: number;
    expiry_date?: string | null;
    drug?: { id: number; name: string; strength?: string | null; form?: string | null };
}

export interface Consultation {
    id: number;
    subjective?: string | null;
    objective?: string | null;
    assessment?: string | null;
    plan?: string | null;
    signed_at?: string | null;
    created_at?: string;
    author?: { name: string } | null;
    diagnoses?: Diagnosis[];
    prescriptions?: Prescription[];
}

export interface Tariff {
    id: number;
    label: string;
    amount: number;
}

export interface InvoiceItem {
    id?: number;
    label: string;
    qty: number;
    unit_price: number;
    amount: number;
    source_type?: string | null;
}

export interface Payment {
    id: number;
    method: string;
    provider?: string | null;
    reference?: string | null;
    amount: number;
    tendered?: number | null;
    change_due?: number | null;
    received_at?: string | null;
}

export interface Invoice {
    id: number;
    reference: string | null;
    status: string;
    currency?: string;
    notes?: string | null;
    created_at?: string;
    total: number;
    paid: number;
    balance: number;
    patient?: Patient;
    items?: InvoiceItem[];
    payments?: Payment[];
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
