<?php

namespace Database\Seeders;

use App\Models\Tariff;
use Illuminate\Database\Seeder;

class TariffSeeder extends Seeder
{
    public function run(): void
    {
        $tariffs = [
            ['CONS-GEN', 'General consultation', 5000],
            ['CONS-SPEC', 'Specialist consultation', 10000],
            ['CONS-ANC', 'Antenatal consultation', 5000],
            ['CONS-FERT', 'Fertility consultation', 15000],
            ['DRESS', 'Dressing / minor procedure', 3000],
            ['ECHO', 'Ultrasound / echography', 10000],
        ];
        foreach ($tariffs as $i => $t) {
            Tariff::updateOrCreate(['code' => $t[0]], ['label' => $t[1], 'amount' => $t[2], 'sort_order' => $i, 'is_active' => true]);
        }
    }
}
