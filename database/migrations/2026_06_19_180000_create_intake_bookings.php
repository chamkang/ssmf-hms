<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('intake_bookings', function (Blueprint $t) {
            $t->id();
            $t->string('web_reference')->nullable()->unique(); // the website's booking ref (idempotency)
            $t->string('first_name');
            $t->string('last_name');
            $t->string('phone')->nullable();
            $t->string('email')->nullable();
            $t->char('sex', 1)->nullable();
            $t->date('dob')->nullable();
            $t->string('language', 5)->default('fr');
            $t->foreignId('service_id')->nullable()->constrained()->nullOnDelete();
            $t->foreignId('doctor_id')->nullable()->constrained()->nullOnDelete();
            $t->dateTime('preferred_at')->nullable();
            $t->string('reason')->nullable();
            $t->string('status')->default('pending'); // pending | converted | rejected
            $t->foreignId('patient_id')->nullable()->constrained()->nullOnDelete();
            $t->foreignId('appointment_id')->nullable()->constrained()->nullOnDelete();
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('intake_bookings');
    }
};
