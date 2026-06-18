<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Vital extends Model
{
    protected $fillable = [
        'encounter_id', 'patient_id', 'recorded_by',
        'temp', 'bp_sys', 'bp_dia', 'pulse', 'resp', 'spo2', 'weight', 'height',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }
}
