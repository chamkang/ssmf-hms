<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // A fertility case ties a couple together and groups their ART cycles.
        Schema::create('fertility_cases', function (Blueprint $t) {
            $t->id();
            $t->string('reference')->nullable()->unique(); // SSMF-ART-#####
            $t->foreignId('female_patient_id')->constrained('patients')->cascadeOnDelete();
            $t->foreignId('male_patient_id')->nullable()->constrained('patients')->nullOnDelete();
            $t->string('referral_reason')->nullable();
            $t->string('diagnosis')->nullable(); // tubal factor | male factor | PCOS | endometriosis | unexplained | ...
            $t->string('status')->default('open'); // open | active | closed
            $t->date('opened_on')->nullable();
            $t->text('notes')->nullable();
            $t->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamps();
            $t->softDeletes();
        });

        // One treatment cycle within a case.
        Schema::create('art_cycles', function (Blueprint $t) {
            $t->id();
            $t->string('reference')->nullable()->unique(); // SSMF-CYC-YYYY-#####
            $t->foreignId('fertility_case_id')->constrained()->cascadeOnDelete();
            $t->string('type')->default('IVF');  // IVF | ICSI | IUI | FET | OI
            $t->string('protocol')->nullable();  // antagonist | long agonist | natural | ...
            $t->string('status')->default('planned'); // planned | stimulating | triggered | retrieved | transferred | completed | cancelled
            $t->date('started_on')->nullable();
            $t->date('trigger_on')->nullable();
            $t->text('notes')->nullable();
            $t->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamps();
        });

        // Serial monitoring visits: follicometry + hormone panel.
        Schema::create('cycle_monitorings', function (Blueprint $t) {
            $t->id();
            $t->foreignId('art_cycle_id')->constrained()->cascadeOnDelete();
            $t->date('monitored_on');
            $t->decimal('endo_mm', 5, 1)->nullable();        // endometrial thickness
            $t->json('right_follicles')->nullable();         // [12, 14, 16] mm
            $t->json('left_follicles')->nullable();
            $t->decimal('e2', 8, 2)->nullable();             // estradiol pg/mL
            $t->decimal('lh', 8, 2)->nullable();
            $t->decimal('fsh', 8, 2)->nullable();
            $t->decimal('p4', 8, 2)->nullable();             // progesterone ng/mL
            $t->string('note')->nullable();
            $t->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamps();
        });

        // Embryology lab record + cycle outcome (one per cycle).
        Schema::create('embryology_records', function (Blueprint $t) {
            $t->id();
            $t->foreignId('art_cycle_id')->unique()->constrained()->cascadeOnDelete();
            $t->date('retrieval_date')->nullable();
            $t->integer('oocytes_retrieved')->nullable();
            $t->integer('mature_mii')->nullable();
            $t->string('fertilization_method')->nullable(); // IVF | ICSI
            $t->integer('fertilized_2pn')->nullable();
            $t->integer('cleavage_day3')->nullable();
            $t->integer('blastocysts')->nullable();
            $t->date('transfer_date')->nullable();
            $t->integer('embryos_transferred')->nullable();
            $t->integer('embryos_frozen')->nullable();
            $t->string('embryo_grade')->nullable();          // e.g. 4AA
            $t->decimal('beta_hcg', 8, 2)->nullable();
            $t->date('beta_hcg_date')->nullable();
            $t->boolean('clinical_pregnancy')->nullable();
            $t->string('outcome')->nullable();               // ongoing | biochemical | miscarriage | live birth | negative
            $t->text('notes')->nullable();
            $t->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('embryology_records');
        Schema::dropIfExists('cycle_monitorings');
        Schema::dropIfExists('art_cycles');
        Schema::dropIfExists('fertility_cases');
    }
};
