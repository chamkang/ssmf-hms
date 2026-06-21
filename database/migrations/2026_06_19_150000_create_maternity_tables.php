<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // One antenatal record per pregnancy.
        Schema::create('pregnancies', function (Blueprint $t) {
            $t->id();
            $t->string('reference')->nullable()->unique(); // SSMF-OB-#####
            $t->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $t->date('lmp')->nullable();           // last menstrual period
            $t->date('edd')->nullable();           // estimated delivery date (Naegele)
            $t->unsignedSmallInteger('gravida')->nullable();
            $t->unsignedSmallInteger('para')->nullable();
            $t->unsignedSmallInteger('abortions')->nullable();
            $t->string('blood_group', 5)->nullable();
            $t->string('rhesus', 3)->nullable();   // + | -
            $t->string('risk_level')->default('low'); // low | high
            $t->text('risk_factors')->nullable();
            $t->string('status')->default('active'); // active | delivered | closed
            $t->text('notes')->nullable();
            $t->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamps();
            $t->softDeletes();
        });

        // Serial antenatal visits.
        Schema::create('anc_visits', function (Blueprint $t) {
            $t->id();
            $t->foreignId('pregnancy_id')->constrained()->cascadeOnDelete();
            $t->date('visit_on');
            $t->unsignedSmallInteger('ga_weeks')->nullable(); // gestational age at visit
            $t->decimal('weight', 5, 1)->nullable();
            $t->unsignedSmallInteger('bp_sys')->nullable();
            $t->unsignedSmallInteger('bp_dia')->nullable();
            $t->decimal('fundal_height', 4, 1)->nullable(); // cm
            $t->unsignedSmallInteger('fetal_heart_rate')->nullable(); // bpm
            $t->string('presentation')->nullable(); // cephalic | breech | transverse
            $t->string('urine_protein')->nullable();
            $t->string('urine_glucose')->nullable();
            $t->decimal('hb', 4, 1)->nullable(); // haemoglobin
            $t->string('note')->nullable();
            $t->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamps();
        });

        // Partograph: labour monitoring entries (WHO partograph data points).
        Schema::create('partograph_entries', function (Blueprint $t) {
            $t->id();
            $t->foreignId('pregnancy_id')->constrained()->cascadeOnDelete();
            $t->dateTime('recorded_at');
            $t->unsignedSmallInteger('cervix_cm')->nullable();        // 0-10 dilatation
            $t->unsignedSmallInteger('descent')->nullable();          // 0-5 (fifths palpable)
            $t->unsignedSmallInteger('fetal_heart_rate')->nullable(); // bpm
            $t->unsignedSmallInteger('contractions_per10')->nullable();
            $t->string('liquor')->nullable();   // I (intact) | C (clear) | M (meconium) | B (blood)
            $t->string('moulding')->nullable(); // 0 | + | ++ | +++
            $t->unsignedSmallInteger('pulse')->nullable();
            $t->unsignedSmallInteger('bp_sys')->nullable();
            $t->unsignedSmallInteger('bp_dia')->nullable();
            $t->decimal('temp', 4, 1)->nullable();
            $t->string('note')->nullable();
            $t->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamps();
        });

        // Delivery outcome.
        Schema::create('deliveries', function (Blueprint $t) {
            $t->id();
            $t->foreignId('pregnancy_id')->constrained()->cascadeOnDelete();
            $t->dateTime('delivered_at')->nullable();
            $t->string('mode')->nullable();   // SVD | C-section | assisted | breech
            $t->string('outcome')->nullable(); // live birth | stillbirth
            $t->char('baby_sex', 1)->nullable();
            $t->decimal('birth_weight', 5, 2)->nullable(); // kg
            $t->unsignedSmallInteger('apgar_1')->nullable();
            $t->unsignedSmallInteger('apgar_5')->nullable();
            $t->text('complications')->nullable();
            $t->text('notes')->nullable();
            $t->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deliveries');
        Schema::dropIfExists('partograph_entries');
        Schema::dropIfExists('anc_visits');
        Schema::dropIfExists('pregnancies');
    }
};
