'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTimerStore } from '@/store/timerStore';
import { useTaskStore } from '@/store/taskStore';
import { formatTime, MODE_LABELS, MODE_COLORS } from '@/lib/constants';
import { ProgressRing } from './ProgressRing';
import { TimerControls } from './TimerControls';
import { BreakSuggestions } from './BreakSuggestions';
import { BreakBreathingGuide } from './BreakBreathingGuide';
import { ThoughtParkingModal } from './ThoughtParkingModal';
import { IntentionModal } from './IntentionModal';
import { ResumptionModal } from './ResumptionModal';
import { SessionRatingModal } from './SessionRatingModal';
import { useSessionStore } from '@/store/sessionStore';
import { useThoughtStore } from '@/store/thoughtStore';
import { useState, useEffect, useCallback, useRef } from 'react';

const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
};

const timerVariants = {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
};

// Fullscreen icon component
const FullscreenIcon = ({ isFullscreen }: { isFullscreen: boolean }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {isFullscreen ? (
            <>
                <path d="M8 3v3a2 2 0 0 1-2 2H3" />
                <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
                <path d="M3 16h3a2 2 0 0 1 2 2v3" />
                <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
            </>
        ) : (
            <>
                <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
            </>
        )}
    </svg>
);

export function Timer() {
    const mode = useTimerStore((s) => s.mode);
    const timeRemaining = useTimerStore((s) => s.timeRemaining);
    const sessionDuration = useTimerStore((s) => s.sessionDuration);
    const pomodoroCount = useTimerStore((s) => s.pomodoroCount);
    const perCycle = useTimerStore((s) => s.settings.pomodorosBeforeLongBreak);
    const zenModeEnabled = useTimerStore((s) => s.settings.zenModeEnabled !== false);
    const isRunning = useTimerStore((s) => s.isRunning);
    const isZenActive = useTimerStore((s) => s.isZenActive);
    const setZenActive = useTimerStore((s) => s.setZenActive);
    const currentIntention = useTimerStore((s) => s.currentIntention);
    const setIntention = useTimerStore((s) => s.setIntention);
    const resumptionCue = useTimerStore((s) => s.resumptionCue);
    const setResumptionCue = useTimerStore((s) => s.setResumptionCue);
    const clearResumptionCue = useTimerStore((s) => s.clearResumptionCue);
    const startTimer = useTimerStore((s) => s.start);

    const activeTaskId = useTaskStore((s) => s.activeTaskId);
    const tasks = useTaskStore((s) => s.tasks);

    const todayPomodoros = useSessionStore((s) => s.getTodayStats().pomodoros);
    const pendingRatingId = useSessionStore((s) => s.pendingRatingId);
    const updateSessionQuality = useSessionStore((s) => s.updateSessionQuality);
    const clearPendingRating = useSessionStore((s) => s.clearPendingRating);
    const autoOpenBreathwork = useTimerStore((s) => s.settings.autoOpenBreathwork);
    const parkedThoughtsCount = useThoughtStore((s) => s.getParkedCount());

    const [isMobile, setIsMobile] = useState(false);
    const [screenHeight, setScreenHeight] = useState(800);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showBreathwork, setShowBreathwork] = useState(false);
    const [showThoughtModal, setShowThoughtModal] = useState(false);
    const [showIntentionModal, setShowIntentionModal] = useState(false);
    const [showResumptionModal, setShowResumptionModal] = useState(false);
    const prevModeRef = useRef(mode);
    const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Deep Focus Zen Mode: Inactivity detection (3s timeout during focus running)
    useEffect(() => {
        const anyModalOpen =
            showThoughtModal ||
            showIntentionModal ||
            showResumptionModal ||
            showBreathwork ||
            !!pendingRatingId;

        if (!isRunning || mode !== 'focus' || !zenModeEnabled || anyModalOpen) {
            if (inactivityTimeoutRef.current) {
                clearTimeout(inactivityTimeoutRef.current);
                inactivityTimeoutRef.current = null;
            }
            if (useTimerStore.getState().isZenActive) {
                setZenActive(false);
            }
            return;
        }

        let lastActivityTime = 0;
        const handleUserActivity = () => {
            const now = Date.now();
            if (useTimerStore.getState().isZenActive) {
                setZenActive(false);
            }

            // Throttle timer rescheduling to avoid clearing/setting on every mousemove tick
            if (now - lastActivityTime < 250) {
                return;
            }
            lastActivityTime = now;

            if (inactivityTimeoutRef.current) {
                clearTimeout(inactivityTimeoutRef.current);
            }

            inactivityTimeoutRef.current = setTimeout(() => {
                const s = useTimerStore.getState();
                if (s.isRunning && s.mode === 'focus' && s.settings.zenModeEnabled !== false) {
                    setZenActive(true);
                }
            }, 3000);
        };

        // Start initial 3s countdown
        inactivityTimeoutRef.current = setTimeout(() => {
            const s = useTimerStore.getState();
            if (s.isRunning && s.mode === 'focus' && s.settings.zenModeEnabled !== false) {
                setZenActive(true);
            }
        }, 3000);

        window.addEventListener('mousemove', handleUserActivity, { passive: true });
        window.addEventListener('mousedown', handleUserActivity, { passive: true });
        window.addEventListener('keydown', handleUserActivity, { passive: true });
        window.addEventListener('touchstart', handleUserActivity, { passive: true });
        window.addEventListener('scroll', handleUserActivity, { passive: true });

        return () => {
            if (inactivityTimeoutRef.current) {
                clearTimeout(inactivityTimeoutRef.current);
                inactivityTimeoutRef.current = null;
            }
            window.removeEventListener('mousemove', handleUserActivity);
            window.removeEventListener('mousedown', handleUserActivity);
            window.removeEventListener('keydown', handleUserActivity);
            window.removeEventListener('touchstart', handleUserActivity);
            window.removeEventListener('scroll', handleUserActivity);
        };
    }, [
        isRunning,
        mode,
        zenModeEnabled,
        showThoughtModal,
        showIntentionModal,
        showResumptionModal,
        showBreathwork,
        pendingRatingId,
        setZenActive,
    ]);

    // Ensure zen mode is deactivated on component unmount
    useEffect(() => {
        return () => {
            useTimerStore.getState().setZenActive(false);
        };
    }, []);

    // Global shortcut: press P to park a thought, F to toggle fullscreen
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement | null;
            if (
                target &&
                (target.tagName === 'INPUT' ||
                    target.tagName === 'TEXTAREA' ||
                    target.isContentEditable)
            ) {
                return;
            }

            if ((e.key === 'p' || e.key === 'P') && !e.metaKey && !e.ctrlKey && !e.altKey) {
                e.preventDefault();
                setShowThoughtModal((prev) => !prev);
            }

            if ((e.key === 'f' || e.key === 'F') && !e.metaKey && !e.ctrlKey && !e.altKey) {
                e.preventDefault();
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(() => {});
                } else {
                    document.exitFullscreen().catch(() => {});
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (prevModeRef.current === 'focus' && mode !== 'focus' && autoOpenBreathwork) {
            setShowBreathwork(true);
        }
        prevModeRef.current = mode;
    }, [mode, autoOpenBreathwork]);

    useEffect(() => {
        const updateDimensions = () => {
            setIsMobile(window.innerWidth < 768);
            setScreenHeight(window.innerHeight);
        };
        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    // Listen for fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }, []);

    const activeTask = activeTaskId ? tasks.find((t) => t.id === activeTaskId) : null;
    const progress = sessionDuration > 0 ? 1 - timeRemaining / sessionDuration : 0;

    // Responsive ring sizing that guarantees top clearance below the navigation pill on compact heights
    const ringSize = isMobile ? 200 : (screenHeight < 760 ? 250 : 290);
    const ringStroke = isMobile ? 5 : (screenHeight < 760 ? 7 : 8);

    return (
        <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden px-4"
            style={{
                backgroundColor: MODE_COLORS[mode],
                transition: 'background-color 0.5s ease',
                paddingTop: isMobile ? '76px' : '124px',
                paddingBottom: isMobile ? '80px' : '36px',
            }}
        >
            {/* Fullscreen button - Desktop only */}
            {!isMobile && (
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{
                        opacity: isZenActive ? 0 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                    style={{ pointerEvents: isZenActive ? 'none' : 'auto' }}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={toggleFullscreen}
                    className="absolute top-6 left-6 p-2 rounded-full bg-white/80 backdrop-blur-sm border border-stone-200/60 shadow-xs text-stone-600 hover:text-stone-900 transition-colors"
                    title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                    aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                >
                    <FullscreenIcon isFullscreen={isFullscreen} />
                </motion.button>
            )}

            {/* Desktop Thought Parking Button (Icon button with floating note, matching Fullscreen button) */}
            {!isMobile && (
                <div className="absolute top-6 right-6 z-20 group">
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: isZenActive ? 0 : 1,
                        }}
                        transition={{ duration: 0.3 }}
                        style={{ pointerEvents: isZenActive ? 'none' : 'auto' }}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => setShowThoughtModal(true)}
                        className="relative p-2 rounded-full bg-white/80 backdrop-blur-sm border border-stone-200/60 shadow-xs text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
                        aria-label="Park Thought"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>

                        {/* Badge for parked thoughts count */}
                        {parkedThoughtsCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-white text-[9px] font-bold shadow-xs">
                                {parkedThoughtsCount}
                            </span>
                        )}
                    </motion.button>

                    {/* Floating Note (Tooltip) */}
                    <div
                        role="tooltip"
                        className="pointer-events-none absolute top-full right-0 mt-1.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-150 ease-out z-30 translate-y-0.5 group-hover:translate-y-0"
                    >
                        <div className="bg-stone-900 text-stone-100 text-[11px] font-normal py-1 px-2.5 rounded-lg shadow-xl border border-stone-800 whitespace-nowrap flex items-center gap-1.5">
                            <span>Park Thought</span>
                            <kbd className="px-1 py-0.2 rounded bg-stone-800 border border-stone-700 text-[9px] font-mono text-stone-300">
                                P
                            </kbd>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Thought Parking Button */}
            {isMobile && (
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{
                        opacity: isZenActive ? 0 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                    style={{ pointerEvents: isZenActive ? 'none' : 'auto' }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setShowThoughtModal(true)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/90 backdrop-blur-sm border border-stone-200/80 shadow-xs text-stone-700 relative"
                    aria-label="Thought Parking Lot"
                >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                    {parkedThoughtsCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-white text-[9px] font-bold">
                            {parkedThoughtsCount}
                        </span>
                    )}
                </motion.button>
            )}

            {/* Mode Indicator with stable height container */}
            <div className="h-8 flex items-center justify-center mb-1">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={mode}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.2 }}
                        className="text-base md:text-xl font-semibold tracking-tight text-stone-800 select-none"
                    >
                        {MODE_LABELS[mode]}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Timer Display with Progress Ring */}
            <div className="relative flex items-center justify-center my-1 md:my-3">
                <ProgressRing
                    progress={progress}
                    size={ringSize}
                    strokeWidth={ringStroke}
                    color={mode === 'focus' ? 'var(--primary)' : 'var(--success)'}
                    mode={mode}
                />

                {/* Timer Numbers */}
                <motion.div
                    variants={timerVariants}
                    initial="initial"
                    animate="animate"
                    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                    className="absolute timer-display font-semibold select-none"
                    style={{
                        color: 'var(--text-dark)',
                        fontSize: isMobile ? '2.5rem' : (screenHeight < 760 ? '3rem' : '3.75rem'),
                        letterSpacing: '-0.02em',
                    }}
                >
                    {formatTime(timeRemaining)}
                </motion.div>
            </div>

            {/* Active Task Display */}
            {activeTask ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="px-3.5 py-1 rounded-full max-w-[85%] bg-white border border-stone-200/90 shadow-2xs"
                >
                    <p className="text-[11px] md:text-xs font-medium truncate flex items-center gap-1.5 text-stone-800">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-stone-500">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                        <span className="truncate">{activeTask.title}</span>
                        <span className="text-stone-400 font-normal">
                            ({activeTask.actualPomodoros}/{activeTask.estimatedPomodoros})
                        </span>
                    </p>
                </motion.div>
            ) : null}

            {/* Implementation Intention Anchor (Gollwitzer, 1999) */}
            {currentIntention && mode === 'focus' && (
                <motion.div
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/90 border border-stone-200/80 shadow-2xs max-w-[88%] text-stone-700"
                >
                    <span className="text-[#FF6363] font-bold text-xs select-none">Target:</span>
                    <span className="text-xs font-medium text-stone-800 truncate">{currentIntention}</span>
                    <button
                        onClick={() => setIntention(null)}
                        className="p-0.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 ml-1 transition-colors cursor-pointer"
                        title="Clear sprint target"
                        aria-label="Clear sprint target"
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </motion.div>
            )}

            {/* Ready-to-Resume Anchor (Leroy & Glomb, 2018) */}
            {resumptionCue && (
                <motion.div
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 flex items-center justify-between gap-2 px-3.5 py-1.5 rounded-2xl bg-white border border-stone-200 shadow-2xs max-w-[88%] text-stone-700"
                >
                    <div className="min-w-0 text-left">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block leading-none">
                            Resumption Cue
                        </span>
                        <p className="text-xs font-semibold text-stone-900 truncate mt-0.5">
                            Next: {resumptionCue.nextAction}
                        </p>
                        {resumptionCue.whereLeftOff && (
                            <p className="text-[10px] text-stone-500 truncate leading-tight">
                                Left off: {resumptionCue.whereLeftOff}
                            </p>
                        )}
                    </div>

                    <button
                        onClick={clearResumptionCue}
                        className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors flex-shrink-0 cursor-pointer"
                        title="Dismiss resume note"
                        aria-label="Dismiss resume note"
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </button>
                </motion.div>
            )}

            {/* Pomodoro Counter + Today's Streak (Fades out smoothly in Zen Mode) */}
            <motion.div
                initial={false}
                animate={{
                    opacity: isZenActive ? 0 : 1,
                }}
                transition={{ duration: 0.3 }}
                style={{ pointerEvents: isZenActive ? 'none' : 'auto' }}
                className="flex items-center gap-2 mt-1 md:mt-2 text-xs md:text-sm text-stone-600"
            >
                <span className="font-medium text-stone-700">
                    Session {Math.min(pomodoroCount + 1, perCycle)} of {perCycle}
                </span>
                <span className="text-stone-300">•</span>
                <span className="font-medium text-[#FF6363]">
                    Today: {todayPomodoros} {todayPomodoros === 1 ? 'session' : 'sessions'}
                </span>
            </motion.div>

            {/* Break Activity Suggestion (stable-height slot, zero layout jump) */}
            <BreakSuggestions
                mode={mode}
                onOpenBreathwork={() => setShowBreathwork(true)}
            />

            {/* Controls */}
            <TimerControls
                onStartRequested={() => setShowIntentionModal(true)}
                onLeaveResumptionNote={() => setShowResumptionModal(true)}
            />

            {/* Break Breathing Guide */}
            <BreakBreathingGuide
                isOpen={showBreathwork}
                onClose={() => setShowBreathwork(false)}
                breakTimeRemaining={mode !== 'focus' ? timeRemaining : undefined}
            />

            {/* Session Rating Modal */}
            <SessionRatingModal
                isOpen={!!pendingRatingId}
                onClose={() => clearPendingRating()}
                intention={currentIntention}
                onRate={(rating) => {
                    if (pendingRatingId) {
                        updateSessionQuality(pendingRatingId, rating);
                        clearPendingRating();
                    }
                }}
            />

            {/* Thought Parking Modal */}
            <ThoughtParkingModal
                isOpen={showThoughtModal}
                onClose={() => setShowThoughtModal(false)}
                currentMode={mode}
            />

            {/* Implementation Intention Modal */}
            <IntentionModal
                isOpen={showIntentionModal}
                onClose={() => {
                    setShowIntentionModal(false);
                    startTimer();
                }}
                onConfirm={(intention) => {
                    setIntention(intention);
                    setShowIntentionModal(false);
                    startTimer();
                }}
                currentIntention={currentIntention}
                activeTaskTitle={activeTask?.title}
            />

            {/* Ready-to-Resume Plan Modal (Leroy & Glomb, 2018) */}
            <ResumptionModal
                isOpen={showResumptionModal}
                onClose={() => setShowResumptionModal(false)}
                onSave={(cue) => {
                    setResumptionCue(cue);
                    setShowResumptionModal(false);
                }}
                initialWhereLeftOff={resumptionCue?.whereLeftOff}
                initialNextAction={resumptionCue?.nextAction}
            />
        </motion.div>
    );
}
