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
import { useState, useEffect, useCallback, useRef } from 'react';

const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
};

const timerVariants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
};

// Fullscreen icon component
const FullscreenIcon = ({ isFullscreen }: { isFullscreen: boolean }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    const { mode, timeRemaining, pomodoroCount, settings, totalPomodorosToday } = useTimerStore();
    const { activeTaskId, tasks } = useTaskStore();
    const { getLastSessionId, updateSessionQuality } = useSessionStore();
    const [isMobile, setIsMobile] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showRating, setShowRating] = useState(false);
    const prevModeRef = useRef(mode);
    // Timer logic is now handled globally by TimerProvider

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Show rating modal when focus session completes
    useEffect(() => {
        if (prevModeRef.current === 'focus' && mode !== 'focus') {
            setShowRating(true);
        }
        prevModeRef.current = mode;
    }, [mode]);

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

    const totalDuration =
        mode === 'focus'
            ? settings.focusDuration
            : mode === 'shortBreak'
                ? settings.shortBreakDuration
                : settings.longBreakDuration;
    const progress = 1 - timeRemaining / totalDuration;

    const ringSize = isMobile ? 200 : 320;
    const ringStroke = isMobile ? 5 : 8;

    return (
        <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
            style={{
                backgroundColor: MODE_COLORS[mode],
                transition: 'background-color 0.5s ease',
                paddingTop: isMobile ? '50px' : '60px',
                paddingBottom: isMobile ? '70px' : '20px',
            }}
        >
            {/* Fullscreen button - Desktop only */}
            {!isMobile && (
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleFullscreen}
                    className="absolute top-20 left-6 p-2 rounded-full"
                    style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        color: 'var(--text-muted)',
                    }}
                    title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                >
                    <FullscreenIcon isFullscreen={isFullscreen} />
                </motion.button>
            )}

            {/* Mode Indicator */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={mode}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-base md:text-2xl font-medium"
                    style={{ color: 'var(--text-light)' }}
                >
                    {MODE_LABELS[mode]}
                </motion.div>
            </AnimatePresence>

            {/* Timer Display with Progress Ring */}
            <div className="relative flex items-center justify-center my-2 md:my-4">
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
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="absolute timer-display"
                    style={{
                        color: 'var(--text-dark)',
                        fontSize: isMobile ? '2.5rem' : undefined,
                    }}
                >
                    {formatTime(timeRemaining)}
                </motion.div>
            </div>

            {/* Active Task Display */}
            {activeTask && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-3 py-1 rounded-full max-w-[85%]"
                    style={{ backgroundColor: 'rgba(255, 107, 107, 0.15)' }}
                >
                    <p className="text-[11px] md:text-sm font-medium truncate flex items-center gap-1.5" style={{ color: 'var(--primary-dark)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                        {activeTask.title}
                        <span className="ml-1" style={{ color: 'var(--text-muted)' }}>
                            ({activeTask.actualPomodoros}/{activeTask.estimatedPomodoros})
                        </span>
                    </p>
                </motion.div>
            )}

            {/* Pomodoro Counter + Today's Streak */}
            <div className="flex items-center gap-3 mt-1 md:mt-4">
                <span className="text-xs md:text-lg font-medium" style={{ color: 'var(--text-light)' }}>
                    Session {Math.min(pomodoroCount + 1, settings.pomodorosBeforeLongBreak)} of {settings.pomodorosBeforeLongBreak}
                </span>
                <span className="text-xs md:text-base" style={{ color: 'var(--text-muted)' }}>•</span>
                <span className="text-xs md:text-lg font-semibold" style={{ color: 'var(--primary)' }}>
                    Today {totalPomodorosToday} 🍅
                </span>
            </div>

            {/* Break Activity Suggestion */}
            <BreakSuggestions mode={mode} />

            {/* Controls */}
            <TimerControls />

            {/* Session Rating Modal */}
            <SessionRatingModal
                isOpen={showRating}
                onClose={() => setShowRating(false)}
                onRate={(rating) => {
                    const lastId = getLastSessionId();
                    if (lastId) updateSessionQuality(lastId, rating);
                }}
            />
        </motion.div>
    );
}
