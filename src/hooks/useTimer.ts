'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useTimerStore } from '@/store/timerStore';
import { useSessionStore } from '@/store/sessionStore';
import { usePresetStore } from '@/store/presetStore';
import { useTaskStore } from '@/store/taskStore';
import { useAudio } from './useAudio';
import { useNotification } from './useNotification';
import { MODE_LABELS, formatTime } from '@/lib/constants';

export function useTimer() {
    const { isRunning, tick, timeRemaining, mode, settings, completeSession } = useTimerStore();
    const { logSession } = useSessionStore();
    const { activePresetId } = usePresetStore();
    const { activeTaskId, incrementTaskPomodoro } = useTaskStore();
    const { playNotification, stopNotification } = useAudio();
    const { sendNotification } = useNotification();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const prevTimeRef = useRef(timeRemaining);
    const sessionStartRef = useRef<number | null>(null);
    const [pipWindow, setPipWindow] = useState<Window | null>(null);

    // Track session start and stop alarm when timer starts
    useEffect(() => {
        if (isRunning && sessionStartRef.current === null) {
            sessionStartRef.current = Date.now();
            stopNotification(); // Stop alarm when user starts timer
        } else if (!isRunning) {
            sessionStartRef.current = null;
        }
    }, [isRunning, stopNotification]);

    // Handle timer completion
    const handleComplete = useCallback(() => {
        playNotification();

        const nextMode = mode === 'focus'
            ? 'Time for a break!'
            : 'Break is over. Ready to focus?';
        sendNotification(
            `${MODE_LABELS[mode]} Complete!`,
            nextMode
        );

        const duration = mode === 'focus'
            ? settings.focusDuration
            : mode === 'shortBreak'
                ? settings.shortBreakDuration
                : settings.longBreakDuration;

        logSession({
            type: mode,
            duration,
            presetId: activePresetId || undefined,
        });

        if (mode === 'focus' && activeTaskId) {
            incrementTaskPomodoro(activeTaskId);
        }

        completeSession();
    }, [playNotification, sendNotification, mode, settings, logSession, activePresetId, activeTaskId, incrementTaskPomodoro, completeSession]);

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                tick();
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, tick]);

    // Check for completion
    useEffect(() => {
        if (prevTimeRef.current > 0 && timeRemaining === 0) {
            handleComplete();
        }
        prevTimeRef.current = timeRemaining;
    }, [timeRemaining, handleComplete]);

    // Update document title with timer
    useEffect(() => {
        const timeStr = formatTime(timeRemaining);
        const modeStr = mode === 'focus' ? '🍅' : '☕';
        document.title = `${timeStr} ${modeStr} Pomodoro`;
    }, [timeRemaining, mode]);

    // Update PiP window content if open
    useEffect(() => {
        if (pipWindow && !pipWindow.closed) {
            const timeStr = formatTime(timeRemaining);
            const bgColor = mode === 'focus' ? '#FFF5F5' : '#F0FFF4';
            const accentColor = mode === 'focus' ? '#FF6B6B' : '#51CF66';
            const modeLabel = MODE_LABELS[mode];

            pipWindow.document.body.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background: ${bgColor};
          font-family: system-ui, -apple-system, sans-serif;
          margin: 0;
          padding: 0;
        ">
          <div style="font-size: 14px; color: #666; margin-bottom: 4px;">${modeLabel}</div>
          <div style="font-size: 48px; font-weight: 700; color: #333; font-family: monospace;">${timeStr}</div>
          <div style="
            width: 60%;
            height: 6px;
            background: #E5E7EB;
            border-radius: 3px;
            margin-top: 12px;
            overflow: hidden;
          ">
            <div style="
              width: ${((1 - timeRemaining / (mode === 'focus' ? settings.focusDuration : mode === 'shortBreak' ? settings.shortBreakDuration : settings.longBreakDuration)) * 100)}%;
              height: 100%;
              background: ${accentColor};
              border-radius: 3px;
              transition: width 0.3s ease;
            "></div>
          </div>
        </div>
      `;
        }
    }, [timeRemaining, mode, pipWindow, settings]);

    // Open Picture-in-Picture when tab is hidden
    const openPiP = useCallback(async () => {
        // Check if Document PiP is supported
        if ('documentPictureInPicture' in window) {
            try {
                // @ts-ignore - Document PiP API is experimental
                const pip = await window.documentPictureInPicture.requestWindow({
                    width: 300,
                    height: 200,
                });
                setPipWindow(pip);

                pip.addEventListener('pagehide', () => {
                    setPipWindow(null);
                });
            } catch (error) {
                console.log('PiP not available:', error);
            }
        }
    }, []);

    // Close PiP when returning to tab
    const closePiP = useCallback(() => {
        if (pipWindow && !pipWindow.closed) {
            pipWindow.close();
            setPipWindow(null);
        }
    }, [pipWindow]);

    // Auto open/close PiP based on visibility
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (isRunning) {
                if (document.hidden) {
                    openPiP();
                } else {
                    closePiP();
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isRunning, openPiP, closePiP]);

    // Clean up PiP on unmount
    useEffect(() => {
        return () => {
            if (pipWindow && !pipWindow.closed) {
                pipWindow.close();
            }
        };
    }, [pipWindow]);

    return { isRunning, timeRemaining, mode, openPiP, closePiP, isPipOpen: !!pipWindow };
}
