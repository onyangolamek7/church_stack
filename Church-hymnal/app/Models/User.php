<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'diocese',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password'          => 'hashed',
        ];
    }

    protected static function booted()
    {
        static::creating(function ($user) {
            if (empty($user->role)) {
                $user->role = 'user';
            }
        });
    }

    public function favorites()
    {
        return $this->hasMany(Favorites::class);
    }

    public function favoriteHymns()
    {
        return $this->belongsToMany(Hymn::class, 'favorites');
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }
}
