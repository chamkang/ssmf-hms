<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patients', function (Blueprint $t) {
            $t->id();
            $t->string('mrn')->nullable()->unique(); // SSMF-P-#####, set after insert
            $t->string('first_name');
            $t->string('last_name');
            $t->char('sex', 1)->nullable();          // F | M
            $t->date('dob')->nullable();
            $t->string('marital_status')->nullable();
            $t->string('phone')->nullable()->index();
            $t->string('email')->nullable();
            $t->string('address')->nullable();
            $t->string('language', 5)->default('fr');
            $t->string('blood_group', 5)->nullable();
            $t->string('photo_path')->nullable();
            $t->text('notes')->nullable();
            $t->timestamp('verified_at')->nullable();
            $t->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $t->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamps();
            $t->softDeletes();
        });

        Schema::create('patient_allergies', function (Blueprint $t) {
            $t->id();
            $t->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $t->string('substance');
            $t->string('reaction')->nullable();
            $t->string('severity')->nullable();      // mild | moderate | severe
            $t->timestamps();
        });

        Schema::create('patient_conditions', function (Blueprint $t) {
            $t->id();
            $t->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $t->string('label');
            $t->string('since')->nullable();
            $t->string('status')->nullable();
            $t->timestamps();
        });

        Schema::create('next_of_kin', function (Blueprint $t) {
            $t->id();
            $t->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $t->string('name');
            $t->string('relationship')->nullable();
            $t->string('phone')->nullable();
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('next_of_kin');
        Schema::dropIfExists('patient_conditions');
        Schema::dropIfExists('patient_allergies');
        Schema::dropIfExists('patients');
    }
};
