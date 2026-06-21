<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use OwenIt\Auditing\Auditable as AuditableTrait;
use OwenIt\Auditing\Contracts\Auditable;

class ArtCycle extends Model implements Auditable
{
    use AuditableTrait;

    protected $fillable = [
        'reference', 'fertility_case_id', 'type', 'protocol', 'status',
        'started_on', 'trigger_on', 'notes', 'created_by',
    ];

    protected $casts = [
        'started_on' => 'date',
        'trigger_on' => 'date',
    ];

    protected static function booted(): void
    {
        static::creating(function (ArtCycle $c) {
            if (auth()->check()) {
                $c->created_by ??= auth()->id();
            }
        });
        static::created(function (ArtCycle $c) {
            if (empty($c->reference)) {
                $c->reference = sprintf('SSMF-CYC-%s-%05d', date('Y'), $c->id);
                $c->saveQuietly();
            }
        });
    }

    public function fertilityCase(): BelongsTo
    {
        return $this->belongsTo(FertilityCase::class);
    }

    public function monitorings(): HasMany
    {
        return $this->hasMany(CycleMonitoring::class)->orderBy('monitored_on');
    }

    public function embryology(): HasOne
    {
        return $this->hasOne(EmbryologyRecord::class);
    }
}
