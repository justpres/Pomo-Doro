// Timer duration constants (in seconds)
export const DEFAULT_FOCUS_DURATION = 25 * 60; // 25 minutes
export const DEFAULT_SHORT_BREAK = 5 * 60; // 5 minutes
export const DEFAULT_LONG_BREAK = 15 * 60; // 15 minutes
export const POMODOROS_BEFORE_LONG_BREAK = 4;

// Mode types
export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

// Mode labels for display
export const MODE_LABELS: Record<TimerMode, string> = {
    focus: 'Focus',
    shortBreak: 'Short Break',
    longBreak: 'Long Break',
};

// Mode colors for background transitions
export const MODE_COLORS: Record<TimerMode, string> = {
    focus: '#FFF5F5',
    shortBreak: '#F0FFF4',
    longBreak: '#E8F4FF',
};

// Format seconds to MM:SS
export function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
