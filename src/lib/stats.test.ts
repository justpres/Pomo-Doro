import { describe, it, expect } from 'vitest';
import { computeStreak } from './stats';
import { addDays } from './date';

describe('computeStreak', () => {
    const today = new Date(2026, 10, 6, 12, 0, 0); // Reference "now"
    const yesterday = addDays(today, -1);
    const twoDaysAgo = addDays(today, -2);
    const threeDaysAgo = addDays(today, -3);

    it('returns 0 for empty focus dates', () => {
        expect(computeStreak([], today)).toBe(0);
    });

    it('returns 1 when there is a session today only', () => {
        expect(computeStreak([today], today)).toBe(1);
    });

    it('returns 1 when there was a session yesterday and none today yet (B4 fix)', () => {
        expect(computeStreak([yesterday], today)).toBe(1);
    });

    it('returns 3 when sessions exist for today, yesterday, and 2 days ago', () => {
        expect(computeStreak([today, yesterday, twoDaysAgo], today)).toBe(3);
    });

    it('returns 3 when sessions exist for yesterday, 2 days ago, and 3 days ago (none today yet)', () => {
        expect(computeStreak([yesterday, twoDaysAgo, threeDaysAgo], today)).toBe(3);
    });

    it('breaks streak when a day is missed', () => {
        // Today and 2 days ago (yesterday missed)
        expect(computeStreak([today, twoDaysAgo], today)).toBe(1);
    });

    it('handles multiple sessions on the same day without duplicating streak', () => {
        const morningSession = new Date(2026, 10, 6, 9, 0, 0);
        const afternoonSession = new Date(2026, 10, 6, 14, 0, 0);
        expect(computeStreak([morningSession, afternoonSession, yesterday], today)).toBe(2);
    });
});
