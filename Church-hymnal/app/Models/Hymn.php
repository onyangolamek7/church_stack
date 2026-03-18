<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Hymn extends Model
{
    use HasFactory;

    protected $fillable = [
        'number',
        'title',
        'lyrics',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'number' => 'integer',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}

/*namespace App\Models;

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

}*/
