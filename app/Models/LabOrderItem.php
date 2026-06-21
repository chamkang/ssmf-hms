<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LabOrderItem extends Model
{
    protected $fillable = ['lab_order_id', 'lab_test_id', 'name', 'unit', 'ref_low', 'ref_high', 'value', 'flag', 'resulted_at'];

    protected $casts = ['resulted_at' => 'datetime'];

    public function order(): BelongsTo
    {
        return $this->belongsTo(LabOrder::class, 'lab_order_id');
    }

    public function labTest(): BelongsTo
    {
        return $this->belongsTo(LabTest::class, 'lab_test_id');
    }
}
