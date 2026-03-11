<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tithe;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;

class TitheController extends Controller
{
    public function index() {
        return Tithe::all();
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        if ($user) {
            //Authenticated user validation
            $validated = $request->validate([
                'giver_phone' => 'required|string|max:20',
                'amount' => 'required|numeric|min:1',
            ]);

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

        } else {
            //Guest validation
            $validated = $request->validate([
                'giver_name' => 'required|string',
                'giver_phone' => 'required|string|max:20',
                'amount' => 'required|numeric|min:1',
            ]);

            $tithe = Tithe::create([
                'giver_name' => $validated['giver_name'],
                'giver_phone' => $validated['giver_phoen'],
                'amount' => $validated['amount'],
                'status' => 'pending'
            ]);
        }

            return response()->json([
                'message' => 'Tithe submitted successfully',
                'tithe' => $tithe
            ], 201);
    }
}
