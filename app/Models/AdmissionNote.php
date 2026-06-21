<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdmissionNote extends Model
{
    protected $fillable = [
        'admission_id', 'noted_at', 'kind', 'note',
        'temp', 'pulse', 'bp_sys', 'bp_dia', 'spo2', 'author_id',
    ];

    protected $casts = [
        'noted_at' => 'datetime',
        'temp' => 'float',
    ];

    public function admission(): BelongsTo
    {
        return $this->belongsTo(Admission::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
