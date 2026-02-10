<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tithes', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->nullable()->constrained()->nullonDelete(); //links to user

            $table->string('giver_name');
            $table->string('giver_email')->nullable();
            $table->string('giver_phone')->nullable();

            $table->decimal('amount', 10, 2);
            $table->string('currency')->default('KES');

            $table->string('payment_method')->nullable();
            $table->string('transaction_reference')->unique();

            $table->enum('status', ['pending', 'completed', 'failed'])->default('pending');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tithes');
    }
};
