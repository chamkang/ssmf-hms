<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ward extends Model
{
    protected $fillable = ['name', 'kind', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function beds(): HasMany
    {
        return $this->hasMany(Bed::class);
    }
}
