<?php

namespace Database\Seeders;

use App\Models\Ward;
use Illuminate\Database\Seeder;

class WardsBedsSeeder extends Seeder
{
    /** Starter ward/bed layout for Saint Sylvester (adjust on site). */
    public function run(): void
    {
        $layout = [
            ['name' => 'Maternity Ward', 'kind' => 'maternity', 'prefix' => 'M', 'count' => 6],
            ['name' => 'General Ward', 'kind' => 'general', 'prefix' => 'G', 'count' => 8],
            ['name' => 'Private Rooms', 'kind' => 'private', 'prefix' => 'P', 'count' => 4],
            ['name' => 'Neonatal Unit', 'kind' => 'nicu', 'prefix' => 'N', 'count' => 4],
        ];

        foreach ($layout as $w) {
            $ward = Ward::firstOrCreate(['name' => $w['name']], ['kind' => $w['kind'], 'is_active' => true]);
            for ($i = 1; $i <= $w['count']; $i++) {
                $ward->beds()->firstOrCreate(['label' => sprintf('%s-%02d', $w['prefix'], $i)]);
            }
        }
    }
}
