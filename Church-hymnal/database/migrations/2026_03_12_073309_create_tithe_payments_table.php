<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tithe_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();

            // Payer details (for non-auth users or record keeping)
            $table->string('payer_name')->nullable();
            $table->string('payer_email')->nullable();
            $table->string('payer_phone')->nullable();

            // Payment details
            $table->decimal('amount', 12, 2);
            $table->string('currency', 10)->default('KES');
            $table->enum('payment_method', ['mpesa', 'stripe']);
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'cancelled'])->default('pending');

            // MPesa specific
            $table->string('mpesa_checkout_request_id')->nullable()->unique();
            $table->string('mpesa_merchant_request_id')->nullable();
            $table->string('mpesa_transaction_code')->nullable(); // M-Pesa receipt number
            $table->string('mpesa_phone_number')->nullable();

            // Stripe specific
            $table->string('stripe_payment_intent_id')->nullable()->unique();
            $table->string('stripe_client_secret')->nullable();
            $table->string('stripe_charge_id')->nullable();

            // Common
            $table->string('reference')->unique(); // Internal reference
            $table->text('failure_reason')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['payment_method', 'status']);
            $table->index('reference');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tithe_payments');
    }
};
