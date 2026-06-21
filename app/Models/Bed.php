<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Bed extends Model
{
    protected $fillable = ['ward_id', 'label', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    protected $appends = ['is_occupied'];

    public function ward(): BelongsTo
    {
        return $this->belongsTo(Ward::class);
    }

    public function admissions(): HasMany
    {
        return $this->hasMany(Admission::class);
    }

    /** The admission currently occupying this bed, if any. */
    public function currentAdmission(): HasOne
    {
        return $this->hasOne(Admission::class)->where('status', 'active');
    }

    public function getIsOccupiedAttribute(): bool
    {
        return $this->relationLoaded('currentAdmission')
            ? (bool) $this->currentAdmission
            : $this->admissions()->where('status', 'active')->exists();
    }
}
