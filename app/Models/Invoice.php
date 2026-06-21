<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Auditable as AuditableTrait;
use OwenIt\Auditing\Contracts\Auditable;

class Invoice extends Model implements Auditable
{
    use SoftDeletes, AuditableTrait;

    protected $fillable = ['reference', 'patient_id', 'encounter_id', 'status', 'currency', 'notes', 'created_by'];

    protected $appends = ['total', 'paid', 'balance'];

    protected static function booted(): void
    {
        static::creating(function (Invoice $i) {
            if (auth()->check()) {
                $i->created_by ??= auth()->id();
            }
        });
        static::created(function (Invoice $i) {
            if (empty($i->reference)) {
                $i->reference = sprintf('SSMF-INV-%s-%05d', date('Y'), $i->id);
                $i->saveQuietly();
            }
        });
    }

    public function getTotalAttribute(): int
    {
        return (int) $this->items->sum('amount');
    }

    public function getPaidAttribute(): int
    {
        // Only confirmed payments count toward the balance; a pending MoMo push
        // is not money in hand until the patient approves it.
        return (int) $this->payments->where('status', 'confirmed')->sum('amount');
    }

    public function getBalanceAttribute(): int
    {
        return $this->total - $this->paid;
    }

    /** Recompute status from current items/payments. */
    public function refreshStatus(): void
    {
        if ($this->status === 'void') {
            return;
        }
        $this->load(['items', 'payments']);
        $status = $this->balance <= 0 && $this->total > 0 ? 'paid' : ($this->paid > 0 ? 'part_paid' : 'open');
        $this->update(['status' => $status]);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
