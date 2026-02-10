<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tithe extends Model
{
    protected $fillable = [
        'user_id',
        'giver_name',
        'giver_email',
        'giver_phone',
        'amount',
        'currency',
        'payment_method',
        'transaction_reference',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
