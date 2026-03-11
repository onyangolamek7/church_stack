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

    public function hymns()
    {
        return $this->belongsToMany(Hymn::class, 'sermon_hymn')
                    ->withPivot('order')
                    ->orderByPivot('order');
    }

    public function scopeUpcoming($query)
    {
        return $query->where('status', 'upcoming')
                     ->where('service_date', '>=', now());
    }

    public function scopePrevious($query)
    {
        return $query->where('status', 'completed')
        ->orWhere(function ($q) {
            $q->where('status', 'upcoming')
            ->where('service_date', '<', now());
        });
    }

    public static function autoTransitionPastSermons(): int
    {
        return static::where('status', 'upcoming')
        ->where('service_date', '<', now())
        ->update(['status' => 'completed']);
    }
}
