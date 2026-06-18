<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Auditable as AuditableTrait;
use OwenIt\Auditing\Contracts\Auditable;

class Appointment extends Model implements Auditable
{
    use SoftDeletes, AuditableTrait;

    protected $fillable = [
        'reference', 'patient_id', 'doctor_id', 'service_id',
        'starts_at', 'ends_at', 'status', 'source', 'notes', 'created_by', 'updated_by',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
    ];

    public const ACTIVE = ['pending', 'confirmed', 'checked_in', 'in_progress'];

    protected static function booted(): void
    {
        static::creating(function (Appointment $a) {
            if (auth()->check()) {
                $a->created_by ??= auth()->id();
                $a->updated_by = auth()->id();
            }
        });

        static::updating(function (Appointment $a) {
            if (auth()->check()) {
                $a->updated_by = auth()->id();
            }
        });

        static::created(function (Appointment $a) {
            if (empty($a->reference)) {
                $a->reference = sprintf('SSMF-%s-%05d', $a->starts_at?->format('Y') ?? date('Y'), $a->id);
                $a->saveQuietly();
            }
        });
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }
}
