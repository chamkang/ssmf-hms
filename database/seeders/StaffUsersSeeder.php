<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class StaffUsersSeeder extends Seeder
{
    /**
     * Starter staff login accounts for Saint Sylvester.
     *
     * Real doctors (names/ONMC mirror the clinic roster); reception, lab and a
     * nursing station as generic starters the admin can rename or extend via
     * the Users screen. All share a temporary password that MUST be changed on
     * first login.
     */
    public function run(): void
    {
        $tempPassword = 'Ssmf@2026';

        $staff = [
            // Founder & senior clinician — broad oversight.
            ['name' => 'Dr Akwa John', 'email' => 'john.akwa@saintsylvester.local', 'role' => 'medical_director'],
            // Doctors
            ['name' => 'Dr Ayameria Assiene', 'email' => 'ayameria.assiene@saintsylvester.local', 'role' => 'doctor'],
            ['name' => 'Dr Yemene Zangue', 'email' => 'yemene.zangue@saintsylvester.local', 'role' => 'doctor'],
            ['name' => 'Dr Engama Ebong', 'email' => 'engama.ebong@saintsylvester.local', 'role' => 'doctor'],
            ['name' => 'Dr Tchatchouang Lowe', 'email' => 'tchatchouang.lowe@saintsylvester.local', 'role' => 'doctor'],
            // Support staff (rename / add more in the Users screen)
            ['name' => 'Reception Desk', 'email' => 'reception@saintsylvester.local', 'role' => 'receptionist'],
            ['name' => 'Laboratory', 'email' => 'lab@saintsylvester.local', 'role' => 'laboratory'],
            ['name' => 'Nursing Station', 'email' => 'nursing@saintsylvester.local', 'role' => 'nurse'],
        ];

        foreach ($staff as $s) {
            $user = User::firstOrCreate(
                ['email' => $s['email']],
                ['name' => $s['name'], 'password' => $tempPassword, 'is_active' => true, 'email_verified_at' => now()],
            );
            if (! $user->hasRole($s['role'])) {
                $user->syncRoles([$s['role']]);
            }
        }
    }
}
