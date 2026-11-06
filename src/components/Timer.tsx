'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTimerStore } from '@/store/timerStore';
import { useTaskStore } from '@/store/taskStore';
import { formatTime, MODE_LABELS, MODE_COLORS } from '@/lib/constants';
import { ProgressRing } from './ProgressRing';
import { TimerControls } from './TimerControls';
import { BreakSuggestions } from './BreakSuggestions';
import { SessionRatingModal } from './SessionRatingModal';
import { useSessionStore } from '@/store/sessionStore';
import { useState, useEffect, useCallback } from 'react';

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

    const activeTaskId = useTaskStore((s) => s.activeTaskId);
    const tasks = useTaskStore((s) => s.tasks);

    const todayPomodoros = useSessionStore((s) => s.getTodayStats().pomodoros);
    const pendingRatingId = useSessionStore((s) => s.pendingRatingId);
    const updateSessionQuality = useSessionStore((s) => s.updateSessionQuality);
    const clearPendingRating = useSessionStore((s) => s.clearPendingRating);

    const [isMobile, setIsMobile] = useState(false);
    const [screenHeight, setScreenHeight] = useState(800);
    const [isFullscreen, setIsFullscreen] = useState(false);

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
                    animate={{ opacity: 1 }}
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
                    className="px-3.5 py-1 rounded-full max-w-[85%] bg-rose-50/80 border border-rose-200/60 shadow-xs"
                >
                    <p className="text-[11px] md:text-xs font-medium truncate flex items-center gap-1.5 text-rose-900">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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

            {/* Pomodoro Counter + Today's Streak */}
            <div className="flex items-center gap-2 mt-1 md:mt-2 text-xs md:text-sm text-stone-600">
                <span className="font-medium text-stone-700">
                    Session {Math.min(pomodoroCount + 1, perCycle)} of {perCycle}
                </span>
                <span className="text-stone-300">•</span>
                <span className="font-medium text-[#FF6363]">
                    Today: {todayPomodoros} {todayPomodoros === 1 ? 'session' : 'sessions'}
                </span>
            </div>

            {/* Break Activity Suggestion (stable-height slot, zero layout jump) */}
            <BreakSuggestions mode={mode} />

            {/* Controls */}
            <TimerControls />

            {/* Session Rating Modal */}
            <SessionRatingModal
                isOpen={!!pendingRatingId}
                onClose={() => clearPendingRating()}
                onRate={(rating) => {
                    if (pendingRatingId) {
                        updateSessionQuality(pendingRatingId, rating);
                        clearPendingRating();
                    }
                }}
            />
        </motion.div>
    );
}
