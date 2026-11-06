'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { TimerMode } from '@/lib/constants';
import { useTimerStore } from '@/store/timerStore';

const shortBreakActivities = [
    'Stretch your arms and neck',
    'Look away from the screen into the distance',
    'Take a few deep breaths and hydrate',
    'Drink a glass of water',
    'Stand up and take a quick posture check',
];

const longBreakActivities = [
    'Take a short walk outside for fresh air',
    'Enjoy a healthy snack or warm beverage',
    'Do some light stretching exercises',
    'Step away completely from all digital screens',
    'Listen to calming ambient music',
];

interface BreakSuggestionsProps {
    mode: TimerMode;
    onOpenBreathwork?: () => void;
}

export function BreakSuggestions({ mode, onOpenBreathwork }: BreakSuggestionsProps) {
    const pomodoroCount = useTimerStore((s) => s.pomodoroCount);

    const isBreak = mode !== 'focus';
    const activities = mode === 'shortBreak' ? shortBreakActivities : longBreakActivities;
    const suggestionText = activities[pomodoroCount % activities.length];

    return (
        <div className="min-h-7 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2.5 mt-1 md:mt-2">
            <AnimatePresence mode="wait">
                {isBreak && (
                    <motion.div
                        key={`${mode}-${pomodoroCount}`}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 text-center"
                    >
                        <p className="text-xs text-stone-600 font-medium tracking-wide">
                            {suggestionText}
                        </p>

                        {onOpenBreathwork && (
                            <div className="relative group inline-flex items-center">
                                <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.08 }}
                                    whileTap={{ scale: 0.92 }}
                                    onClick={onOpenBreathwork}
                                    className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer border border-transparent hover:border-stone-200/60"
                                    aria-label="30s breathing exercise"
                                >
                                    <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                        className="text-stone-500"
                                    >
                                        <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
                                        <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
                                        <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
                                    </svg>
                                </motion.button>

                                {/* Floating Note / Tooltip */}
                                <div
                                    role="tooltip"
                                    className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-150 ease-out z-30 translate-y-0.5 group-hover:translate-y-0"
                                >
                                    <div className="bg-stone-900 text-stone-100 text-[10px] font-medium py-0.5 px-2 rounded-md shadow-md whitespace-nowrap">
                                        30s Breath
                                    </div>
                                    <div className="w-0 h-0 border-x-3 border-x-transparent border-t-3 border-t-stone-900 mx-auto" />
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
