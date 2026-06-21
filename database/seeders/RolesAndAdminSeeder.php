<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndAdminSeeder extends Seeder
{
    /**
     * Seed staff roles, a starter permission set, and the first administrator.
     * Roles mirror the HMS TRD §2.
     */
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $roles = [
            'admin', 'medical_director', 'doctor', 'nurse', 'receptionist',
            'laboratory', 'pharmacist', 'cashier', 'embryologist', 'midwife', 'radiographer',
        ];
        foreach ($roles as $r) {
            Role::firstOrCreate(['name' => $r, 'guard_name' => 'web']);
        }

        $permissions = [
            'patients.view', 'patients.manage',
            'appointments.manage', 'reception.queue',
            'consultations.write', 'prescriptions.write',
            'lab.results', 'pharmacy.dispense',
            'billing.manage', 'reports.view',
            'fertility.manage',
            'users.manage', 'settings.manage', 'audit.view',
        ];
        foreach ($permissions as $p) {
            Permission::firstOrCreate(['name' => $p, 'guard_name' => 'web']);
        }

        // Admin holds every permission.
        Role::findByName('admin', 'web')->syncPermissions(Permission::all());

        // Permissions per role (TRD §2 — least privilege).
        $map = [
            'medical_director' => ['patients.view', 'patients.manage', 'appointments.manage', 'reception.queue', 'consultations.write', 'prescriptions.write', 'lab.results', 'pharmacy.dispense', 'billing.manage', 'reports.view', 'fertility.manage', 'audit.view'],
            'doctor' => ['patients.view', 'patients.manage', 'appointments.manage', 'reception.queue', 'consultations.write', 'prescriptions.write', 'fertility.manage'],
            'nurse' => ['patients.view', 'appointments.manage', 'reception.queue'],
            'receptionist' => ['patients.view', 'patients.manage', 'appointments.manage', 'reception.queue', 'billing.manage'],
            'cashier' => ['patients.view', 'billing.manage', 'reports.view'],
            'laboratory' => ['patients.view', 'lab.results'],
            'pharmacist' => ['patients.view', 'pharmacy.dispense'],
            'embryologist' => ['patients.view', 'lab.results', 'fertility.manage'],
            'midwife' => ['patients.view', 'appointments.manage', 'reception.queue', 'consultations.write'],
            'radiographer' => ['patients.view', 'lab.results'],
        ];
        foreach ($map as $role => $perms) {
            Role::findByName($role, 'web')->syncPermissions($perms);
        }

        // First administrator (password is auto-hashed by the User 'hashed' cast).
        $admin = User::firstOrCreate(
            ['email' => 'admin@saintsylvester.local'],
            ['name' => 'Administrator', 'password' => 'Admin#2026', 'email_verified_at' => now()]
        );
        if (! $admin->hasRole('admin')) {
            $admin->assignRole('admin');
        }
    }
}
