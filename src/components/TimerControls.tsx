'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTimerStore } from '@/store/timerStore';

const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
};

interface TimerControlsProps {
    onStartRequested?: () => void;
    onLeaveResumptionNote?: () => void;
}

export function TimerControls({ onStartRequested, onLeaveResumptionNote }: TimerControlsProps) {
    const {
        isRunning,
        start,
        pause,
        reset,
        skip,
        mode,
        currentIntention,
        settings,
        timeRemaining,
        sessionDuration,
        isZenActive,
    } = useTimerStore();

    const handleStartClick = () => {
        if (isRunning) {
            pause();
            return;
        }

        // If in focus mode and user hasn't set an intention and prompt is enabled, trigger modal
        if (
            mode === 'focus' &&
            settings.promptIntention !== false &&
            !currentIntention &&
            onStartRequested
        ) {
            onStartRequested();
            return;
        }

        start();
    };

    const isMidSessionPaused = mode === 'focus' && !isRunning && timeRemaining < sessionDuration;

    return (
        <div className="relative flex items-center justify-center w-full max-w-md mx-auto mt-3 md:mt-6">
            {/* Left Wing: Reset Button (flex-1 guarantees exact center alignment of Start/Pause) */}
            <div className="flex-1 flex justify-end">
                <motion.div
                    animate={{
                        opacity: isZenActive ? 0 : 1,
                    }}
                    style={{ pointerEvents: isZenActive ? 'none' : 'auto' }}
                    transition={{ duration: 0.25 }}
                    className="flex items-center"
                >
                    <motion.button
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                        onClick={reset}
                        className="btn btn-secondary text-xs sm:text-sm md:text-base cursor-pointer px-3 sm:px-4"
                    >
                        Reset
                    </motion.button>
                </motion.div>
            </div>

            {/* Center: Start/Pause Button (Locked in the mathematical center of screen & timer ring) */}
            <div className="px-3 sm:px-4 flex justify-center flex-shrink-0">
                <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={handleStartClick}
                    className="btn btn-primary min-w-[120px] sm:min-w-[130px] md:min-w-[140px] text-sm sm:text-base md:text-lg font-semibold cursor-pointer shadow-xs"
                >
                    {isRunning ? 'Pause' : 'Start'}
                </motion.button>
            </div>

            {/* Right Wing: Secondary Actions (flex-1 matches Left Wing width exactly) */}
            <div className="flex-1 flex justify-start">
                <motion.div
                    animate={{
                        opacity: isZenActive ? 0 : 1,
                    }}
                    style={{ pointerEvents: isZenActive ? 'none' : 'auto' }}
                    transition={{ duration: 0.25 }}
                    className="flex items-center gap-1.5 sm:gap-2"
                >
                    {/* Ready-to-Resume Note Button (only when paused mid-session) */}
                    {isMidSessionPaused && onLeaveResumptionNote && (
                        <motion.button
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            onClick={onLeaveResumptionNote}
                            className="btn btn-secondary text-xs md:text-sm text-stone-700 border-stone-200 bg-white hover:bg-stone-50 cursor-pointer flex items-center gap-1.5 shadow-2xs"
                            title="Leave a Ready-to-Resume note to clear attention residue"
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-500">
                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                            </svg>
                            <span>Resume Note</span>
                        </motion.button>
                    )}

                    {/* Skip Button */}
                    <motion.button
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                        onClick={skip}
                        className="btn btn-secondary text-xs sm:text-sm md:text-base cursor-pointer whitespace-nowrap px-3 sm:px-4"
                    >
                        Skip
                    </motion.button>
                </motion.div>
            </div>
        </div>
    );
}
