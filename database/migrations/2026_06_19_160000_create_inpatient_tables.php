<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wards', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('kind')->nullable(); // maternity | general | nicu | private
            $t->boolean('is_active')->default(true);
            $t->timestamps();
        });

        Schema::create('beds', function (Blueprint $t) {
            $t->id();
            $t->foreignId('ward_id')->constrained()->cascadeOnDelete();
            $t->string('label'); // e.g. M-01
            $t->boolean('is_active')->default(true);
            $t->timestamps();
            $t->unique(['ward_id', 'label']);
        });

        Schema::create('admissions', function (Blueprint $t) {
            $t->id();
            $t->string('reference')->nullable()->unique(); // SSMF-ADM-YYYY-#####
            $t->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $t->foreignId('bed_id')->nullable()->constrained()->nullOnDelete();
            $t->foreignId('attending_id')->nullable()->constrained('users')->nullOnDelete();
            $t->dateTime('admitted_at');
            $t->dateTime('discharged_at')->nullable();
            $t->string('reason')->nullable();
            $t->string('status')->default('active'); // active | discharged
            $t->text('discharge_summary')->nullable();
            $t->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamps();
        });

        Schema::create('admission_notes', function (Blueprint $t) {
            $t->id();
            $t->foreignId('admission_id')->constrained()->cascadeOnDelete();
            $t->dateTime('noted_at');
            $t->string('kind')->default('progress'); // progress | nursing | round
            $t->text('note');
            // bedside vitals captured with the round (all optional)
            $t->decimal('temp', 4, 1)->nullable();
            $t->unsignedSmallInteger('pulse')->nullable();
            $t->unsignedSmallInteger('bp_sys')->nullable();
            $t->unsignedSmallInteger('bp_dia')->nullable();
            $t->unsignedSmallInteger('spo2')->nullable();
            $t->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admission_notes');
        Schema::dropIfExists('admissions');
        Schema::dropIfExists('beds');
        Schema::dropIfExists('wards');
    }
};
