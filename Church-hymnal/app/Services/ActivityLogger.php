<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class ActivityLogger
{
    public static function log(string $action, string $description, ?int $userId = null): void
    {
        ActivityLog::create([
            'user_id'     => $userId ?? Auth::id(),
            'action'      => $action,
            'description' => $description,
            'ip_address'  => Request::ip(),
        ]);
    }
}
