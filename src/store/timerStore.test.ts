import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useTimerStore } from './timerStore';
import { useSessionStore } from './sessionStore';
import { useTaskStore } from './taskStore';

describe('timerStore', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        useSessionStore.setState({ sessions: [], pendingRatingId: null });
        useTaskStore.setState({ tasks: [], activeTaskId: null });
        useTimerStore.setState({
            timeRemaining: 1500,
            isRunning: false,
            mode: 'focus',
            pomodoroCount: 0,
            endsAt: null,
            remainingMs: 1500 * 1000,
            sessionDuration: 1500,
            lastCompletion: null,
            settings: {
                focusDuration: 1500,
                shortBreakDuration: 300,
                longBreakDuration: 900,
                pomodorosBeforeLongBreak: 4,
                autoStartBreaks: false,
                autoStartPomodoros: false,
                soundEnabled: true,
                soundVolume: 80,
                selectedSound: 'digital-alarm-clock-2.mp3',
                zenModeEnabled: true,
            },
        });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('starts and calculates endsAt correctly', () => {
        const now = 1000000;
        vi.setSystemTime(now);

        useTimerStore.getState().start();
        const state = useTimerStore.getState();

        expect(state.isRunning).toBe(true);
        expect(state.endsAt).toBe(now + 1500 * 1000);
        expect(state.timeRemaining).toBe(1500);
    });

    it('pauses and preserves accurate remaining milliseconds', () => {
        const now = 1000000;
        vi.setSystemTime(now);

        useTimerStore.getState().start();

        // Advance 200.5 seconds
        vi.setSystemTime(now + 200500);
        useTimerStore.getState().pause();

        const state = useTimerStore.getState();
        expect(state.isRunning).toBe(false);
        expect(state.endsAt).toBeNull();
        expect(state.remainingMs).toBe(1500000 - 200500);
        expect(state.timeRemaining).toBe(Math.ceil((1500000 - 200500) / 1000));
    });

    it('handles background tab throttle: single sync completes session after 25 minutes (B1, B7 fix)', () => {
        const now = 1000000;
        vi.setSystemTime(now);

        // Add an active task
        useTaskStore.getState().addTask('Work Task', 2);
        const taskId = useTaskStore.getState().tasks[0].id;
        useTaskStore.getState().setActiveTask(taskId);

        useTimerStore.getState().start();

        // Jump 25 minutes into the future at once (simulating tab inactive/sleep)
        const jumpTime = now + 1500 * 1000 + 100;
        vi.setSystemTime(jumpTime);

        useTimerStore.getState().sync(jumpTime);

        const state = useTimerStore.getState();
        expect(state.mode).toBe('shortBreak');
        expect(state.pomodoroCount).toBe(1);
        expect(state.isRunning).toBe(false);

        // Verify session logged
        const sessions = useSessionStore.getState().sessions;
        expect(sessions.length).toBe(1);
        expect(sessions[0].type).toBe('focus');
        expect(sessions[0].duration).toBe(1500);

        // Verify active task incremented
        const task = useTaskStore.getState().tasks[0];
        expect(task.actualPomodoros).toBe(1);

        // Verify rating prompt set
        expect(useSessionStore.getState().pendingRatingId).toBe(sessions[0].id);
    });

    it('silent completion when rehydrating after session has already elapsed (Option 1a)', () => {
        const now = 1000000;
        vi.setSystemTime(now);

        useTimerStore.setState({
            isRunning: true,
            endsAt: now + 500, // ends in 500ms
            remainingMs: 500,
            sessionDuration: 1500,
        });

        // App reopened 1 hour later
        const later = now + 3600 * 1000;
        vi.setSystemTime(later);

        // Simulate silent finish as done in onRehydrateStorage
        useTimerStore.getState().finishSession(now + 500, { silent: true });

        const state = useTimerStore.getState();
        expect(state.mode).toBe('shortBreak');
        expect(state.isRunning).toBe(false);
        expect(state.lastCompletion?.silent).toBe(true);

        const sessions = useSessionStore.getState().sessions;
        expect(sessions.length).toBe(1);
        expect(sessions[0].completedAt).toBe(new Date(now + 500).toISOString());
    });

    it('skipping focus moves to break without logging or advancing pomodoro count (B6 fix)', () => {
        useTimerStore.getState().skip();

        const state = useTimerStore.getState();
        expect(state.mode).toBe('shortBreak');
        expect(state.pomodoroCount).toBe(0);
        expect(useSessionStore.getState().sessions.length).toBe(0);
    });

    it('updating settings while running does not modify current session duration (B8 fix)', () => {
        const now = 1000000;
        vi.setSystemTime(now);

        useTimerStore.getState().start();

        // User changes focus duration setting to 30 mins
        useTimerStore.getState().updateSettings({ focusDuration: 1800 });

        const state = useTimerStore.getState();
        expect(state.settings.focusDuration).toBe(1800);
        expect(state.sessionDuration).toBe(1500); // Current session remains 1500s
        expect(state.endsAt).toBe(now + 1500 * 1000);
    });

    it('sets, stores, and clears ready-to-resume cues correctly', () => {
        expect(useTimerStore.getState().resumptionCue).toBeNull();

        useTimerStore.getState().setResumptionCue({
            whereLeftOff: 'Finished auth middleware on line 42',
            nextAction: 'Write unit tests for token expiration',
        });

        const state = useTimerStore.getState();
        expect(state.resumptionCue?.whereLeftOff).toBe('Finished auth middleware on line 42');
        expect(state.resumptionCue?.nextAction).toBe('Write unit tests for token expiration');
        expect(state.resumptionCue?.createdAt).toBeDefined();

        useTimerStore.getState().clearResumptionCue();
        expect(useTimerStore.getState().resumptionCue).toBeNull();
    });

    it('manages deep focus zen mode state and resets on pause/reset/skip/mode changes', () => {
        expect(useTimerStore.getState().isZenActive).toBe(false);
        expect(useTimerStore.getState().settings.zenModeEnabled).toBe(true);

        useTimerStore.getState().setZenActive(true);
        expect(useTimerStore.getState().isZenActive).toBe(true);

        // Pause resets zen
        useTimerStore.setState({ isRunning: true });
        useTimerStore.getState().pause();
        expect(useTimerStore.getState().isZenActive).toBe(false);

        // Reset clears zen
        useTimerStore.getState().setZenActive(true);
        useTimerStore.getState().reset();
        expect(useTimerStore.getState().isZenActive).toBe(false);

        // Skip clears zen
        useTimerStore.getState().setZenActive(true);
        useTimerStore.getState().skip();
        expect(useTimerStore.getState().isZenActive).toBe(false);

        // Mode change clears zen
        useTimerStore.getState().setZenActive(true);
        useTimerStore.getState().setMode('shortBreak');
        expect(useTimerStore.getState().isZenActive).toBe(false);
    });
});
