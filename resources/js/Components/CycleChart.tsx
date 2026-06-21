import { CycleMonitoring } from '@/types';

/**
 * Compact stimulation-monitoring chart: estradiol (E2) and the lead-follicle
 * diameter over the monitoring visits. Each series is auto-scaled to its own
 * range; drawn as a plain SVG so there's no charting dependency.
 */
export default function CycleChart({ monitorings }: { monitorings: CycleMonitoring[] }) {
    const pts = [...monitorings].sort((a, b) => a.monitored_on.localeCompare(b.monitored_on));
    if (pts.length < 2) {
        return (
            <p className="py-6 text-center text-sm text-gray-400">
                Add at least two monitoring visits to see the trend.
            </p>
        );
    }

    const W = 560;
    const H = 200;
    const padX = 36;
    const padY = 20;
    const innerW = W - padX * 2;
    const innerH = H - padY * 2;

    const x = (i: number) => padX + (innerW * i) / (pts.length - 1);

    const e2 = pts.map((p) => p.e2 ?? null);
    const lead = pts.map((p) => p.lead_follicle ?? null);

    const maxE2 = Math.max(1, ...e2.map((v) => v ?? 0));
    const maxLead = Math.max(1, ...lead.map((v) => v ?? 0));

    const yE2 = (v: number) => padY + innerH - (innerH * v) / maxE2;
    const yLead = (v: number) => padY + innerH - (innerH * v) / maxLead;

    const line = (vals: (number | null)[], y: (v: number) => number) =>
        vals
            .map((v, i) => (v == null ? null : `${x(i)},${y(v)}`))
            .filter(Boolean)
            .join(' ');

    return (
        <div className="overflow-x-auto">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[480px]">
                {/* baseline */}
                <line x1={padX} y1={padY + innerH} x2={W - padX} y2={padY + innerH} stroke="currentColor" className="text-gray-200 dark:text-gray-700" />

                {/* E2 series (blue) */}
                <polyline fill="none" stroke="#0A3D62" strokeWidth={2} points={line(e2, yE2)} />
                {e2.map((v, i) => v != null && <circle key={'e' + i} cx={x(i)} cy={yE2(v)} r={3} fill="#0A3D62" />)}

                {/* Lead follicle series (green) */}
                <polyline fill="none" stroke="#0E9F63" strokeWidth={2} points={line(lead, yLead)} />
                {lead.map((v, i) => v != null && <circle key={'l' + i} cx={x(i)} cy={yLead(v)} r={3} fill="#0E9F63" />)}

                {/* x labels: day/month */}
                {pts.map((p, i) => (
                    <text key={'x' + i} x={x(i)} y={H - 4} textAnchor="middle" className="fill-gray-400 text-[9px]">
                        {p.monitored_on.slice(5)}
                    </text>
                ))}
            </svg>
            <div className="mt-1 flex justify-center gap-4 text-xs">
                <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                    <span className="inline-block h-2 w-3 rounded-sm bg-[#0A3D62]" /> E2 (pg/mL) · max {maxE2}
                </span>
                <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                    <span className="inline-block h-2 w-3 rounded-sm bg-[#0E9F63]" /> Lead follicle (mm) · max {maxLead}
                </span>
            </div>
        </div>
    );
}
