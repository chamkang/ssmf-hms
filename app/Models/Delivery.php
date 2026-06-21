<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use OwenIt\Auditing\Auditable as AuditableTrait;
use OwenIt\Auditing\Contracts\Auditable;

class Delivery extends Model implements Auditable
{
    use AuditableTrait;

    protected $fillable = [
        'pregnancy_id', 'delivered_at', 'mode', 'outcome', 'baby_sex',
        'birth_weight', 'apgar_1', 'apgar_5', 'complications', 'notes', 'recorded_by',
    ];

    protected $casts = [
        'delivered_at' => 'datetime',
        'birth_weight' => 'float',
    ];

    public function pregnancy(): BelongsTo
    {
        return $this->belongsTo(Pregnancy::class);
    }
}
