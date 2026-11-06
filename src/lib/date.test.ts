import { describe, it, expect } from 'vitest';
import { toLocalDateKey, addDays } from './date';

describe('date utilities', () => {
    describe('toLocalDateKey', () => {
        it('formats local date as YYYY-MM-DD with zero-padding', () => {
            const date = new Date(2026, 0, 5); // Jan 5, 2026
            expect(toLocalDateKey(date)).toBe('2026-01-05');
        });

        it('handles double digit months and days correctly', () => {
            const date = new Date(2026, 11, 25); // Dec 25, 2026
            expect(toLocalDateKey(date)).toBe('2026-12-25');
        });

        it('reflects local time when input is an ISO string at 01:00 UTC+8 (which is previous day in UTC)', () => {
            // Suppose local machine or explicit Date is 2026-11-06 01:30:00
            const localDate = new Date(2026, 10, 6, 1, 30, 0); // Month is 0-indexed: 10 = Nov
            expect(toLocalDateKey(localDate)).toBe('2026-11-06');
        });
    });

    describe('addDays', () => {
        it('adds days across month boundaries', () => {
            const start = new Date(2026, 0, 31); // Jan 31
            const next = addDays(start, 1);
            expect(next.getFullYear()).toBe(2026);
            expect(next.getMonth()).toBe(1); // Feb
            expect(next.getDate()).toBe(1);
        });

        it('subtracts days across year boundaries', () => {
            const start = new Date(2026, 0, 1); // Jan 1
            const prev = addDays(start, -1);
            expect(prev.getFullYear()).toBe(2025);
            expect(prev.getMonth()).toBe(11); // Dec
            expect(prev.getDate()).toBe(31);
        });
    });
});
