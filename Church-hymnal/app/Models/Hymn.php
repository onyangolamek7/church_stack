<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Hymn extends Model
{
    use HasFactory;

    protected $table = 'hymns';
    public $timestamps = 'false';
    protected $fillable = ['id','hymn_number', 'title', 'lyrics'];

    public function favoritedBy()
    {
        return $this->belongsToMany(User::class, 'favorites');
    }

}
