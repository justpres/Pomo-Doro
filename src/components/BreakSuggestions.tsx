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
}

export function BreakSuggestions({ mode }: BreakSuggestionsProps) {
    const pomodoroCount = useTimerStore((s) => s.pomodoroCount);

    const isBreak = mode !== 'focus';
    const activities = mode === 'shortBreak' ? shortBreakActivities : longBreakActivities;
    const suggestionText = activities[pomodoroCount % activities.length];

    return (
        <div className="h-6 flex items-center justify-center mt-1 md:mt-2">
            <AnimatePresence mode="wait">
                {isBreak && (
                    <motion.p
                        key={`${mode}-${pomodoroCount}`}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                        className="text-xs text-stone-500 font-normal tracking-wide text-center"
                    >
                        <span className="text-stone-400">Activity: </span>
                        <span className="text-stone-700 font-medium">{suggestionText}</span>
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}
