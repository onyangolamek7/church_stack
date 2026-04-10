<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\TithePayment;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class AdmindashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $totalRevenue = TithePayment::where('status', 'completed')->sum('amount');

        return response()->json([
            'total_users'   => User::count(),
            'total_tithes'  => TithePayment::count(),
            'total_revenue' => $totalRevenue,
            'active_today'  => User::whereDate('last_login_at', today())->count(),
        ]);
    }

    //All registered users.
    public function users(): JsonResponse
    {
        $users = User::orderByDesc('created_at')
            ->get(['id', 'name', 'email', 'diocese', 'role', 'created_at', 'last_login_at']);

        return response()->json($users);
    }


    public function tithes(): JsonResponse
    {
        $tithes = TithePayment::with('user:id,name,email')
            ->orderByDesc('created_at')
            ->get();

        return response()->json($tithes);
    }

    //Recent user activity log.
    public function activity(): JsonResponse
    {
        $logs = ActivityLog::with('user:id,name,email')
            ->orderByDesc('created_at')
            ->limit(200)
            ->get();

        return response()->json($logs);
    }
}
