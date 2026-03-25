<?php
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Route;

Route::get('/test-email', function () {
    Mail::raw('SendGrid mail test successful!', function ($message) {
        $message->to('onyangolamek7@gmail.com')
                ->subject('Hymn App Email Test');
    });

    return 'Email Sent Successfully';
});
