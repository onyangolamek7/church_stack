<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MpesaController extends Controller
{
    private $consumerKey;
    private $consumerSecret;
    private $shortcode;
    private $passkey;
    private $callbackUrl;
    private $baseUrl = 'https://sandbox.safaricom.co.ke'; // ✅ sandbox URL

    public function __construct()
    {
        $this->consumerKey    = env('MPESA_CONSUMER_KEY');
        $this->consumerSecret = env('MPESA_CONSUMER_SECRET');
        $this->shortcode      = env('MPESA_SHORTCODE');
        $this->passkey        = env('MPESA_PASSKEY');
        $this->callbackUrl    = env('MPESA_CALLBACK_URL');
    }

    // STEP 1: Get Access Token
    private function getAccessToken()
    {
        $response = Http::withBasicAuth($this->consumerKey, $this->consumerSecret)
            ->get("{$this->baseUrl}/oauth/v1/generate?grant_type=client_credentials");

        return $response->json()['access_token'];
    }

    // =====================
    // STEP 2: STK Push (Send Payment Prompt)
    // =====================
    public function stkPush(Request $request)
    {
        $phone  = $request->phone;   // e.g. 254712345678
        $amount = $request->amount;  // e.g. 10

        $timestamp = now()->format('YmdHis');
        $password  = base64_encode($this->shortcode . $this->passkey . $timestamp);

        $accessToken = $this->getAccessToken();

        $response = Http::withToken($accessToken)
            ->post("{$this->baseUrl}/mpesa/stkpush/v1/processrequest", [
                'BusinessShortCode' => $this->shortcode,
                'Password'          => $password,
                'Timestamp'         => $timestamp,
                'TransactionType'   => 'CustomerPayBillOnline',
                'Amount'            => $amount,
                'PartyA'            => $phone,
                'PartyB'            => $this->shortcode,
                'PhoneNumber'       => $phone,
                'CallBackURL'       => $this->callbackUrl,
                'AccountReference'  => 'HymnApp',
                'TransactionDesc'   => 'Hymn Payment',
            ]);

        return response()->json($response->json());
    }

    // =====================
    // STEP 3: Handle Callback from M-Pesa
    // =====================
    public function callback(Request $request)
    {
        $data = $request->all();

        // Log everything M-Pesa sends
        Log::info('M-Pesa Callback:', $data);

        if (empty($data['Body']['stkCallback'])) {
            return response()->json(['ResultCode' => 1, 'ResultDesc' => 'Invalid request']);
        }

        $resultCode = $data['Body']['stkCallback']['ResultCode'];

        if ($resultCode == 0) {
            // ✅ Payment successful
            $items       = $data['Body']['stkCallback']['CallbackMetadata']['Item'];
            $amount      = $items[0]['Value'];
            $receiptNo   = $items[1]['Value'];
            $phoneNumber = $items[4]['Value'];

            Log::info("Payment successful: Receipt $receiptNo, Amount $amount, Phone $phoneNumber");

            // TODO: Save to database here

        } else {
            // ❌ Payment failed
            Log::info('Payment failed. ResultCode: ' . $resultCode);
        }

        return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Success']);
    }
}
