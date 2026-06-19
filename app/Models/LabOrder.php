<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LabOrder extends Model
{
    protected $fillable = ['reference', 'patient_id', 'encounter_id', 'consultation_id', 'ordered_by', 'status', 'notes'];

    protected static function booted(): void
    {
        static::created(function (LabOrder $o) {
            if (empty($o->reference)) {
                $o->reference = sprintf('SSMF-LAB-%s-%05d', date('Y'), $o->id);
                $o->saveQuietly();
            }
        });
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(LabOrderItem::class);
    }
}
