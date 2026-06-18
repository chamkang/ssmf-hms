<?php

namespace Database\Seeders;

use App\Models\Doctor;
use App\Models\Schedule;
use App\Models\Service;
use Illuminate\Database\Seeder;

class ServicesDoctorsSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            ['fertility', 'Fertilité & PMA (FIV)', 'Fertility & IVF', 30],
            ['gynecology', 'Obstétrique & Gynécologie', 'Obstetrics & Gynecology', 20],
            ['antenatal', 'Consultation prénatale (CPN)', 'Antenatal clinic', 20],
            ['general-medicine', 'Médecine générale', 'General medicine', 20],
            ['internal-medicine', 'Médecine interne & Cardiologie', 'Internal medicine & Cardiology', 30],
            ['pediatrics', 'Pédiatrie', 'Pediatrics', 20],
            ['surgery', 'Chirurgie', 'Surgery', 30],
            ['imaging', 'Radiographie & Échographie', 'Radiography & Echography', 20],
            ['laboratory', "Laboratoire d'analyses", 'Laboratory', 15],
        ];
        foreach ($services as $i => $s) {
            Service::updateOrCreate(['slug' => $s[0]], [
                'name_fr' => $s[1], 'name_en' => $s[2], 'duration_min' => $s[3], 'sort_order' => $i, 'is_active' => true,
            ]);
        }

        $doctors = [
            ['akwa-john', 'Dr. Akwa John', '4529', 'Gynécologue-Obstétricien (Fondateur)', 'Gyn-Obstetrician (Founder)'],
            ['ayameria-assiene', 'Dr. Ayameria Assiene', '7559', 'Gynécologue-Obstétricien', 'Gyn-Obstetrician'],
            ['yemene-zangue', 'Dr. Yemene Zangue', '7078', 'Interniste / Cardiologue', 'Internist / Cardiologist'],
            ['engama-ebong', 'Dr. Engama Ebong', '7675', 'Pédiatre', 'Pediatrician'],
            ['tchatchouang-lowe', 'Dr. Tchatchouang Lowe', '10076', 'Médecin généraliste', 'General practitioner'],
        ];
        foreach ($doctors as $i => $d) {
            $doc = Doctor::updateOrCreate(['slug' => $d[0]], [
                'full_name' => $d[1], 'onmc' => $d[2], 'specialty_fr' => $d[3], 'specialty_en' => $d[4],
                'sort_order' => $i, 'is_active' => true,
            ]);
            if ($doc->schedules()->count() === 0) {
                foreach ([1, 2, 3, 4, 5] as $weekday) { // Mon–Fri
                    Schedule::create([
                        'doctor_id' => $doc->id, 'weekday' => $weekday,
                        'start_time' => '08:00', 'end_time' => '16:00', 'slot_minutes' => 20,
                    ]);
                }
            }
        }
    }
}
