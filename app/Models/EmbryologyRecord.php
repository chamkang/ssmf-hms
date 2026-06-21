<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use OwenIt\Auditing\Auditable as AuditableTrait;
use OwenIt\Auditing\Contracts\Auditable;

class EmbryologyRecord extends Model implements Auditable
{
    use AuditableTrait;

    protected $fillable = [
        'art_cycle_id', 'retrieval_date', 'oocytes_retrieved', 'mature_mii',
        'fertilization_method', 'fertilized_2pn', 'cleavage_day3', 'blastocysts',
        'transfer_date', 'embryos_transferred', 'embryos_frozen', 'embryo_grade',
        'beta_hcg', 'beta_hcg_date', 'clinical_pregnancy', 'outcome', 'notes', 'recorded_by',
    ];

    protected $casts = [
        'retrieval_date' => 'date',
        'transfer_date' => 'date',
        'beta_hcg_date' => 'date',
        'beta_hcg' => 'float',
        'clinical_pregnancy' => 'boolean',
    ];

    public function cycle(): BelongsTo
    {
        return $this->belongsTo(ArtCycle::class, 'art_cycle_id');
    }
}
