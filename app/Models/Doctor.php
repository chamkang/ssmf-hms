<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Doctor extends Model
{
    protected $fillable = ['slug', 'full_name', 'onmc', 'specialty_fr', 'specialty_en', 'is_active', 'sort_order'];

    protected $casts = ['is_active' => 'boolean'];

    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }
}
