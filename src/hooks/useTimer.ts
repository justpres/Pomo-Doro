'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useTimerStore } from '@/store/timerStore';
import { useAudio } from './useAudio';
import { useNotification } from './useNotification';
import { MODE_LABELS, formatTime } from '@/lib/constants';

export function useTimer() {
    const isRunning = useTimerStore((s) => s.isRunning);
    const sync = useTimerStore((s) => s.sync);
    const timeRemaining = useTimerStore((s) => s.timeRemaining);
    const mode = useTimerStore((s) => s.mode);
    const sessionDuration = useTimerStore((s) => s.sessionDuration);
    const lastCompletion = useTimerStore((s) => s.lastCompletion);

    const { playNotification, stopNotification } = useAudio();
    const { sendNotification } = useNotification();

    const [pipWindow, setPipWindow] = useState<Window | null>(null);
    const pipElementsRef = useRef<{
        container: HTMLElement | null;
        mode: HTMLElement | null;
        time: HTMLElement | null;
        bar: HTMLElement | null;
    }>({ container: null, mode: null, time: null, bar: null });

    const prevCompletionIdRef = useRef<string | null>(null);

    // Stop alarm when user starts timer
    useEffect(() => {
        if (isRunning) {
            stopNotification();
        }
    }, [isRunning, stopNotification]);

    // React to session completions
    useEffect(() => {
        if (!lastCompletion) return;
        if (lastCompletion.id !== prevCompletionIdRef.current) {
            prevCompletionIdRef.current = lastCompletion.id;
            if (!lastCompletion.silent) {
                playNotification();
                const nextModeMsg = lastCompletion.mode === 'focus'
                    ? 'Time for a break!'
                    : 'Break is over. Ready to focus?';
                sendNotification(
                    `${MODE_LABELS[lastCompletion.mode]} Complete!`,
                    nextModeMsg
                );
            }
        }
    }, [lastCompletion, playNotification, sendNotification]);

    // Interval sync while running
    useEffect(() => {
        if (!isRunning) return;

        sync();
        const intervalId = setInterval(() => {
            sync();
        }, 250);

        return () => clearInterval(intervalId);
    }, [isRunning, sync]);

    // Sync on tab visibility change or focus
    useEffect(() => {
        const handleSync = () => {
            sync();
        };

        window.addEventListener('focus', handleSync);
        document.addEventListener('visibilitychange', handleSync);

        return () => {
            window.removeEventListener('focus', handleSync);
            document.removeEventListener('visibilitychange', handleSync);
        };
    }, [sync]);

    // Update document title with timer
    useEffect(() => {
        const timeStr = formatTime(timeRemaining);
        const modeStr = mode === 'focus' ? 'Focus' : 'Break';
        document.title = `${timeStr} [${modeStr}] Pomodoro`;
    }, [timeRemaining, mode]);

    // Update PiP window content if open
    useEffect(() => {
        if (pipWindow && !pipWindow.closed) {
            const timeStr = formatTime(timeRemaining);
            const bgColor = mode === 'focus' ? '#FFF5F5' : '#F0FFF4';
            const accentColor = mode === 'focus' ? '#FF6B6B' : '#51CF66';
            const modeLabel = MODE_LABELS[mode];

            const els = pipElementsRef.current;
            if (els.container && els.mode && els.time && els.bar) {
                els.container.style.backgroundColor = bgColor;
                els.mode.textContent = modeLabel;
                els.time.textContent = timeStr;
                const ratio = sessionDuration > 0 ? (1 - timeRemaining / sessionDuration) * 100 : 0;
                els.bar.style.width = `${Math.min(100, Math.max(0, ratio))}%`;
                els.bar.style.backgroundColor = accentColor;
            }
        }
    }, [timeRemaining, mode, pipWindow, sessionDuration]);

    // Open Picture-in-Picture
    const openPiP = useCallback(async () => {
        if (typeof window !== 'undefined' && window.documentPictureInPicture) {
            try {
                const pip = await window.documentPictureInPicture.requestWindow({
                    width: 300,
                    height: 200,
                });

                const doc = pip.document;
                doc.body.style.margin = '0';
                doc.body.style.padding = '0';

                const container = doc.createElement('div');
                container.style.cssText = `
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    font-family: system-ui, -apple-system, sans-serif;
                    background: ${mode === 'focus' ? '#FFF5F5' : '#F0FFF4'};
                `;

                const modeEl = doc.createElement('div');
                modeEl.style.cssText = 'font-size: 14px; color: #666; margin-bottom: 4px;';
                modeEl.textContent = MODE_LABELS[mode];

                const timeEl = doc.createElement('div');
                timeEl.style.cssText = 'font-size: 48px; font-weight: 700; color: #333; font-family: monospace;';
                timeEl.textContent = formatTime(timeRemaining);

                const barTrack = doc.createElement('div');
                barTrack.style.cssText = 'width: 60%; height: 6px; background: #E5E7EB; border-radius: 3px; margin-top: 12px; overflow: hidden;';

                const bar = doc.createElement('div');
                const initialRatio = sessionDuration > 0 ? (1 - timeRemaining / sessionDuration) * 100 : 0;
                bar.style.cssText = `
                    width: ${Math.min(100, Math.max(0, initialRatio))}%;
                    height: 100%;
                    background: ${mode === 'focus' ? '#FF6B6B' : '#51CF66'};
                    border-radius: 3px;
                    transition: width 0.3s ease;
                `;
                barTrack.appendChild(bar);

                container.appendChild(modeEl);
                container.appendChild(timeEl);
                container.appendChild(barTrack);
                doc.body.appendChild(container);

                pipElementsRef.current = {
                    container,
                    mode: modeEl,
                    time: timeEl,
                    bar,
                };

                setPipWindow(pip);

                pip.addEventListener('pagehide', () => {
                    pipElementsRef.current = { container: null, mode: null, time: null, bar: null };
                    setPipWindow(null);
                });
            } catch (error) {
                console.log('PiP not available:', error);
            }
        }
    }, [mode, timeRemaining, sessionDuration]);

    // Close PiP
    const closePiP = useCallback(() => {
        if (pipWindow && !pipWindow.closed) {
            pipWindow.close();
            pipElementsRef.current = { container: null, mode: null, time: null, bar: null };
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
