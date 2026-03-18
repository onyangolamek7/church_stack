<?php

namespace App\Services;

use App\Models\TithePayment;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class MpesaService
{
    private string $consumerKey;
    private string $consumerSecret;
    private string $shortCode;
    private string $passKey;
    private string $callbackUrl;
    private string $environment;
    private string $baseUrl;

    public function __construct()
    {
        $this->consumerKey    = config('mpesa.consumer_key');
        $this->consumerSecret = config('mpesa.consumer_secret');
        $this->shortCode      = config('mpesa.shortcode');
        $this->passKey        = config('mpesa.passkey');
        $this->callbackUrl    = config('mpesa.callback_url');
        $this->environment    = config('mpesa.environment', 'sandbox');
        $this->baseUrl        = $this->environment === 'production'
            ? 'https://api.safaricom.co.ke'
            : 'https://sandbox.safaricom.co.ke';
    }

    // ─────────────────────── Auth ───────────────────────

    public function getAccessToken(): string
    {
        return Cache::remember('mpesa_access_token', 3500, function () {
            $response = Http::withBasicAuth($this->consumerKey, $this->consumerSecret)
                ->get("{$this->baseUrl}/oauth/v1/generate?grant_type=client_credentials");

            if ($response->failed()) {
                throw new \RuntimeException('Failed to obtain M-Pesa access token: ' . $response->body());
            }

            return $response->json('access_token');
        });
    }

    // ─────────────────────── STK Push ───────────────────────

    /**
     * Initiate STK push (Lipa Na M-Pesa Online)
     */
    public function stkPush(TithePayment $payment): array
    {
        $token     = $this->getAccessToken();
        $timestamp = now()->format('YmdHis');
        $password  = base64_encode($this->shortCode . $this->passKey . $timestamp);

        // Normalize phone: 07xxxxxxxx → 2547xxxxxxxx
        $phone = $this->normalizePhone($payment->mpesa_phone_number);

        $payload = [
            'BusinessShortCode' => $this->shortCode,
            'Password'          => $password,
            'Timestamp'         => $timestamp,
            'TransactionType'   => 'CustomerPayBillOnline',
            'Amount'            => (int) ceil($payment->amount), // M-Pesa requires integer
            'PartyA'            => $phone,
            'PartyB'            => $this->shortCode,
            'PhoneNumber'       => $phone,
            'CallBackURL'       => $this->callbackUrl . '/api/tithe/mpesa/callback',
            'AccountReference'  => $payment->reference,
            'TransactionDesc'   => 'Tithe Payment - ' . config('app.name'),
        ];

        $response = Http::withToken($token)
            ->post("{$this->baseUrl}/mpesa/stkpush/v1/processrequest", $payload);

        $data = $response->json();

        Log::info('MPesa STK Push Response', ['reference' => $payment->reference, 'response' => $data]);

        if ($response->failed() || ($data['ResponseCode'] ?? null) !== '0') {
            throw new \RuntimeException(
                'M-Pesa STK push failed: ' . ($data['errorMessage'] ?? $data['ResponseDescription'] ?? 'Unknown error')
            );
        }

        // Update payment with M-Pesa IDs
        $payment->update([
            'mpesa_checkout_request_id'  => $data['CheckoutRequestID'],
            'mpesa_merchant_request_id'  => $data['MerchantRequestID'],
            'status'                     => 'processing',
        ]);

        return $data;
    }

    // ─────────────────────── Callback Handler ───────────────────────

    public function handleCallback(array $callbackData): void
    {
        $body = $callbackData['Body']['stkCallback'] ?? null;

        if (!$body) {
            Log::error('MPesa callback: Invalid payload', $callbackData);
            return;
        }

        $checkoutRequestId = $body['CheckoutRequestID'];
        $resultCode        = $body['ResultCode'];

        $payment = TithePayment::where('mpesa_checkout_request_id', $checkoutRequestId)->first();

        if (!$payment) {
            Log::error('MPesa callback: Payment not found', ['CheckoutRequestID' => $checkoutRequestId]);
            return;
        }

        if ($resultCode === 0) {
            // Success — extract receipt
            $items = collect($body['CallbackMetadata']['Item'] ?? []);
            $receipt = $items->firstWhere('Name', 'MpesaReceiptNumber')['Value'] ?? null;

            $payment->markCompleted($receipt);
            Log::info('MPesa payment completed', ['reference' => $payment->reference, 'receipt' => $receipt]);
        } else {
            $payment->markFailed($body['ResultDesc'] ?? 'Payment failed');
            Log::warning('MPesa payment failed', ['reference' => $payment->reference, 'ResultDesc' => $body['ResultDesc']]);
        }
    }

    // ─────────────────────── STK Query ───────────────────────

    public function queryStkStatus(TithePayment $payment): array
    {
        $token     = $this->getAccessToken();
        $timestamp = now()->format('YmdHis');
        $password  = base64_encode($this->shortCode . $this->passKey . $timestamp);

        $response = Http::withToken($token)
            ->post("{$this->baseUrl}/mpesa/stkpushquery/v1/query", [
                'BusinessShortCode' => $this->shortCode,
                'Password'          => $password,
                'Timestamp'         => $timestamp,
                'CheckoutRequestID' => $payment->mpesa_checkout_request_id,
            ]);

        return $response->json();
    }

    // ─────────────────────── Helpers ───────────────────────

    private function normalizePhone(string $phone): string
    {
        $phone = preg_replace('/\D/', '', $phone);

        if (str_starts_with($phone, '0')) {
            $phone = '254' . substr($phone, 1);
        } elseif (str_starts_with($phone, '+')) {
            $phone = substr($phone, 1);
        } elseif (!str_starts_with($phone, '254')) {
            $phone = '254' . $phone;
        }

        return $phone;
    }
}
