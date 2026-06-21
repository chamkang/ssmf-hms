<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IntakeBooking extends Model
{
    protected $fillable = [
        'web_reference', 'first_name', 'last_name', 'phone', 'email', 'sex', 'dob',
        'language', 'service_id', 'doctor_id', 'preferred_at', 'reason',
        'status', 'patient_id', 'appointment_id',
    ];

    protected $casts = [
        'dob' => 'date',
        'preferred_at' => 'datetime',
    ];

    protected $appends = ['full_name'];

    public function getFullNameAttribute(): string
    {
        return trim($this->first_name.' '.$this->last_name);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }
}
