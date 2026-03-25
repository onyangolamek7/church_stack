<?php

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Route;

Route::get('/test-email', function () {
    try {
        Mail::raw('SendGrid mail test successful!', function ($message) {
        $message->to('onyangolamek7@gmail.com')
                ->subject('Hymn App Email Test');
    });

    return 'Email Sent Successfully';
    } catch (\Exception $e) {
        Log::error('SendGrid Email Error: ' . $e->getMessage());
        return 'Email failed: ' . $e->getMessage();
    }
});
