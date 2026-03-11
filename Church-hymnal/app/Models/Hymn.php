<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Hymn extends Model
{
    use HasFactory;

    protected $table = 'hymns';
    public $timestamps = false;
    protected $fillable = ['number', 'title', 'lyrics'];

    public function favorites()
    {
        return $this->hasMany(Favorites::class, 'hymn_id');
    }

}
