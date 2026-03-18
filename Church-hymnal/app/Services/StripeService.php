<?php

namespace App\Services;

use App\Models\TithePayment;
use Illuminate\Support\Facades\Log;
use Stripe\StripeClient;
use Stripe\Webhook;
use Stripe\PaymentIntent;
use Stripe\Exception\ApiErrorException;
use Stripe\Exception\SignatureVerificationException;

class StripeService
{
    private StripeClient $stripe;
    private string $webhookSecret;

    public function __construct()
    {
        $this->stripe         = new StripeClient(config('services.stripe.secret'));
        $this->webhookSecret  = config('services.stripe.webhook_secret');
    }

    // ─────────────────────── Payment Intent ───────────────────────

    /**
     * Create a Stripe PaymentIntent and update the payment record.
     * Returns the client_secret for the frontend to confirm payment.
     */
    public function createPaymentIntent(TithePayment $payment): string
    {
        try {
            $amountInCents = (int) round($payment->amount * 100);

            $metadata = [
                'tithe_reference'  => $payment->reference,
                'payment_id'       => (string) $payment->id,
                'payer_name'       => $payment->payer_display_name,
                'app'              => config('app.name'),
            ];

            if ($payment->user_id) {
                $metadata['user_id'] = (string) $payment->user_id;
            }

            $intentData = [
                'amount'               => $amountInCents,
                'currency'             => strtolower($payment->currency ?? 'usd'),
                'metadata'             => $metadata,
                'description'          => 'Tithe Payment - ' . config('app.name'),
                'automatic_payment_methods' => ['enabled' => true],
            ];

            // Attach customer email if available
            if ($payment->payer_email) {
                $intentData['receipt_email'] = $payment->payer_email;
            }

            // If authenticated user, try to attach/create Stripe customer
            if ($payment->user) {
                $customerId = $this->getOrCreateCustomer($payment);
                if ($customerId) {
                    $intentData['customer'] = $customerId;
                }
            }

            $intent = $this->stripe->paymentIntents->create($intentData);

            $payment->update([
                'stripe_payment_intent_id' => $intent->id,
                'stripe_client_secret'     => $intent->client_secret,
                'status'                   => 'processing',
            ]);

            Log::info('Stripe PaymentIntent created', [
                'reference' => $payment->reference,
                'intent_id' => $intent->id,
            ]);

            return $intent->client_secret;

        } catch (ApiErrorException $e) {
            Log::error('Stripe PaymentIntent creation failed', [
                'reference' => $payment->reference,
                'error'     => $e->getMessage(),
            ]);
            throw new \RuntimeException('Failed to create Stripe payment: ' . $e->getMessage());
        }
    }

    // ─────────────────────── Webhook ───────────────────────

    /**
     * Handle incoming Stripe webhook events.
     */
    public function handleWebhook(string $payload, string $sigHeader): void
    {
        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $this->webhookSecret);
        } catch (SignatureVerificationException $e) {
            throw new \RuntimeException('Invalid Stripe webhook signature');
        }

        match ($event->type) {
            'payment_intent.succeeded'              => $this->handlePaymentSucceeded($event->data->object),
            'payment_intent.payment_failed'         => $this->handlePaymentFailed($event->data->object),
            'payment_intent.canceled'               => $this->handlePaymentCancelled($event->data->object),
            default                                  => null,
        };
    }

    // ─────────────────────── Webhook Handlers ───────────────────────

    private function handlePaymentSucceeded(PaymentIntent $intent): void
    {
        $payment = TithePayment::where('stripe_payment_intent_id', $intent->id)->first();

        if (!$payment) {
            Log::error('Stripe webhook: Payment not found', ['intent_id' => $intent->id]);
            return;
        }

        $chargeId = $intent->latest_charge ?? null;

        $payment->update([
            'status'           => 'completed',
            'stripe_charge_id' => $chargeId,
            'paid_at'          => now(),
        ]);

        Log::info('Stripe payment completed', ['reference' => $payment->reference]);
    }

    private function handlePaymentFailed(PaymentIntent $intent): void
    {
        $payment = TithePayment::where('stripe_payment_intent_id', $intent->id)->first();

        if ($payment) {
            $reason = $intent->last_payment_error?->message ?? 'Payment failed';
            $payment->markFailed($reason);
            Log::warning('Stripe payment failed', ['reference' => $payment->reference, 'reason' => $reason]);
        }
    }

    private function handlePaymentCancelled(PaymentIntent $intent): void
    {
        $payment = TithePayment::where('stripe_payment_intent_id', $intent->id)->first();

        if ($payment) {
            $payment->update(['status' => 'cancelled']);
        }
    }

    // ─────────────────────── Customer Management ───────────────────────

    private function getOrCreateCustomer(TithePayment $payment): ?string
    {
        $user = $payment->user;

        // Check if user already has a Stripe customer ID stored
        if (!empty($user->stripe_customer_id)) {
            return $user->stripe_customer_id;
        }

        try {
            $customer = $this->stripe->customers->create([
                'email'    => $user->email,
                'name'     => $user->name,
                'metadata' => ['user_id' => (string) $user->id],
            ]);

            // Persist for future payments
            $user->update(['stripe_customer_id' => $customer->id]);

            return $customer->id;
        } catch (ApiErrorException $e) {
            Log::warning('Could not create Stripe customer', ['user_id' => $user->id, 'error' => $e->getMessage()]);
            return null;
        }
    }

    //Payment Status
    public function retrievePaymentIntent(string $intentId): PaymentIntent
    {
        return $this->stripe->paymentIntents->retrieve($intentId);
    }
}
