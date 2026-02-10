<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Sermon extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'preacher',
        'description',
        'service_date',
        'content',
        'audio_url',
        'video_url',
        'status',
    ];

    protected $casts = [
        'service_date' => 'datetime',
    ];

    public function scopeUpcoming($query)
    {
        return $query->where('service_date', '>=', now())->where('status', 'upcoming');
    }

    public function scopePrevious($query)
    {
        return $query->where('service_date', '<', now())->where('status', 'completed');
    }

    
}
