<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\InitiateMpesaTitheRequest;
use App\Models\TithePayment;
use App\Services\MpesaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TitheController extends Controller
{
    public function __construct(
        private readonly MpesaService $mpesa,
    ) {}

    //POST /api/tithe/mpesa/initiate
    public function initiateMpesa(InitiateMpesaTitheRequest $request): JsonResponse
    {
        $user = auth('sanctum')->user(); // null for guests

        $payment = TithePayment::create([
            'user_id'            => $user?->id,
            'payer_name'         => $user ? $user->name  : $request->full_name,
            'payer_email'        => $user ? $user->email : $request->email,
            'payer_phone'        => $request->phone,
            'mpesa_phone_number' => $request->phone,
            'amount'             => $request->amount,
            'currency'           => 'KES',
            'payment_method'     => 'mpesa',
            'status'             => 'pending',
            'reference'          => TithePayment::generateReference(),
        ]);

        try {
            $this->mpesa->stkPush($payment);

            return response()->json([
                'success'    => true,
                'message'    => 'STK push sent. Please check your phone and enter your M-Pesa PIN.',
                'reference'  => $payment->reference,
                'payment_id' => $payment->id,
            ]);

        } catch (\Throwable $e) {
            $payment->markFailed($e->getMessage());
            Log::error('MPesa STK push error', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to initiate M-Pesa payment. Please try again.',
            ], 422);
        }
    }

    /**
     * POST /api/tithe/mpesa/callback
     * Called by Safaricom — no auth middleware.
     */
    public function mpesaCallback(Request $request): JsonResponse
    {
        try {
            $this->mpesa->handleCallback($request->all());
        } catch (\Throwable $e) {
            Log::error('MPesa callback error', ['error' => $e->getMessage()]);
        }

        // Always return 200 to Safaricom
        return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
    }

    /**
     * GET /api/tithe/mpesa/status/{reference}
     * Polled by the frontend while waiting for the callback.
     */
    public function mpesaStatus(string $reference): JsonResponse
    {
        $payment = TithePayment::where('reference', $reference)
            ->where('payment_method', 'mpesa')
            ->firstOrFail();

        // Query Safaricom directly if still processing
        if ($payment->status === 'processing') {
            try {
                $result = $this->mpesa->queryStkStatus($payment);
                if (($result['ResultCode'] ?? null) === 0) {
                    $payment->markCompleted();
                }
            } catch (\Throwable) {
                // Silently ignore — rely on callback
            }
        }

        return response()->json([
            'status'    => $payment->status,
            'reference' => $payment->reference,
            'paid_at'   => $payment->paid_at?->toISOString(),
            'receipt'   => $payment->mpesa_transaction_code,
        ]);
    }

    //Authenticated users only.
    public function history(Request $request): JsonResponse
    {
        $payments = TithePayment::forUser($request->user()->id)
            ->latest()
            ->paginate(15);

        return response()->json($payments);
    }

    public function verify(string $reference): JsonResponse
    {
        $payment = TithePayment::where('reference', $reference)->firstOrFail();

        return response()->json([
            'reference'      => $payment->reference,
            'status'         => $payment->status,
            'amount'         => $payment->amount,
            'currency'       => $payment->currency,
            'payment_method' => $payment->payment_method,
            'paid_at'        => $payment->paid_at?->toISOString(),
            'payer_name'     => $payment->payer_display_name,
        ]);
    }
}
