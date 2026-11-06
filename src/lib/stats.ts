import { toLocalDateKey, addDays } from './date';

/**
 * Consecutive days with at least 1 focus session, ending today,
 * or yesterday if today has none yet.
 */
export function computeStreak(focusDates: Date[], now: Date = new Date()): number {
    if (focusDates.length === 0) return 0;

    const days = new Set(focusDates.map((d) => toLocalDateKey(d)));
    const todayKey = toLocalDateKey(now);

    let cursor = days.has(todayKey) ? now : addDays(now, -1);
    let streak = 0;

    while (days.has(toLocalDateKey(cursor))) {
        streak++;
        cursor = addDays(cursor, -1);
    }

    return streak;
}
