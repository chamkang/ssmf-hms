<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tariffs', function (Blueprint $t) {
            $t->id();
            $t->string('code')->unique();
            $t->string('label');
            $t->integer('amount')->default(0); // FCFA (XAF has no minor unit)
            $t->boolean('is_active')->default(true);
            $t->integer('sort_order')->default(0);
            $t->timestamps();
        });

        Schema::create('invoices', function (Blueprint $t) {
            $t->id();
            $t->string('reference')->nullable()->unique(); // SSMF-INV-YYYY-#####
            $t->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $t->foreignId('encounter_id')->nullable()->constrained()->nullOnDelete();
            $t->string('status')->default('open'); // open|part_paid|paid|void
            $t->string('currency', 8)->default('XAF');
            $t->text('notes')->nullable();
            $t->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamps();
            $t->softDeletes();
        });

        Schema::create('invoice_items', function (Blueprint $t) {
            $t->id();
            $t->foreignId('invoice_id')->constrained()->cascadeOnDelete();
            $t->string('label');
            $t->integer('qty')->default(1);
            $t->integer('unit_price')->default(0);
            $t->integer('amount')->default(0);
            $t->string('source_type')->nullable(); // consultation|lab|pharmacy|tariff|manual
            $t->unsignedBigInteger('source_id')->nullable();
            $t->timestamps();
        });

        Schema::create('payments', function (Blueprint $t) {
            $t->id();
            $t->foreignId('invoice_id')->constrained()->cascadeOnDelete();
            $t->string('method'); // cash|momo
            $t->string('provider')->nullable(); // fapshi|null
            $t->string('reference')->nullable(); // MoMo txn ref
            $t->integer('amount');
            $t->integer('tendered')->nullable();   // cash given
            $t->integer('change_due')->nullable(); // cash change
            $t->foreignId('received_by')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamp('received_at')->nullable();
            $t->json('raw')->nullable();
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
        Schema::dropIfExists('invoice_items');
        Schema::dropIfExists('invoices');
        Schema::dropIfExists('tariffs');
    }
};
