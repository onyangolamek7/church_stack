<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\HymnController;
use App\Http\Controllers\FavoriteController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

//public users(no login) can read hymns
Route::get('/hymns',[HymnController::class, 'index']);
Route::get('/hymns/{id}',[HymnController::class, 'show']);
Route::get('/search',[HymnController::class, 'search']); //search hymns

//Auth routes
Route::post('/register',[AuthController::class, 'register']);
Route::post('/login',[AuthController::class, 'login']);
Route::post('/logout',[AuthController::class, 'logout'])->middleware('auth:sanctum');

//Authenticated user routes, auth:sanctum ensures user is logged in
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/favorites/{hymns}',[FavoriteController::class, 'store']);
    Route::delete('/favorites/{hymns}',[FavoriteController::class, 'destroy']);
    Route::get('/favorites',[FavoriteController::class, 'index']);
});

//Admin-only routes, auth:sanctum ensures admin is logged in
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::post('/hymns',[HymnController::class, 'store']);
    Route::put('/hymns/{id}',[HymnController::class, 'update']);
    Route::delete('/hymns/{id}',[HymnController::class, 'destroy']);
});