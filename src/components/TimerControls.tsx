'use client';

import { motion } from 'framer-motion';
import { useTimerStore } from '@/store/timerStore';

const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
};

export function TimerControls() {
    const { isRunning, start, pause, reset, skip, mode } = useTimerStore();

    return (
        <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 mt-4 md:mt-8">
            {/* Start/Pause Button - Always prominent */}
            <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={isRunning ? pause : start}
                className="btn btn-primary w-full md:w-auto min-w-[140px] md:min-w-[120px] text-base md:text-lg font-semibold"
            >
                {isRunning ? 'Pause' : 'Start'}
            </motion.button>

            {/* Secondary buttons row */}
            <div className="flex gap-3">
                {/* Reset Button */}
                <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={reset}
                    className="btn btn-secondary text-sm md:text-base"
                >
                    Reset
                </motion.button>

                {/* Skip Button */}
                <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={skip}
                    className="btn btn-secondary text-sm md:text-base"
                >
                    {mode === 'focus' ? 'Skip Break' : 'Skip Focus'}
                </motion.button>
            </div>
        </div>
    );
}
