<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lab_tests', function (Blueprint $t) {
            $t->id();
            $t->string('code')->unique();
            $t->string('name');
            $t->string('specimen')->nullable();
            $t->string('unit')->nullable();
            $t->decimal('ref_low', 10, 2)->nullable();
            $t->decimal('ref_high', 10, 2)->nullable();
            $t->integer('price')->default(0); // FCFA
            $t->boolean('is_active')->default(true);
            $t->integer('sort_order')->default(0);
            $t->timestamps();
        });

        Schema::create('lab_orders', function (Blueprint $t) {
            $t->id();
            $t->string('reference')->nullable()->unique(); // SSMF-LAB-YYYY-#####
            $t->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $t->foreignId('encounter_id')->nullable()->constrained()->nullOnDelete();
            $t->foreignId('consultation_id')->nullable()->constrained()->nullOnDelete();
            $t->foreignId('ordered_by')->nullable()->constrained('users')->nullOnDelete();
            $t->string('status')->default('ordered'); // ordered|resulted|validated|cancelled
            $t->text('notes')->nullable();
            $t->timestamps();
        });

        Schema::create('lab_order_items', function (Blueprint $t) {
            $t->id();
            $t->foreignId('lab_order_id')->constrained()->cascadeOnDelete();
            $t->foreignId('lab_test_id')->nullable()->constrained()->nullOnDelete();
            $t->string('name');
            $t->string('unit')->nullable();
            $t->decimal('ref_low', 10, 2)->nullable();
            $t->decimal('ref_high', 10, 2)->nullable();
            $t->string('value')->nullable();
            $t->string('flag')->nullable(); // low|normal|high
            $t->timestamp('resulted_at')->nullable();
            $t->timestamps();
        });

        Schema::create('stock_batches', function (Blueprint $t) {
            $t->id();
            $t->foreignId('drug_id')->constrained()->cascadeOnDelete();
            $t->string('batch_no')->nullable();
            $t->integer('quantity')->default(0);
            $t->date('expiry_date')->nullable();
            $t->timestamps();
        });

        Schema::create('dispenses', function (Blueprint $t) {
            $t->id();
            $t->foreignId('prescription_id')->constrained()->cascadeOnDelete();
            $t->foreignId('dispensed_by')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamp('dispensed_at')->nullable();
            $t->text('note')->nullable();
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dispenses');
        Schema::dropIfExists('stock_batches');
        Schema::dropIfExists('lab_order_items');
        Schema::dropIfExists('lab_orders');
        Schema::dropIfExists('lab_tests');
    }
};
