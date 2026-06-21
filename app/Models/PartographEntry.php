<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PartographEntry extends Model
{
    protected $fillable = [
        'pregnancy_id', 'recorded_at', 'cervix_cm', 'descent', 'fetal_heart_rate',
        'contractions_per10', 'liquor', 'moulding', 'pulse', 'bp_sys', 'bp_dia',
        'temp', 'note', 'recorded_by',
    ];

    protected $casts = [
        'recorded_at' => 'datetime',
        'temp' => 'float',
    ];

    public function pregnancy(): BelongsTo
    {
        return $this->belongsTo(Pregnancy::class);
    }
}
