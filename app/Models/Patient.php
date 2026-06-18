<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Auditable as AuditableTrait;
use OwenIt\Auditing\Contracts\Auditable;

class Patient extends Model implements Auditable
{
    use SoftDeletes, AuditableTrait;

    protected $fillable = [
        'mrn', 'first_name', 'last_name', 'sex', 'dob', 'marital_status',
        'phone', 'email', 'address', 'language', 'blood_group', 'photo_path',
        'notes', 'verified_at', 'created_by', 'updated_by',
    ];

    protected $casts = [
        'dob' => 'date',
        'verified_at' => 'datetime',
    ];

    protected $appends = ['full_name', 'age'];

    protected static function booted(): void
    {
        static::creating(function (Patient $p) {
            if (auth()->check()) {
                $p->created_by ??= auth()->id();
                $p->updated_by = auth()->id();
            }
        });

        static::updating(function (Patient $p) {
            if (auth()->check()) {
                $p->updated_by = auth()->id();
            }
        });

        // MRN depends on the auto-increment id, so assign it just after insert.
        static::created(function (Patient $p) {
            if (empty($p->mrn)) {
                $p->mrn = sprintf('SSMF-P-%05d', $p->id);
                $p->saveQuietly();
            }
        });
    }

    public function getFullNameAttribute(): string
    {
        return trim($this->first_name.' '.$this->last_name);
    }

    public function getAgeAttribute(): ?int
    {
        return $this->dob ? $this->dob->age : null;
    }

    public function allergies(): HasMany
    {
        return $this->hasMany(PatientAllergy::class);
    }

    public function conditions(): HasMany
    {
        return $this->hasMany(PatientCondition::class);
    }

    public function nextOfKin(): HasMany
    {
        return $this->hasMany(NextOfKin::class);
    }
}
