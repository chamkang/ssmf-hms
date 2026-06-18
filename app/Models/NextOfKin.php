<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NextOfKin extends Model
{
    protected $table = 'next_of_kin';

    protected $fillable = ['patient_id', 'name', 'relationship', 'phone'];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }
}
