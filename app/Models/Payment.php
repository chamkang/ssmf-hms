<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $fillable = [
        'invoice_id', 'method', 'provider', 'reference', 'amount',
        'tendered', 'change_due', 'received_by', 'received_at', 'raw',
    ];

    protected $casts = ['received_at' => 'datetime', 'raw' => 'array'];

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }
}
