<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\Schedule;
use Illuminate\Support\Carbon;

class SlotEngine
{
    /**
     * Available 'HH:MM' start times for a doctor on a Y-m-d date:
     * the doctor's schedule blocks, minus already-booked (active) slots,
     * minus past times (with a 1-hour same-day cutoff).
     *
     * @return string[]
     */
    public static function available(int $doctorId, string $date): array
    {
        $day = Carbon::createFromFormat('Y-m-d', $date)->startOfDay();
        $weekday = (int) $day->dayOfWeek; // 0=Sun … 6=Sat

        $slots = [];
        foreach (Schedule::where('doctor_id', $doctorId)->where('weekday', $weekday)->get() as $block) {
            $t = Carbon::createFromFormat('Y-m-d H:i', "{$date} {$block->start_time}");
            $end = Carbon::createFromFormat('Y-m-d H:i', "{$date} {$block->end_time}");
            $step = max(5, (int) $block->slot_minutes);
            for (; $t->copy()->addMinutes($step) <= $end; $t->addMinutes($step)) {
                $slots[$t->format('H:i')] = true;
            }
        }
        if (empty($slots)) {
            return [];
        }

        $booked = Appointment::where('doctor_id', $doctorId)
            ->whereIn('status', Appointment::ACTIVE)
            ->whereDate('starts_at', $date)
            ->pluck('starts_at');
        foreach ($booked as $b) {
            unset($slots[Carbon::parse($b)->format('H:i')]);
        }

        $cutoff = now()->addHour();
        foreach (array_keys($slots) as $hm) {
            if (Carbon::createFromFormat('Y-m-d H:i', "{$date} {$hm}")->lt($cutoff)) {
                unset($slots[$hm]);
            }
        }

        ksort($slots);

        return array_keys($slots);
    }
}
