import { TimerMode } from './constants';

export interface DurationSettings {
    focusDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
}

export function durationFor(mode: TimerMode, settings: DurationSettings): number {
    switch (mode) {
        case 'focus':
            return settings.focusDuration;
        case 'shortBreak':
            return settings.shortBreakDuration;
        case 'longBreak':
            return settings.longBreakDuration;
    }
}

/** Next mode and cycle count after a session *completes* (not when skipped). */
export function nextAfterComplete(
    mode: TimerMode,
    count: number,
    perCycle: number
): { mode: TimerMode; count: number } {
    if (mode === 'focus') {
        const nextCount = count + 1;
        return {
            mode: nextCount >= perCycle ? 'longBreak' : 'shortBreak',
            count: nextCount,
        };
    }
    return {
        mode: 'focus',
        count: mode === 'longBreak' ? 0 : count,
    };
}

/** Skip: focus -> shortBreak (count unchanged); break -> focus (long break resets count). */
export function nextAfterSkip(
    mode: TimerMode,
    count: number
): { mode: TimerMode; count: number } {
    if (mode === 'focus') {
        return {
            mode: 'shortBreak',
            count,
        };
    }
    return {
        mode: 'focus',
        count: mode === 'longBreak' ? 0 : count,
    };
}

export function secondsLeft(endsAt: number, now: number): number {
    return Math.max(0, Math.ceil((endsAt - now) / 1000));
}
