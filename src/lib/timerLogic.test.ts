import { describe, it, expect } from 'vitest';
import { durationFor, nextAfterComplete, nextAfterSkip, secondsLeft } from './timerLogic';

describe('timerLogic', () => {
    const settings = {
        focusDuration: 25 * 60,
        shortBreakDuration: 5 * 60,
        longBreakDuration: 15 * 60,
    };

    describe('durationFor', () => {
        it('returns correct durations for focus, shortBreak, and longBreak', () => {
            expect(durationFor('focus', settings)).toBe(1500);
            expect(durationFor('shortBreak', settings)).toBe(300);
            expect(durationFor('longBreak', settings)).toBe(900);
        });
    });

    describe('nextAfterComplete', () => {
        it('advances from focus to shortBreak when under cycle threshold', () => {
            const next = nextAfterComplete('focus', 0, 4);
            expect(next).toEqual({ mode: 'shortBreak', count: 1 });
        });

        it('advances from focus to longBreak when cycle threshold reached', () => {
            const next = nextAfterComplete('focus', 3, 4);
            expect(next).toEqual({ mode: 'longBreak', count: 4 });
        });

        it('transitions from shortBreak back to focus preserving count', () => {
            const next = nextAfterComplete('shortBreak', 2, 4);
            expect(next).toEqual({ mode: 'focus', count: 2 });
        });

        it('transitions from longBreak back to focus resetting count to 0', () => {
            const next = nextAfterComplete('longBreak', 4, 4);
            expect(next).toEqual({ mode: 'focus', count: 0 });
        });
    });

    describe('nextAfterSkip', () => {
        it('skipping focus moves to shortBreak without incrementing count (B6 fix)', () => {
            const next = nextAfterSkip('focus', 2);
            expect(next).toEqual({ mode: 'shortBreak', count: 2 });
        });

        it('skipping shortBreak moves to focus preserving count', () => {
            const next = nextAfterSkip('shortBreak', 2);
            expect(next).toEqual({ mode: 'focus', count: 2 });
        });

        it('skipping longBreak moves to focus resetting count to 0', () => {
            const next = nextAfterSkip('longBreak', 4);
            expect(next).toEqual({ mode: 'focus', count: 0 });
        });
    });

    describe('secondsLeft', () => {
        it('calculates remaining seconds using ceiling', () => {
            const now = 1000000;
            const endsAt = now + 15200; // 15.2 seconds
            expect(secondsLeft(endsAt, now)).toBe(16);
        });

        it('clamps to 0 when endsAt is in the past', () => {
            const now = 1000000;
            const endsAt = now - 5000;
            expect(secondsLeft(endsAt, now)).toBe(0);
        });
    });
});
