<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use OwenIt\Auditing\Models\Audit;

class AuditController extends Controller
{
    public function index(Request $request)
    {
        $audits = Audit::with('user')
            ->latest()
            ->paginate(30)
            ->through(fn (Audit $a) => [
                'id' => $a->id,
                'time' => optional($a->created_at)->toDateTimeString(),
                'user' => $a->user?->name ?? 'system',
                'event' => $a->event,
                'type' => class_basename((string) $a->auditable_type),
                'auditable_id' => $a->auditable_id,
                'ip' => $a->ip_address,
            ]);

        return Inertia::render('Audit/Index', ['audits' => $audits]);
    }
}
