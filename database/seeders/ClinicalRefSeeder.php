<?php

namespace Database\Seeders;

use App\Models\Drug;
use App\Models\Icd10;
use Illuminate\Database\Seeder;

class ClinicalRefSeeder extends Seeder
{
    public function run(): void
    {
        $icd10 = [
            ['Z34', 'Supervision of normal pregnancy'],
            ['Z39', 'Postpartum care and examination'],
            ['O80', 'Single spontaneous delivery'],
            ['O23', 'Infection of genitourinary tract in pregnancy'],
            ['N97', 'Female infertility'],
            ['N46', 'Male infertility'],
            ['E28', 'Ovarian dysfunction'],
            ['N80', 'Endometriosis'],
            ['N73', 'Female pelvic inflammatory disease'],
            ['N39.0', 'Urinary tract infection, site not specified'],
            ['I10', 'Essential (primary) hypertension'],
            ['E11', 'Type 2 diabetes mellitus'],
            ['E78', 'Disorders of lipoprotein metabolism'],
            ['J06', 'Acute upper respiratory infection'],
            ['J18', 'Pneumonia, unspecified organism'],
            ['B54', 'Unspecified malaria'],
            ['A09', 'Infectious gastroenteritis and colitis'],
            ['K29', 'Gastritis and duodenitis'],
            ['D50', 'Iron deficiency anaemia'],
            ['R50', 'Fever of other and unknown origin'],
            ['M54', 'Dorsalgia (back pain)'],
            ['F41', 'Other anxiety disorders'],
            ['L20', 'Atopic dermatitis'],
            ['Z00', 'General examination without complaint or diagnosis'],
        ];
        foreach ($icd10 as $c) {
            Icd10::updateOrCreate(['code' => $c[0]], ['title' => $c[1]]);
        }

        $drugs = [
            ['Paracetamol', 'tablet', '500 mg', 'oral'],
            ['Ibuprofen', 'tablet', '400 mg', 'oral'],
            ['Diclofenac', 'tablet', '50 mg', 'oral'],
            ['Amoxicillin', 'capsule', '500 mg', 'oral'],
            ['Amoxicillin/Clavulanic acid', 'tablet', '625 mg', 'oral'],
            ['Azithromycin', 'tablet', '500 mg', 'oral'],
            ['Ciprofloxacin', 'tablet', '500 mg', 'oral'],
            ['Doxycycline', 'capsule', '100 mg', 'oral'],
            ['Metronidazole', 'tablet', '500 mg', 'oral'],
            ['Artemether/Lumefantrine', 'tablet', '20/120 mg', 'oral'],
            ['Omeprazole', 'capsule', '20 mg', 'oral'],
            ['Cetirizine', 'tablet', '10 mg', 'oral'],
            ['Salbutamol', 'inhaler', '100 mcg', 'inhaled'],
            ['Metformin', 'tablet', '500 mg', 'oral'],
            ['Amlodipine', 'tablet', '5 mg', 'oral'],
            ['Folic acid', 'tablet', '5 mg', 'oral'],
            ['Ferrous sulfate', 'tablet', '200 mg', 'oral'],
            ['Vitamin B complex', 'tablet', null, 'oral'],
            ['Clomiphene citrate', 'tablet', '50 mg', 'oral'],
            ['Progesterone', 'capsule', '200 mg', 'oral'],
            ['Oral rehydration salts', 'sachet', null, 'oral'],
        ];
        foreach ($drugs as $d) {
            Drug::updateOrCreate(
                ['name' => $d[0], 'strength' => $d[2]],
                ['form' => $d[1], 'route' => $d[3], 'is_active' => true],
            );
        }
    }
}
