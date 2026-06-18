<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Encounter extends Model
{
    protected $fillable = [
        'patient_id', 'appointment_id', 'doctor_id', 'type', 'stage', 'status',
        'arrived_at', 'closed_at', 'created_by',
    ];

    protected $casts = [
        'arrived_at' => 'datetime',
        'closed_at' => 'datetime',
    ];

    /** Ordered patient-journey stages (TRD flow board). */
    public const STAGES = ['waiting', 'vitals', 'with_doctor', 'lab', 'pharmacy', 'cashier', 'done'];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }
}
