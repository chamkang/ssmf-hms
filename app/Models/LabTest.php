<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LabTest extends Model
{
    protected $fillable = ['code', 'name', 'specimen', 'unit', 'ref_low', 'ref_high', 'price', 'is_active', 'sort_order'];

    protected $casts = ['is_active' => 'boolean'];
}
