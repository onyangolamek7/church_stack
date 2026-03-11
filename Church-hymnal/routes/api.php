<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\HymnController;
use App\Http\Controllers\FavoriteController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TitheController;
use App\Http\Controllers\SermonController;

//public users(no login) can only read hymns
Route::get('/hymns',[HymnController::class, 'index']);
Route::get('/hymns/{id}',[HymnController::class, 'show']);
Route::get('/search',[HymnController::class, 'search']); //search hymns
Route::get('/hymns/random', [HymnController::class, 'random']);

//Auth routes
Route::post('/register',[AuthController::class, 'register']);
Route::post('/login',[AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout',[AuthController::class, 'logout']);
    Route::get('/profile',[AuthController::class, 'profile']);
});

//Authenticated user routes, auth:sanctum ensures user is logged in
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/favorites/{hymnId}',[FavoriteController::class, 'store']);
    Route::delete('/favorites/{hymnId}',[FavoriteController::class, 'destroy']);
    Route::get('/favorites',[FavoriteController::class, 'index']);
    //Route::post('/favorites/{hymnId}',[FavoriteController::class, 'toggle']);
});

//Admin-only routes, auth:sanctum ensures admin is logged in
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::post('/hymns',[HymnController::class, 'store']);
    Route::put('/hymns/{id}',[HymnController::class, 'update']);
    Route::delete('/hymns/{id}',[HymnController::class, 'destroy']);
});

//Authenticated user + guest tithe route
Route::post('/tithes', [TitheController::class, 'store']);


//admin only
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/tithes', [TitheController::class, 'index']);
});

//Sermon routes
Route::prefix('sermons')->group(function () {
    Route::get('/', [SermonController::class, 'index']);
    Route::get('/upcoming', [SermonController::class, 'upcoming']);
    Route::get('/previous', [SermonController::class, 'previous']);
    Route::get('/next', [SermonController::class, 'next']);
    Route::get('/{sermon}', [SermonController::class, 'show']);

    //admin only
    Route::middleware(['auth:sanctum', 'admin'])->group(function () {
        Route::post('/', [SermonController::class, 'store']);
        Route::put('/{sermon}', [SermonController::class, 'update']);
        Route::delete('/{sermon}', [SermonController::class, 'destroy']);
    });

});
