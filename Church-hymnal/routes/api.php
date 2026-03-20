<?php

use App\Http\Controllers\AdmindashboardController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\HymnController;
use App\Http\Controllers\Api\TitheController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\MpesaController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SermonController;
use Illuminate\Support\Facades\DB;

//public users(no login) can only read hymns
Route::get('/hymns', [HymnController::class, 'index']);
Route::get('/hymns/{id}', [HymnController::class, 'show']);
Route::get('/search', [HymnController::class, 'search']); //search hymns
Route::get('/hymns/random', [HymnController::class, 'random']);

//Auth routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

//Profile routes (authenticated)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile', [AuthController::class, 'updateprofile']);
    Route::post('/change-password', [AuthController::class, 'changepassword']);
    Route::post('/changepassword', [AuthController::class, 'changepassword']);
});

//Authenticated user routes, auth:sanctum ensures user is logged in
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/favorites/{hymnId}',[FavoriteController::class, 'store']);
    Route::delete('/favorites/{hymnId}',[FavoriteController::class, 'destroy']);
    Route::get('/favorites',[FavoriteController::class, 'index']);

    Route::prefix('tithe')->name('tithe.')->group(function () {
        Route::get('history', [TitheController::class, 'history'])->name('history');
    });
});

//Admin-only routes
Route::middleware(['auth:sanctum','admin'])->prefix('admin')->group(function () {
    // Dashboard stats & data
        Route::get('/stats',    [AdmindashboardController::class, 'stats']);
        Route::get('/users',    [AdminDashboardController::class, 'users']);
        Route::get('/tithes',   [AdminDashboardController::class, 'tithes']);
        Route::get('/activity', [AdminDashboardController::class, 'activity']);

        // Hymn management
        Route::post('/hymns',        [HymnController::class, 'store']);
        Route::put('/hymns/{id}',    [HymnController::class, 'update']);
        Route::delete('/hymns/{id}', [HymnController::class, 'destroy']);

        // Sermon management
        Route::post('/sermons',          [SermonController::class, 'store']);
        Route::put('/sermons/{sermon}',  [SermonController::class, 'update']);
        Route::delete('/sermons/{sermon}',[SermonController::class, 'destroy']);
});

//Mpesa/tithe routes
Route::post('/mpesa/stk-push', [MpesaController::class, 'stkPush']);
Route::post('/mpesa/callback', [MpesaController::class, 'callback']);

Route::prefix('tithe')->name('tithe.')->group(function () {
    // Safaricom callback
    Route::post('mpesa/callback', [TitheController::class, 'mpesaCallback'])
        ->name('mpesa.callback');

    // Payment verification by reference
    Route::get('verify/{reference}', [TitheController::class, 'verify'])
        ->name('verify');

    // Status polling
    Route::get('mpesa/status/{reference}', [TitheController::class, 'mpesaStatus'])
        ->name('mpesa.status');
});

//Payment initiation (rate-limited, auth optional)
Route::prefix('tithe')->name('tithe.')->middleware(['throttle:10,1'])->group(function () {
    Route::post('mpesa/initiate', [TitheController::class, 'initiateMpesa'])
        ->name('mpesa.initiate');
});

//Sermon routes
Route::prefix('sermons')->group(function () {
    Route::get('/', [SermonController::class, 'index']);
    Route::get('/upcoming', [SermonController::class, 'upcoming']);
    Route::get('/previous', [SermonController::class, 'previous']);
    Route::get('/next', [SermonController::class, 'next']);
    Route::get('/{sermon}', [SermonController::class, 'show']);
});

Route::get('/db-test', function () {
    try {
        DB::connection()->getPdo();
        $tables = DB::select('SHOW TABLES');
        return response()->json([
            'status' => 'connected',
            'database' => DB::connection()->getDatabaseName(),
            'host' => config('database.connections.mysql.host'),
            'port' => config('database.connections.mysql.port'),
            'tables' => $tables,
        ]);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()]);
    }
});

Route::get('/db-check', function () {
    return response()->json([
        'hymns' => DB::table('hymns')->count(),
        'sermons' => DB::table('sermons')->count(),
        'users' => DB::table('users')->count(),
    ]);
});
