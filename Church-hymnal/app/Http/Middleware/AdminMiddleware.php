<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user()) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Forbidden. Admin access required.',
            ], 403);
        }

        return $next($request);
    }
}

/*namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class Admin
{
    public function handle(Request $request, Closure $next)
    {
        if (!Auth::check() || !Auth::user()->isAdmin()) {
            return response()->json(['error' => 'Access denied'], 403);
        }

        return $next($request);
    }
}
*/
