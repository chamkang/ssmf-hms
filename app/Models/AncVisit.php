<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AncVisit extends Model
{
    protected $fillable = [
        'pregnancy_id', 'visit_on', 'ga_weeks', 'weight', 'bp_sys', 'bp_dia',
        'fundal_height', 'fetal_heart_rate', 'presentation', 'urine_protein',
        'urine_glucose', 'hb', 'note', 'recorded_by',
    ];

    protected $casts = [
        'visit_on' => 'date',
        'weight' => 'float',
        'fundal_height' => 'float',
        'hb' => 'float',
    ];

    public function pregnancy(): BelongsTo
    {
        return $this->belongsTo(Pregnancy::class);
    }
}
