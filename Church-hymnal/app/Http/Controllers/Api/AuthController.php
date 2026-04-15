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
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Storage;
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

    /*
    public function login(Request $request): JsonResponse
    {

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
        */
    public function login(Request $request): JsonResponse
    {
        $key = 'login:' . $request->ip();

        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key); //how many seconds until they can try again

            ActivityLogger::log(
                'login_throttled',
                "Login rate-limited from IP: {request->ip()}",
                null,
                $request->ip()
            );

            return response()->json([
                'message' => "Too many login attempts. Please try again in {$seconds} seconds."
            ], 429);
        }

        $credentials = $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($credentials)) {
            RateLimiter::hit($key, 60); //block for 60 seconds after 5 failed attempts
            return response()->json([
                'message' => 'Invalid credentials.'
            ], 401);
        }

        RateLimiter::clear($key); //clear failed attempts on successful login

        return response()->json([
            'message' => 'Login successful.',
            'token'   => $request->user()->createToken('auth_token')->plainTextToken,
        ], 200);
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
        try {
            Mail::to($user->email)->send(new ProfileUpdatedMail($user->fresh()));
        } catch (\Exception $e) {
            Log::error('ProfileUpdatedMail failed: ' . $e->getMessage());

        }

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

        try {
            Mail::to($user->email)->send(new PasswordChangedMail($user));
        } catch (\Exception $e) {
            Log::error('PasswordChangedMail failed: ' . $e->getMessage());
        }

        // Revoke all other tokens so old sessions are invalidated after a password change
        $currentTokenId = $request->user()->currentAccessToken()->id;
        $user->tokens()->where('id', '!=', $currentTokenId)->delete();

        ActivityLogger::log('password_change', 'User changed their password', $user->id);

        return response()->json([
            'message' => 'Password changed successfully.',
        ]);
    }

    /** POST /api/profile/avatar */
public function uploadAvatar(Request $request): JsonResponse
{
    $request->validate([
        'avatar' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
    ]);

    $user = $request->user();

    // Delete old avatar file if one exists
    if ($user->avatar) {
        Storage::disk('public')->delete($user->avatar);
    }

    $path = $request->file('avatar')->store('avatars', 'public');
    $user->update(['avatar' => $path]);

    ActivityLogger::log('avatar_upload', 'User updated their profile picture', $user->id);

    return response()->json([
        'message'    => 'Avatar updated successfully.',
        'avatar_url' => $user->fresh()->avatar_url,
        'user'       => $user->fresh(),
    ]);
}

/** DELETE /api/profile/avatar */
public function deleteAvatar(Request $request): JsonResponse
{
    $user = $request->user();

    if ($user->avatar) {
        Storage::disk('public')->delete($user->avatar);
        $user->update(['avatar' => null]);
    }

    ActivityLogger::log('avatar_remove', 'User removed their profile picture', $user->id);

    return response()->json([
        'message' => 'Profile picture removed.',
        'user'    => $user->fresh(),
    ]);
}
}
