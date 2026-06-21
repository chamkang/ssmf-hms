import { PartographEntry } from '@/types';

/**
 * WHO-style partograph plot of cervical dilatation (cm) against hours of
 * labour, with the Alert line (1 cm/hr from 4 cm) and the Action line (4 h to
 * its right). Plotted as plain SVG — a visual companion to the entry table.
 */
export default function PartographChart({ entries }: { entries: PartographEntry[] }) {
    const pts = [...entries]
        .filter((e) => e.cervix_cm != null)
        .sort((a, b) => a.recorded_at.localeCompare(b.recorded_at));

    if (pts.length < 1) {
        return <p className="py-4 text-center text-sm text-gray-400">No cervical dilatation recorded yet.</p>;
    }

    const t0 = new Date(pts[0].recorded_at).getTime();
    const hoursOf = (iso: string) => (new Date(iso).getTime() - t0) / 3_600_000;
    const maxH = Math.max(12, Math.ceil(Math.max(...pts.map((p) => hoursOf(p.recorded_at))) + 1));

    const W = 560;
    const H = 240;
    const padL = 28;
    const padB = 24;
    const padT = 10;
    const innerW = W - padL - 10;
    const innerH = H - padB - padT;

    const x = (h: number) => padL + (innerW * h) / maxH;
    const y = (cm: number) => padT + innerH - (innerH * (cm - 0) / 10); // 0..10 cm

    // Alert line: from (0h, 4cm) at 1 cm/hr -> reaches 10cm at 6h. Action line +4h.
    const alert = [[0, 4], [6, 10]] as const;
    const action = [[4, 4], [10, 10]] as const;
    const seg = (p: readonly (readonly [number, number])[]) => p.map(([h, cm]) => `${x(h)},${y(cm)}`).join(' ');

    return (
        <div className="overflow-x-auto">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[480px]">
                {/* gridlines + y labels at 4..10 cm */}
                {[4, 5, 6, 7, 8, 9, 10].map((cm) => (
                    <g key={cm}>
                        <line x1={padL} y1={y(cm)} x2={W - 10} y2={y(cm)} stroke="currentColor" className="text-gray-100 dark:text-gray-700" />
                        <text x={padL - 4} y={y(cm) + 3} textAnchor="end" className="fill-gray-400 text-[9px]">{cm}</text>
                    </g>
                ))}
                {/* x labels every 2h */}
                {Array.from({ length: Math.floor(maxH / 2) + 1 }, (_, i) => i * 2).map((h) => (
                    <text key={h} x={x(h)} y={H - 8} textAnchor="middle" className="fill-gray-400 text-[9px]">{h}h</text>
                ))}

                {/* alert + action lines */}
                <polyline fill="none" stroke="#D97706" strokeWidth={1.5} strokeDasharray="4 3" points={seg(alert)} />
                <polyline fill="none" stroke="#DC2626" strokeWidth={1.5} strokeDasharray="2 3" points={seg(action)} />

                {/* dilatation curve (X markers) */}
                <polyline fill="none" stroke="#0A3D62" strokeWidth={2} points={pts.map((p) => `${x(hoursOf(p.recorded_at))},${y(p.cervix_cm as number)}`).join(' ')} />
                {pts.map((p, i) => (
                    <text key={i} x={x(hoursOf(p.recorded_at))} y={y(p.cervix_cm as number) + 4} textAnchor="middle" className="fill-[#0A3D62] text-[11px] font-bold dark:fill-blue-300">×</text>
                ))}
            </svg>
            <div className="mt-1 flex flex-wrap justify-center gap-4 text-xs text-gray-600 dark:text-gray-300">
                <span className="flex items-center gap-1"><span className="inline-block h-2 w-3 rounded-sm bg-[#0A3D62]" /> Dilatation (cm)</span>
                <span className="flex items-center gap-1"><span className="inline-block h-2 w-3 rounded-sm bg-amber-600" /> Alert line</span>
                <span className="flex items-center gap-1"><span className="inline-block h-2 w-3 rounded-sm bg-red-600" /> Action line</span>
            </div>
        </div>
    );
}
