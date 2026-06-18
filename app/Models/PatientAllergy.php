<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PatientAllergy extends Model
{
    protected $fillable = ['patient_id', 'substance', 'reaction', 'severity'];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }
}
