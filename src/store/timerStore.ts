import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    DEFAULT_FOCUS_DURATION,
    DEFAULT_SHORT_BREAK,
    DEFAULT_LONG_BREAK,
    POMODOROS_BEFORE_LONG_BREAK,
    TimerMode,
} from '@/lib/constants';

interface TimerSettings {
    focusDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    pomodorosBeforeLongBreak: number;
    autoStartBreaks: boolean;
    autoStartPomodoros: boolean;
    soundEnabled: boolean;
    soundVolume: number;
    selectedSound: string;
}

interface TimerState {
    // Timer state
    timeRemaining: number;
    isRunning: boolean;
    mode: TimerMode;
    pomodoroCount: number;
    totalPomodorosToday: number;

    // Settings
    settings: TimerSettings;

    // Actions
    start: () => void;
    pause: () => void;
    reset: () => void;
    skip: () => void;
    tick: () => void;
    setMode: (mode: TimerMode) => void;
    updateSettings: (settings: Partial<TimerSettings>) => void;
    completeSession: () => void;
}

const getInitialDuration = (mode: TimerMode, settings: TimerSettings): number => {
    switch (mode) {
        case 'focus':
            return settings.focusDuration;
        case 'shortBreak':
            return settings.shortBreakDuration;
        case 'longBreak':
            return settings.longBreakDuration;
    }
};

export const useTimerStore = create<TimerState>()(
    persist(
        (set, get) => ({
            // Initial state
            timeRemaining: DEFAULT_FOCUS_DURATION,
            isRunning: false,
            mode: 'focus',
            pomodoroCount: 0,
            totalPomodorosToday: 0,

            // Settings
            settings: {
                focusDuration: DEFAULT_FOCUS_DURATION,
                shortBreakDuration: DEFAULT_SHORT_BREAK,
                longBreakDuration: DEFAULT_LONG_BREAK,
                pomodorosBeforeLongBreak: POMODOROS_BEFORE_LONG_BREAK,
                autoStartBreaks: false,
                autoStartPomodoros: false,
                soundEnabled: true,
                soundVolume: 80,
                selectedSound: 'digital-alarm-clock-2.mp3',
            },

            // Actions
            start: () => set({ isRunning: true }),

            pause: () => set({ isRunning: false }),

            reset: () => {
                const { mode, settings } = get();
                set({
                    timeRemaining: getInitialDuration(mode, settings),
                    isRunning: false,
                });
            },

            skip: () => {
                const { mode, pomodoroCount, settings } = get();
                let nextMode: TimerMode;
                let newPomodoroCount = pomodoroCount;

                if (mode === 'focus') {
                    // After focus, go to break
                    newPomodoroCount = pomodoroCount + 1;
                    if (newPomodoroCount >= settings.pomodorosBeforeLongBreak) {
                        nextMode = 'longBreak';
                    } else {
                        nextMode = 'shortBreak';
                    }
                } else {
                    // After any break, go to focus
                    nextMode = 'focus';
                    if (mode === 'longBreak') {
                        newPomodoroCount = 0; // Reset count after long break
                    }
                }

                set({
                    mode: nextMode,
                    timeRemaining: getInitialDuration(nextMode, settings),
                    isRunning: false,
                    pomodoroCount: newPomodoroCount,
                });
            },

            tick: () => {
                const { timeRemaining } = get();
                if (timeRemaining > 0) {
                    set({ timeRemaining: timeRemaining - 1 });
                } else {
                    // Timer completed
                    get().completeSession();
                }
            },

            setMode: (mode: TimerMode) => {
                const { settings } = get();
                set({
                    mode,
                    timeRemaining: getInitialDuration(mode, settings),
                    isRunning: false,
                });
            },

            updateSettings: (newSettings: Partial<TimerSettings>) => {
                const { settings, mode, isRunning } = get();
                const updatedSettings = { ...settings, ...newSettings };

                // If not running, update the time remaining to match new settings
                if (!isRunning) {
                    set({
                        settings: updatedSettings,
                        timeRemaining: getInitialDuration(mode, updatedSettings),
                    });
                } else {
                    set({ settings: updatedSettings });
                }
            },

            completeSession: () => {
                const { mode, pomodoroCount, settings } = get();
                let nextMode: TimerMode;
                let newPomodoroCount = pomodoroCount;
                let newTotalPomodorosToday = get().totalPomodorosToday;

                if (mode === 'focus') {
                    // Completed a focus session
                    newPomodoroCount = pomodoroCount + 1;
                    newTotalPomodorosToday += 1;

                    if (newPomodoroCount >= settings.pomodorosBeforeLongBreak) {
                        nextMode = 'longBreak';
                    } else {
                        nextMode = 'shortBreak';
                    }
                } else {
                    // Completed a break
                    nextMode = 'focus';
                    if (mode === 'longBreak') {
                        newPomodoroCount = 0;
                    }
                }

                const shouldAutoStart =
                    (nextMode === 'focus' && settings.autoStartPomodoros) ||
                    (nextMode !== 'focus' && settings.autoStartBreaks);

                set({
                    mode: nextMode,
                    timeRemaining: getInitialDuration(nextMode, settings),
                    isRunning: shouldAutoStart,
                    pomodoroCount: newPomodoroCount,
                    totalPomodorosToday: newTotalPomodorosToday,
                });
            },
        }),
        {
            name: 'pomodoro-timer-storage',
            partialize: (state) => ({
                settings: state.settings,
                totalPomodorosToday: state.totalPomodorosToday,
            }),
        }
    )
);
