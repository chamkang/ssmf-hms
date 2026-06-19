<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockBatch extends Model
{
    protected $fillable = ['drug_id', 'batch_no', 'quantity', 'expiry_date'];

    protected $casts = ['expiry_date' => 'date'];

    public function drug(): BelongsTo
    {
        return $this->belongsTo(Drug::class);
    }
}
