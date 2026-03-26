<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\PasswordChangedMail;
use App\Mail\ProfileUpdatedMail;
use App\Mail\WelcomeMail;
use Illuminate\Http\Request;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /** POST /api/auth/register */
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'                  => 'required|string|max:255',
            'email'                 => 'required|email|unique:users',
            'diocese'               => 'required|string|max:255',
            'password'              => 'required|min:6|confirmed',
            'password_confirmation' => 'required',
        ]);

        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'diocese'  => $data['diocese'],
            'password' => Hash::make($data['password']),
            'role'     => 'user',
        ]);

        try {
            Mail::to($user->email)->send(new WelcomeMail($user));
        } catch (\Exception $e) {
            Log::error('Mail failed: ' . $e->getMessage());
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        ActivityLogger::log('register', "New user registered: {$user->email}", $user->id);

        return response()->json([
            'message' => 'Account created successfully.',
            'user'    => $user,
            'token'   => $token,
        ], 201);
    }

    /** POST /api/auth/login */
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user->update(['last_login_at' => now()]);

        $token = $user->createToken('auth_token')->plainTextToken;

        ActivityLogger::log('login', "User logged in from IP: {$request->ip()}", $user->id);

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ]);
    }

    /** POST /api/auth/logout */
    public function logout(Request $request): JsonResponse
    {
        ActivityLogger::log('logout', 'User logged out', $request->user()->id);
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    /** GET /api/auth/me */
    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }

    /** GET /api/profile */
    public function profile(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }

    /** PUT /api/profile */
    public function updateprofile(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'name'    => 'sometimes|required|string|max:255',
            'email'   => "sometimes|required|email|unique:users,email,{$user->id}",
            'diocese' => 'sometimes|required|string|max:255',
        ]);

        $user->update($data);

        Mail::to($user->email)->send(new ProfileUpdatedMail($user->fresh()));

        ActivityLogger::log('profile_update', 'User updated their profile', $user->id);

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user'    => $user->fresh(),
        ]);
    }

    public function changepassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password'      => 'required',
            'password'              => 'required|min:6|confirmed',
            'password_confirmation' => 'required',
        ]);

        $user = $request->user();

        //Verify current password before allowing the change.
        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        Mail::to($user->email)->send(new PasswordChangedMail($user));

        // Revoke all other tokens so old sessions are invalidated after a password change — keeps security tight.
        $currentTokenId = $request->user()->currentAccessToken()->id;
        $user->tokens()->where('id', '!=', $currentTokenId)->delete();

        ActivityLogger::log('password_change', 'User changed their password', $user->id);

        return response()->json([
            'message' => 'Password changed successfully.',
        ]);
    }
}
