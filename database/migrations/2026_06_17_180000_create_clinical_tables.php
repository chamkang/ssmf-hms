<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('icd10', function (Blueprint $t) {
            $t->string('code')->primary();
            $t->string('title');
        });

        Schema::create('drugs', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('form')->nullable();      // tablet, capsule, syrup…
            $t->string('strength')->nullable();   // 500 mg…
            $t->string('route')->nullable();      // oral, IV…
            $t->boolean('is_active')->default(true);
            $t->timestamps();
        });

        Schema::create('vitals', function (Blueprint $t) {
            $t->id();
            $t->foreignId('encounter_id')->nullable()->constrained()->nullOnDelete();
            $t->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $t->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $t->decimal('temp', 4, 1)->nullable();
            $t->unsignedSmallInteger('bp_sys')->nullable();
            $t->unsignedSmallInteger('bp_dia')->nullable();
            $t->unsignedSmallInteger('pulse')->nullable();
            $t->unsignedSmallInteger('resp')->nullable();
            $t->unsignedSmallInteger('spo2')->nullable();
            $t->decimal('weight', 5, 1)->nullable();
            $t->decimal('height', 5, 1)->nullable();
            $t->timestamps();
        });

        Schema::create('consultations', function (Blueprint $t) {
            $t->id();
            $t->foreignId('encounter_id')->nullable()->constrained()->nullOnDelete();
            $t->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $t->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete(); // author
            $t->text('subjective')->nullable();
            $t->text('objective')->nullable();
            $t->text('assessment')->nullable();
            $t->text('plan')->nullable();
            $t->timestamp('signed_at')->nullable();
            $t->integer('version')->default(1);
            $t->timestamps();
        });

        Schema::create('diagnoses', function (Blueprint $t) {
            $t->id();
            $t->foreignId('consultation_id')->constrained()->cascadeOnDelete();
            $t->string('icd10_code')->nullable();
            $t->string('label');
            $t->boolean('is_primary')->default(false);
            $t->timestamps();
        });

        Schema::create('prescriptions', function (Blueprint $t) {
            $t->id();
            $t->foreignId('consultation_id')->nullable()->constrained()->nullOnDelete();
            $t->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $t->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamp('issued_at')->nullable();
            $t->string('status')->default('active');
            $t->timestamps();
        });

        Schema::create('prescription_items', function (Blueprint $t) {
            $t->id();
            $t->foreignId('prescription_id')->constrained()->cascadeOnDelete();
            $t->foreignId('drug_id')->nullable()->constrained()->nullOnDelete();
            $t->string('drug_text');
            $t->string('dose')->nullable();
            $t->string('route')->nullable();
            $t->string('frequency')->nullable();
            $t->string('duration')->nullable();
            $t->string('quantity')->nullable();
            $t->string('instructions')->nullable();
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prescription_items');
        Schema::dropIfExists('prescriptions');
        Schema::dropIfExists('diagnoses');
        Schema::dropIfExists('consultations');
        Schema::dropIfExists('vitals');
        Schema::dropIfExists('drugs');
        Schema::dropIfExists('icd10');
    }
};
