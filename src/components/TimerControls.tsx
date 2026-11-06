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
        <div className="flex flex-col items-center justify-center mt-3 md:mt-6">
            {/* Primary Controls Row: Symmetrical 3-Part Wings */}
            <div className="relative flex items-center justify-center w-full max-w-sm sm:max-w-md mx-auto">
                {/* Left Wing: Reset Button */}
                <div className="flex-1 flex justify-end">
                    <motion.div
                        animate={{
                            opacity: isZenActive ? 0 : 1,
                        }}
                        style={{ pointerEvents: isZenActive ? 'none' : 'auto' }}
                        transition={{ duration: 0.25 }}
                    >
                        <motion.button
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            onClick={reset}
                            className="btn btn-secondary text-xs sm:text-sm md:text-base cursor-pointer px-3 sm:px-4 whitespace-nowrap"
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
                        className="btn btn-primary min-w-[120px] sm:min-w-[130px] md:min-w-[140px] text-sm sm:text-base md:text-lg font-semibold cursor-pointer shadow-xs whitespace-nowrap"
                    >
                        {isRunning ? 'Pause' : 'Start'}
                    </motion.button>
                </div>

                {/* Right Wing: Skip Button */}
                <div className="flex-1 flex justify-start">
                    <motion.div
                        animate={{
                            opacity: isZenActive ? 0 : 1,
                        }}
                        style={{ pointerEvents: isZenActive ? 'none' : 'auto' }}
                        transition={{ duration: 0.25 }}
                    >
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

            {/* Ready-to-Resume Note: Centered below controls when paused mid-session */}
            <AnimatePresence>
                {isMidSessionPaused && onLeaveResumptionNote && (
                    <motion.button
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={onLeaveResumptionNote}
                        className="mt-3 inline-flex items-center px-3.5 py-1 rounded-full text-xs font-medium text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-50 border border-stone-200/80 shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
                        title="Leave a Ready-to-Resume note to clear attention residue"
                    >
                        Resume Note
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}
