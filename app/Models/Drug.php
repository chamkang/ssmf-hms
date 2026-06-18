<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Drug extends Model
{
    protected $fillable = ['name', 'form', 'strength', 'route', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function getLabelAttribute(): string
    {
        return trim($this->name.' '.($this->strength ?? '').' '.($this->form ?? ''));
    }
}
