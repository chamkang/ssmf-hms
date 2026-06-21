<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CycleMonitoring extends Model
{
    protected $fillable = [
        'art_cycle_id', 'monitored_on', 'endo_mm', 'right_follicles', 'left_follicles',
        'e2', 'lh', 'fsh', 'p4', 'note', 'recorded_by',
    ];

    protected $casts = [
        'monitored_on' => 'date',
        'right_follicles' => 'array',
        'left_follicles' => 'array',
        'endo_mm' => 'float',
        'e2' => 'float',
        'lh' => 'float',
        'fsh' => 'float',
        'p4' => 'float',
    ];

    protected $appends = ['follicle_count', 'lead_follicle'];

    public function cycle(): BelongsTo
    {
        return $this->belongsTo(ArtCycle::class, 'art_cycle_id');
    }

    /** Total follicles seen across both ovaries. */
    public function getFollicleCountAttribute(): int
    {
        return count($this->right_follicles ?? []) + count($this->left_follicles ?? []);
    }

    /** Largest follicle diameter (mm) seen this visit. */
    public function getLeadFollicleAttribute(): ?float
    {
        $all = array_merge($this->right_follicles ?? [], $this->left_follicles ?? []);

        return empty($all) ? null : (float) max($all);
    }
}
