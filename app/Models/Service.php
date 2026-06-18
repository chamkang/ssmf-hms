<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $fillable = ['slug', 'name_fr', 'name_en', 'duration_min', 'is_active', 'sort_order'];

    protected $casts = ['is_active' => 'boolean'];
}
