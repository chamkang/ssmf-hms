<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Receipt {{ $inv->reference }}</title>
    <style>
        * { box-sizing: border-box; }
        body { font-family: Georgia, 'Times New Roman', serif; color: #1f2937; margin: 0; padding: 40px; }
        .head { display: flex; justify-content: space-between; border-bottom: 3px solid #0A3D62; padding-bottom: 14px; }
        .clinic { font-size: 20px; font-weight: bold; color: #0A3D62; }
        .muted { color: #6b7280; font-size: 12px; }
        h2 { color: #0A3D62; margin: 18px 0 4px; font-size: 18px; }
        .pt { margin: 16px 0; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th, td { text-align: left; padding: 7px 6px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
        th { background: #f3f4f6; font-size: 11px; text-transform: uppercase; letter-spacing: .04em; color: #6b7280; }
        .r { text-align: right; }
        .totals { margin-top: 12px; width: 280px; margin-left: auto; font-size: 14px; }
        .totals .grand { font-weight: bold; color: #0A3D62; font-size: 16px; }
        @media print { .noprint { display: none; } body { padding: 20px; } }
    </style>
</head>
<body onload="window.print()">
    <div class="head">
        <div>
            <div class="clinic">Saint Sylvester Medical Foundation</div>
            <div class="muted">BP 9026, Bonabéri, Douala, Cameroon · +237 675 97 13 96</div>
        </div>
        <div style="text-align:right">
            <div style="font-weight:bold">RECEIPT</div>
            <div class="muted">{{ $inv->reference }}</div>
            <div class="muted">{{ optional($inv->created_at)->format('d/m/Y H:i') }}</div>
        </div>
    </div>

    <div class="pt">
        <strong>{{ $inv->patient->full_name }}</strong> &nbsp;·&nbsp; {{ $inv->patient->mrn }}
    </div>

    <table>
        <thead>
            <tr><th>Item</th><th class="r">Qty</th><th class="r">Unit (FCFA)</th><th class="r">Amount (FCFA)</th></tr>
        </thead>
        <tbody>
            @foreach($inv->items as $it)
                <tr>
                    <td>{{ $it->label }}</td>
                    <td class="r">{{ $it->qty }}</td>
                    <td class="r">{{ number_format($it->unit_price) }}</td>
                    <td class="r">{{ number_format($it->amount) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="totals">
        <table>
            <tr><td>Total</td><td class="r grand">{{ number_format($inv->total) }} FCFA</td></tr>
            @foreach($inv->payments as $pay)
                <tr><td>Paid ({{ strtoupper($pay->method) }}{{ $pay->reference ? ' '.$pay->reference : '' }})</td><td class="r">{{ number_format($pay->amount) }}</td></tr>
                @if($pay->change_due)
                    <tr><td class="muted">Change given</td><td class="r muted">{{ number_format($pay->change_due) }}</td></tr>
                @endif
            @endforeach
            <tr><td>Balance</td><td class="r grand">{{ number_format($inv->balance) }} FCFA</td></tr>
        </table>
    </div>

    <p class="noprint muted" style="margin-top:30px">Choose “Save as PDF” in the print dialog to export.</p>
</body>
</html>
