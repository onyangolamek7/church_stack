<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tithe;
use Illuminate\Support\Str;

class TitheController extends Controller
{
    public function store(Request $request)
    {
        $isAuthenticated = auth()->check();
        $user = auth()->user();

        $rules = [
            'giver_email' => 'nullable|email|max:255',
            'giver_phone' => 'nullable|string|max:20',
            'amount' => 'required|numeric|min:1',
            'payment_method' => 'nullable|string|max:100',
        ];

        if (!$isAuthenticated) {
            $rules['giver_name'] = 'required|string|max:255';
        }

        $validated = $request->validate($rules);

        $tithe = Tithe::create([
            'user_id' => $user?->id,
            'giver_name' => $user?->name ?? $validated['giver_name'],
            'giver_email' => $user?->email ?? $validated['giver_email'] ?? null,
            'giver_phone' => $validated['giver_phone'] ?? null,
            'amount' => $validated['amount'],
            'payment_method' => $validated['payment_method'],
            'transaction_reference' => (string) Str::uuid(),
            'status' => 'pending',
        ]);
            
            return response()->json([
                'message' => 'Tithe recorded successfully',
                'tithe' => $tithe
            ], 201);
    }

    
}
    