<?php

use App\Http\Controllers\AdmindashboardController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\HymnController;
use App\Http\Controllers\Api\TitheController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\MpesaController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SermonController;
use Illuminate\Support\Facades\Mail;

Route::get('/mail-test', function () {
    try {
        Mail::raw('Test from Railway', function ($m) {
            $m->to('lamekomondi3@gmail.com')
              ->subject('Railway Mail Test');
        });
        return response()->json(['status' => 'Mail sent successfully']);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'Failed',
            'error'  => $e->getMessage(),
            'trace'  => $e->getTraceAsString()
        ]);
    }
});

//public users(no login) can only read hymns
Route::get('/hymns/random', [HymnController::class, 'random']);
Route::get('/hymns/{id}', [HymnController::class, 'show']);
Route::get('/hymns', [HymnController::class, 'index']);
Route::get('/search', [HymnController::class, 'search']); //search hymns

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
    Route::post('/profile/avatar', [AuthController::class, 'uploadAvatar']);
    Route::delete('/profile/avatar', [AuthController::class, 'deleteAvatar']);
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
        Route::get('/users',    [AdmindashboardController::class, 'users']);
        Route::get('/tithes',   [AdmindashboardController::class, 'tithes']);
        Route::get('/activity', [AdmindashboardController::class, 'activity']);

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

