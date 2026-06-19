<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tariff extends Model
{
    protected $fillable = ['code', 'label', 'amount', 'is_active', 'sort_order'];

    protected $casts = ['is_active' => 'boolean'];
}
