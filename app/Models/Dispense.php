<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Dispense extends Model
{
    protected $fillable = ['prescription_id', 'dispensed_by', 'dispensed_at', 'note'];

    protected $casts = ['dispensed_at' => 'datetime'];

    public function prescription(): BelongsTo
    {
        return $this->belongsTo(Prescription::class);
    }
}
