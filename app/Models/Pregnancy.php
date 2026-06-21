<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;
use OwenIt\Auditing\Auditable as AuditableTrait;
use OwenIt\Auditing\Contracts\Auditable;

class Pregnancy extends Model implements Auditable
{
    use AuditableTrait;

    protected $fillable = [
        'reference', 'patient_id', 'lmp', 'edd', 'gravida', 'para', 'abortions',
        'blood_group', 'rhesus', 'risk_level', 'risk_factors', 'status', 'notes', 'created_by',
    ];

    protected $casts = [
        'lmp' => 'date',
        'edd' => 'date',
    ];

    protected $appends = ['ga_weeks'];

    protected static function booted(): void
    {
        static::creating(function (Pregnancy $p) {
            if (auth()->check()) {
                $p->created_by ??= auth()->id();
            }
            // Naegele's rule — EDD is LMP + 280 days.
            if ($p->lmp && empty($p->edd)) {
                $p->edd = Carbon::parse($p->lmp)->addDays(280)->toDateString();
            }
        });
        static::created(function (Pregnancy $p) {
            if (empty($p->reference)) {
                $p->reference = sprintf('SSMF-OB-%05d', $p->id);
                $p->saveQuietly();
            }
        });
    }

    /** Current gestational age in completed weeks, from LMP. */
    public function getGaWeeksAttribute(): ?int
    {
        if (! $this->lmp) {
            return null;
        }

        return (int) floor($this->lmp->diffInDays(now()) / 7);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function ancVisits(): HasMany
    {
        return $this->hasMany(AncVisit::class)->orderBy('visit_on');
    }

    public function partographEntries(): HasMany
    {
        return $this->hasMany(PartographEntry::class)->orderBy('recorded_at');
    }

    public function delivery(): HasOne
    {
        return $this->hasOne(Delivery::class);
    }
}
