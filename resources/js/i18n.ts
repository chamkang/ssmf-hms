import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';

/**
 * Lightweight client-side translations for the HMS chrome.
 *
 * English is the default UI language; French is offered via the in-app toggle.
 * Add keys to both dictionaries as pages are localised — `t()` falls back to
 * the key itself (then to English) so partial coverage degrades gracefully.
 */
type Dict = Record<string, string>;

export const messages: Record<string, Dict> = {
    en: {
        // Navigation
        'nav.dashboard': 'Dashboard',
        'nav.patients': 'Patients',
        'nav.appointments': 'Appointments',
        'nav.flow_board': 'Flow Board',
        'nav.laboratory': 'Laboratory',
        'nav.pharmacy': 'Pharmacy',
        'nav.billing': 'Billing',
        'nav.reports': 'Reports',
        'nav.audit': 'Audit',
        // Account menu
        'account.profile': 'Profile',
        'account.logout': 'Log Out',
        'account.language': 'Language',
        // Common actions
        'action.save': 'Save',
        'action.cancel': 'Cancel',
        'action.search': 'Search',
        'action.add': 'Add',
        'action.edit': 'Edit',
        'action.print': 'Print',
        'action.back': 'Back',
        'action.confirm': 'Confirm',
        // Dashboard
        'dashboard.title': 'Dashboard',
        'dashboard.welcome': 'Welcome back, :name.',
        'dashboard.appts_today': 'Appointments today',
        'dashboard.in_queue': 'In the queue',
        'dashboard.revenue_today': 'Revenue today',
        'dashboard.open_invoices': 'Open invoices',
        'dashboard.pending_labs': 'Pending lab results',
        'dashboard.total_patients': 'Total patients',
        'dashboard.new_patient': '+ New patient',
        'dashboard.new_appointment': '+ New appointment',
        'dashboard.open_flow': 'Open Flow Board',
        // Patients
        'patients.title': 'Patients',
        'patients.new': 'New patient',
        'patients.search_placeholder': 'Search by name, MRN or phone…',
        'patients.mrn': 'MRN',
        'patients.name': 'Name',
        'patients.phone': 'Phone',
        'patients.age': 'Age',
        'patients.sex': 'Sex',
    },
    fr: {
        // Navigation
        'nav.dashboard': 'Tableau de bord',
        'nav.patients': 'Patients',
        'nav.appointments': 'Rendez-vous',
        'nav.flow_board': 'Flux des patients',
        'nav.laboratory': 'Laboratoire',
        'nav.pharmacy': 'Pharmacie',
        'nav.billing': 'Facturation',
        'nav.reports': 'Rapports',
        'nav.audit': 'Audit',
        // Account menu
        'account.profile': 'Profil',
        'account.logout': 'Se déconnecter',
        'account.language': 'Langue',
        // Common actions
        'action.save': 'Enregistrer',
        'action.cancel': 'Annuler',
        'action.search': 'Rechercher',
        'action.add': 'Ajouter',
        'action.edit': 'Modifier',
        'action.print': 'Imprimer',
        'action.back': 'Retour',
        'action.confirm': 'Confirmer',
        // Dashboard
        'dashboard.title': 'Tableau de bord',
        'dashboard.welcome': 'Bon retour, :name.',
        'dashboard.appts_today': 'Rendez-vous du jour',
        'dashboard.in_queue': "File d'attente",
        'dashboard.revenue_today': 'Recettes du jour',
        'dashboard.open_invoices': 'Factures ouvertes',
        'dashboard.pending_labs': 'Résultats de labo en attente',
        'dashboard.total_patients': 'Total patients',
        'dashboard.new_patient': '+ Nouveau patient',
        'dashboard.new_appointment': '+ Nouveau rendez-vous',
        'dashboard.open_flow': 'Ouvrir le flux',
        // Patients
        'patients.title': 'Patients',
        'patients.new': 'Nouveau patient',
        'patients.search_placeholder': 'Rechercher par nom, IPP ou téléphone…',
        'patients.mrn': 'IPP',
        'patients.name': 'Nom',
        'patients.phone': 'Téléphone',
        'patients.age': 'Âge',
        'patients.sex': 'Sexe',
    },
};

/** Hook returning the current locale and a translator. */
export function useTrans() {
    const locale =
        (usePage().props as unknown as PageProps).locale ?? 'en';

    const t = (key: string, params?: Record<string, string | number>): string => {
        let out = messages[locale]?.[key] ?? messages.en[key] ?? key;
        if (params) {
            for (const [k, v] of Object.entries(params)) {
                out = out.replace(`:${k}`, String(v));
            }
        }
        return out;
    };

    return { locale, t };
}
