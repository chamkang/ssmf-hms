<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Prescription {{ $p->id }}</title>
    <style>
        * { box-sizing: border-box; }
        body { font-family: Georgia, 'Times New Roman', serif; color: #1f2937; margin: 0; padding: 40px; }
        .head { display: flex; justify-content: space-between; border-bottom: 3px solid #0A3D62; padding-bottom: 14px; }
        .clinic { font-size: 20px; font-weight: bold; color: #0A3D62; }
        .muted { color: #6b7280; font-size: 12px; }
        .rx { font-size: 46px; color: #0A3D62; font-weight: bold; line-height: 1; }
        .pt { margin: 22px 0; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th, td { text-align: left; padding: 8px 6px; border-bottom: 1px solid #e5e7eb; font-size: 13px; vertical-align: top; }
        th { background: #f3f4f6; font-size: 11px; text-transform: uppercase; letter-spacing: .04em; color: #6b7280; }
        .sign { margin-top: 60px; display: flex; justify-content: space-between; font-size: 13px; }
        .sign .line { border-top: 1px solid #9ca3af; width: 240px; padding-top: 4px; text-align: center; color: #6b7280; }
        @media print { .noprint { display: none; } body { padding: 20px; } }
    </style>
</head>
<body onload="window.print()">
    <div class="head">
        <div>
            <div class="clinic">Saint Sylvester Medical Foundation</div>
            <div class="muted">BP 9026, Bonabéri, Douala, Cameroon · +237 675 97 13 96</div>
        </div>
        <div class="rx">℞</div>
    </div>

    <div class="pt">
        <strong>{{ $p->patient->full_name }}</strong>
        &nbsp;·&nbsp; {{ $p->patient->mrn }}
        @if($p->patient->age !== null) &nbsp;·&nbsp; {{ $p->patient->age }} yrs @endif
        @if($p->patient->sex) &nbsp;·&nbsp; {{ $p->patient->sex === 'F' ? 'Female' : 'Male' }} @endif
        <div class="muted">Date: {{ optional($p->issued_at)->format('d/m/Y') }}</div>
    </div>

    <table>
        <thead>
            <tr><th>Medication</th><th>Dose</th><th>Frequency</th><th>Duration</th><th>Instructions</th></tr>
        </thead>
        <tbody>
            @forelse($p->items as $it)
                <tr>
                    <td><strong>{{ $it->drug_text }}</strong></td>
                    <td>{{ $it->dose }}</td>
                    <td>{{ $it->frequency }}</td>
                    <td>{{ $it->duration }}</td>
                    <td>{{ $it->instructions }}</td>
                </tr>
            @empty
                <tr><td colspan="5" class="muted">No items.</td></tr>
            @endforelse
        </tbody>
    </table>

    <div class="sign">
        <div></div>
        <div class="line">{{ $p->author->name ?? 'Prescriber' }} — signature &amp; stamp</div>
    </div>

    <p class="noprint muted" style="margin-top:30px">This window opens the print dialog automatically. Choose “Save as PDF” to export.</p>
</body>
</html>
