<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use OwenIt\Auditing\Auditable as AuditableTrait;
use OwenIt\Auditing\Contracts\Auditable;

class Admission extends Model implements Auditable
{
    use AuditableTrait;

    protected $fillable = [
        'reference', 'patient_id', 'bed_id', 'attending_id', 'admitted_at',
        'discharged_at', 'reason', 'status', 'discharge_summary', 'created_by',
    ];

    protected $casts = [
        'admitted_at' => 'datetime',
        'discharged_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (Admission $a) {
            $a->admitted_at ??= now();
            if (auth()->check()) {
                $a->created_by ??= auth()->id();
            }
        });
        static::created(function (Admission $a) {
            if (empty($a->reference)) {
                $a->reference = sprintf('SSMF-ADM-%s-%05d', date('Y'), $a->id);
                $a->saveQuietly();
            }
        });
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function bed(): BelongsTo
    {
        return $this->belongsTo(Bed::class);
    }

    public function attending(): BelongsTo
    {
        return $this->belongsTo(User::class, 'attending_id');
    }

    public function notes(): HasMany
    {
        return $this->hasMany(AdmissionNote::class)->latest('noted_at');
    }
}
