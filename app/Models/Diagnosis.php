<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Diagnosis extends Model
{
    protected $table = 'diagnoses';

    protected $fillable = ['consultation_id', 'icd10_code', 'label', 'is_primary'];

    protected $casts = ['is_primary' => 'boolean'];

    public function consultation(): BelongsTo
    {
        return $this->belongsTo(Consultation::class);
    }
}
