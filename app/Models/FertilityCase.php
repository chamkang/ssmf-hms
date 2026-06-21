<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Auditable as AuditableTrait;
use OwenIt\Auditing\Contracts\Auditable;

class FertilityCase extends Model implements Auditable
{
    use AuditableTrait, SoftDeletes;

    protected $fillable = [
        'reference', 'female_patient_id', 'male_patient_id', 'referral_reason',
        'diagnosis', 'status', 'opened_on', 'notes', 'created_by',
    ];

    protected $casts = ['opened_on' => 'date'];

    protected static function booted(): void
    {
        static::creating(function (FertilityCase $c) {
            $c->opened_on ??= now()->toDateString();
            if (auth()->check()) {
                $c->created_by ??= auth()->id();
            }
        });
        static::created(function (FertilityCase $c) {
            if (empty($c->reference)) {
                $c->reference = sprintf('SSMF-ART-%05d', $c->id);
                $c->saveQuietly();
            }
        });
    }

    public function female(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'female_patient_id');
    }

    public function male(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'male_patient_id');
    }

    public function cycles(): HasMany
    {
        return $this->hasMany(ArtCycle::class)->latest('id');
    }
}
