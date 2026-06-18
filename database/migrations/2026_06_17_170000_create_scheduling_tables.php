<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('services', function (Blueprint $t) {
            $t->id();
            $t->string('slug')->unique();
            $t->string('name_fr');
            $t->string('name_en');
            $t->integer('duration_min')->default(20);
            $t->boolean('is_active')->default(true);
            $t->integer('sort_order')->default(0);
            $t->timestamps();
        });

        Schema::create('doctors', function (Blueprint $t) {
            $t->id();
            $t->string('slug')->unique();
            $t->string('full_name');
            $t->string('onmc')->nullable();
            $t->string('specialty_fr')->nullable();
            $t->string('specialty_en')->nullable();
            $t->boolean('is_active')->default(true);
            $t->integer('sort_order')->default(0);
            $t->timestamps();
        });

        Schema::create('schedules', function (Blueprint $t) {
            $t->id();
            $t->foreignId('doctor_id')->constrained()->cascadeOnDelete();
            $t->unsignedTinyInteger('weekday');   // 0=Sun … 6=Sat
            $t->string('start_time', 5);          // HH:MM
            $t->string('end_time', 5);
            $t->integer('slot_minutes')->default(20);
            $t->timestamps();
        });

        Schema::create('appointments', function (Blueprint $t) {
            $t->id();
            $t->string('reference')->nullable()->unique();   // SSMF-YYYY-#####
            $t->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $t->foreignId('doctor_id')->constrained();
            $t->foreignId('service_id')->constrained();
            $t->dateTime('starts_at');
            $t->dateTime('ends_at');
            $t->string('status')->default('pending'); // pending|confirmed|checked_in|in_progress|completed|cancelled|no_show
            $t->string('source')->default('desk');    // desk|web
            $t->text('notes')->nullable();
            $t->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $t->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamps();
            $t->softDeletes();
            $t->index(['doctor_id', 'starts_at']);
        });

        // Atomic double-booking guard: one live appointment per doctor+slot.
        // Partial unique index — supported by both PostgreSQL and SQLite.
        DB::statement("CREATE UNIQUE INDEX no_double_booking ON appointments (doctor_id, starts_at)
                       WHERE status IN ('pending','confirmed','checked_in','in_progress')");

        Schema::create('encounters', function (Blueprint $t) {
            $t->id();
            $t->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $t->foreignId('appointment_id')->nullable()->constrained()->nullOnDelete();
            $t->foreignId('doctor_id')->nullable()->constrained()->nullOnDelete();
            $t->string('type')->default('opd');
            $t->string('stage')->default('waiting'); // waiting|vitals|with_doctor|lab|pharmacy|cashier|done
            $t->string('status')->default('open');   // open|closed
            $t->timestamp('arrived_at')->nullable();
            $t->timestamp('closed_at')->nullable();
            $t->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamps();
            $t->index(['status', 'stage']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('encounters');
        Schema::dropIfExists('appointments');
        Schema::dropIfExists('schedules');
        Schema::dropIfExists('doctors');
        Schema::dropIfExists('services');
    }
};
