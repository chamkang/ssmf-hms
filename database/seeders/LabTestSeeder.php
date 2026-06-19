<?php

namespace Database\Seeders;

use App\Models\LabTest;
use Illuminate\Database\Seeder;

class LabTestSeeder extends Seeder
{
    public function run(): void
    {
        // code, name, specimen, unit, ref_low, ref_high, price (FCFA)
        $tests = [
            ['HB', 'Hemoglobin', 'Blood', 'g/dL', 12, 16, 3000],
            ['WBC', 'White cell count', 'Blood', '10^9/L', 4, 11, 3000],
            ['PLT', 'Platelets', 'Blood', '10^9/L', 150, 450, 3000],
            ['GLUF', 'Fasting blood glucose', 'Blood', 'mg/dL', 70, 110, 2000],
            ['MAL', 'Malaria RDT', 'Blood', null, null, null, 1500],
            ['WID', 'Widal test', 'Blood', null, null, null, 2500],
            ['HIV', 'HIV test', 'Blood', null, null, null, 2000],
            ['HBSAG', 'Hepatitis B (HBsAg)', 'Blood', null, null, null, 3000],
            ['UREA', 'Urea', 'Blood', 'mg/dL', 15, 45, 3000],
            ['CREA', 'Creatinine', 'Blood', 'mg/dL', 0.6, 1.3, 3000],
            ['URN', 'Urinalysis', 'Urine', null, null, null, 2000],
            ['BHCG', 'Pregnancy test (beta-hCG)', 'Blood', null, null, null, 2500],
            ['TSH', 'Thyroid (TSH)', 'Blood', 'mIU/L', 0.4, 4.0, 6000],
            ['AMH', 'Anti-Mullerian hormone (AMH)', 'Blood', 'ng/mL', 1.0, 4.0, 15000],
            ['SEMEN', 'Semen analysis', 'Semen', null, null, null, 10000],
            ['STOOL', 'Stool examination', 'Stool', null, null, null, 2000],
        ];
        foreach ($tests as $i => $t) {
            LabTest::updateOrCreate(['code' => $t[0]], [
                'name' => $t[1], 'specimen' => $t[2], 'unit' => $t[3],
                'ref_low' => $t[4], 'ref_high' => $t[5], 'price' => $t[6],
                'sort_order' => $i, 'is_active' => true,
            ]);
        }
    }
}
