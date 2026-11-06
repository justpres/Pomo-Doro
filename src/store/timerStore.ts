import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    DEFAULT_FOCUS_DURATION,
    DEFAULT_SHORT_BREAK,
    DEFAULT_LONG_BREAK,
    POMODOROS_BEFORE_LONG_BREAK,
    TimerMode,
} from '@/lib/constants';
import { durationFor, nextAfterComplete, nextAfterSkip, secondsLeft } from '@/lib/timerLogic';
import { useSessionStore } from './sessionStore';
import { useTaskStore } from './taskStore';
import { usePresetStore } from './presetStore';

export interface ResumptionCue {
    whereLeftOff: string;
    nextAction: string;
    createdAt: number;
}

export interface TimerSettings {
    focusDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    pomodorosBeforeLongBreak: number;
    autoStartBreaks: boolean;
    autoStartPomodoros: boolean;
    soundEnabled: boolean;
    soundVolume: number;
    selectedSound: string;
    autoOpenBreathwork?: boolean;
    promptIntention?: boolean;
    zenModeEnabled?: boolean;
}

export interface TimerState {
    // Timer state
    timeRemaining: number;
    isRunning: boolean;
    mode: TimerMode;
    pomodoroCount: number;
    endsAt: number | null;
    remainingMs: number;
    sessionDuration: number;
    currentIntention: string | null;
    resumptionCue: ResumptionCue | null;
    lastCompletion: {
        id: string;
        mode: TimerMode;
        at: number;
        silent: boolean;
    } | null;
    isZenActive: boolean;

    // Settings
    settings: TimerSettings;

    // Actions
    start: () => void;
    pause: () => void;
    reset: () => void;
    skip: () => void;
    sync: (now?: number) => void;
    setMode: (mode: TimerMode) => void;
    setIntention: (intention: string | null) => void;
    setResumptionCue: (cue: { whereLeftOff: string; nextAction: string } | null) => void;
    clearResumptionCue: () => void;
    setZenActive: (isZenActive: boolean) => void;
    updateSettings: (settings: Partial<TimerSettings>) => void;
    finishSession: (endedAt: number, opts?: { silent?: boolean }) => void;
}

const defaultSettings: TimerSettings = {
    focusDuration: DEFAULT_FOCUS_DURATION,
    shortBreakDuration: DEFAULT_SHORT_BREAK,
    longBreakDuration: DEFAULT_LONG_BREAK,
    pomodorosBeforeLongBreak: POMODOROS_BEFORE_LONG_BREAK,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    soundEnabled: true,
    soundVolume: 80,
    selectedSound: 'digital-alarm-clock-2.mp3',
    autoOpenBreathwork: false,
    promptIntention: true,
    zenModeEnabled: true,
};

