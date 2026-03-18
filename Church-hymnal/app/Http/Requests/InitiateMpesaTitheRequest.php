<?php

// ═══════════════════════════════════════════════
// InitiateMpesaTitheRequest.php
// ═══════════════════════════════════════════════

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InitiateMpesaTitheRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Both auth and non-auth users allowed
    }

    public function rules(): array
    {
        $rules = [
            'amount' => ['required', 'numeric', 'min:1', 'max:999999'],
            'phone'  => ['required', 'string', 'regex:/^(?:\+?254|0)[17]\d{8}$/'],
        ];

        // Non-authenticated users must also provide their name
        if (!auth('sanctum')->user()) {
            $rules['full_name'] = ['required', 'string', 'min:3', 'max:100'];
            $rules['email']     = ['nullable', 'email', 'max:191'];
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'phone.regex'    => 'Please enter a valid Kenyan phone number (e.g. 0712345678 or +254712345678).',
            'amount.min'     => 'The minimum tithe amount is KES 1.',
            'full_name.required' => 'Please provide your full name.',
        ];
    }
}