export const useTimerStore = create<TimerState>()(
    persist(
        (set, get) => ({
            timeRemaining: DEFAULT_FOCUS_DURATION,
            isRunning: false,
            mode: 'focus',
            pomodoroCount: 0,
            endsAt: null,
            remainingMs: DEFAULT_FOCUS_DURATION * 1000,
            sessionDuration: DEFAULT_FOCUS_DURATION,
            currentIntention: null,
            resumptionCue: null,
            lastCompletion: null,
            isZenActive: false,
            settings: defaultSettings,

            setIntention: (currentIntention) => set({ currentIntention }),

            setResumptionCue: (cue) => {
                if (!cue) {
                    set({ resumptionCue: null });
                    return;
                }
                set({
                    resumptionCue: {
                        whereLeftOff: cue.whereLeftOff.trim(),
                        nextAction: cue.nextAction.trim(),
                        createdAt: Date.now(),
                    },
                });
            },

            clearResumptionCue: () => set({ resumptionCue: null }),

            setZenActive: (isZenActive) => set({ isZenActive }),

            start: () => {
                const state = get();
                if (state.isRunning) return;
                const now = Date.now();
                const endsAt = now + state.remainingMs;
                set({
                    isRunning: true,
                    endsAt,
                    timeRemaining: secondsLeft(endsAt, now),
                });
            },

            pause: () => {
                const state = get();
                if (!state.isRunning) return;
                const now = Date.now();
                const remainingMs = state.endsAt ? Math.max(0, state.endsAt - now) : state.remainingMs;
                set({
                    isRunning: false,
                    endsAt: null,
                    remainingMs,
                    timeRemaining: Math.ceil(remainingMs / 1000),
                    isZenActive: false,
                });
            },

            reset: () => {
                const { mode, settings } = get();
                const durationSec = durationFor(mode, settings);
                set({
                    isRunning: false,
                    endsAt: null,
                    sessionDuration: durationSec,
                    remainingMs: durationSec * 1000,
                    timeRemaining: durationSec,
                    isZenActive: false,
                });
            },

            skip: () => {
                const { mode, pomodoroCount, settings } = get();
                const next = nextAfterSkip(mode, pomodoroCount);
                const nextDuration = durationFor(next.mode, settings);
                set({
                    mode: next.mode,
                    pomodoroCount: next.count,
                    isRunning: false,
                    endsAt: null,
                    sessionDuration: nextDuration,
                    remainingMs: nextDuration * 1000,
                    timeRemaining: nextDuration,
                    isZenActive: false,
                });
            },

            sync: (now: number = Date.now()) => {
                const state = get();
                if (!state.isRunning || !state.endsAt) {
                    return;
                }

                if (now >= state.endsAt) {
                    const endedAt = state.endsAt;
                    get().finishSession(endedAt, { silent: false });
                } else {
                    set({
                        timeRemaining: secondsLeft(state.endsAt, now),
                        remainingMs: Math.max(0, state.endsAt - now),
                    });
                }
            },

            setMode: (mode: TimerMode) => {
                const { settings } = get();
                const durationSec = durationFor(mode, settings);
                set({
                    mode,
                    isRunning: false,
                    endsAt: null,
                    sessionDuration: durationSec,
                    remainingMs: durationSec * 1000,
                    timeRemaining: durationSec,
                    isZenActive: false,
                });
            },

            updateSettings: (newSettings: Partial<TimerSettings>) => {
                const { settings, mode, isRunning } = get();
                const updatedSettings = { ...settings, ...newSettings };

                if (!isRunning) {
                    const durationSec = durationFor(mode, updatedSettings);
                    set({
                        settings: updatedSettings,
                        sessionDuration: durationSec,
                        remainingMs: durationSec * 1000,
                        timeRemaining: durationSec,
                    });
                } else {
                    set({ settings: updatedSettings });
                }
            },

            finishSession: (endedAt: number, opts?: { silent?: boolean }) => {
                const state = get();
                const { mode, pomodoroCount, settings, sessionDuration } = state;
                const silent = !!opts?.silent;

                let loggedSessionId: string | undefined;

                if (mode === 'focus') {
                    const activePresetId = usePresetStore.getState().activePresetId;
                    const activeTaskId = useTaskStore.getState().activeTaskId;

                    loggedSessionId = useSessionStore.getState().logSession({
                        type: 'focus',
                        duration: sessionDuration,
                        completedAt: endedAt,
                        presetId: activePresetId || undefined,
                        intention: state.currentIntention || undefined,
                    });

                    if (activeTaskId) {
                        useTaskStore.getState().incrementTaskPomodoro(activeTaskId);
                    }

                    useSessionStore.getState().setPendingRating(loggedSessionId);
                } else {
                    const activePresetId = usePresetStore.getState().activePresetId;
                    loggedSessionId = useSessionStore.getState().logSession({
                        type: mode,
                        duration: sessionDuration,
                        completedAt: endedAt,
                        presetId: activePresetId || undefined,
                    });
                }

                const next = nextAfterComplete(mode, pomodoroCount, settings.pomodorosBeforeLongBreak);
                const nextDuration = durationFor(next.mode, settings);

                const shouldAutoStart = !silent && (
                    (next.mode === 'focus' && settings.autoStartPomodoros) ||
                    (next.mode !== 'focus' && settings.autoStartBreaks)
                );

                const now = Date.now();
                let nextEndsAt: number | null = null;
                let nextRemainingMs = nextDuration * 1000;
                let nextTimeRemaining = nextDuration;

                if (shouldAutoStart) {
                    nextEndsAt = endedAt + nextDuration * 1000;
                    if (nextEndsAt > now) {
                        nextRemainingMs = nextEndsAt - now;
                        nextTimeRemaining = secondsLeft(nextEndsAt, now);
                    } else {
                        nextEndsAt = null;
                        nextRemainingMs = 0;
                        nextTimeRemaining = 0;
                    }
                }

                set({
                    mode: next.mode,
                    pomodoroCount: next.count,
                    sessionDuration: nextDuration,
                    isRunning: shouldAutoStart && nextEndsAt !== null,
                    endsAt: nextEndsAt,
                    remainingMs: nextRemainingMs,
                    timeRemaining: nextTimeRemaining,
                    isZenActive: false,
                    lastCompletion: {
                        id: loggedSessionId || `complete-${Date.now()}`,
                        mode,
                        at: endedAt,
                        silent,
                    },
                });
            },
        }),
        {
            name: 'pomodoro-timer-storage',
            version: 1,
            partialize: (state) => ({
                settings: state.settings,
                mode: state.mode,
                pomodoroCount: state.pomodoroCount,
                isRunning: state.isRunning,
                endsAt: state.endsAt,
                remainingMs: state.remainingMs,
                sessionDuration: state.sessionDuration,
            }),
            migrate: (persistedState: unknown, version: number) => {
                if (version < 1 && persistedState && typeof persistedState === 'object') {
                    const state = { ...(persistedState as Record<string, unknown>) };
                    delete state.totalPomodorosToday;
                    const rest = state as unknown as Partial<TimerState>;
                    return {
                        ...rest,
                        sessionDuration: rest.sessionDuration || rest.settings?.focusDuration || DEFAULT_FOCUS_DURATION,
                        remainingMs: rest.remainingMs || (rest.settings?.focusDuration || DEFAULT_FOCUS_DURATION) * 1000,
                        endsAt: rest.endsAt || null,
                    } as TimerState;
                }
                return persistedState as TimerState;
            },
            onRehydrateStorage: () => (state) => {
                if (!state) return;
                if (state.isRunning && state.endsAt) {
                    const now = Date.now();
                    if (now >= state.endsAt) {
                        state.finishSession(state.endsAt, { silent: true });
                    } else {
                        state.sync(now);
                    }
                }
            },
        }
    )
);
