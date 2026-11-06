'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { TimerMode } from '@/lib/constants';

const shortBreakActivities = [
    { text: 'Stretch your arms and neck', icon: '🙆' },
    { text: 'Look away from the screen', icon: '👀' },
    { text: 'Take a few deep breaths', icon: '🌬️' },
    { text: 'Drink some water', icon: '💧' },
    { text: 'Stand up and move around', icon: '🚶' },
];

const longBreakActivities = [
    { text: 'Take a short walk outside', icon: '🚶‍♂️' },
    { text: 'Have a healthy snack', icon: '🍎' },
    { text: 'Do some light stretching', icon: '🧘' },
    { text: 'Chat with someone', icon: '💬' },
    { text: 'Rest your eyes away from screens', icon: '😌' },
    { text: 'Listen to some music', icon: '🎵' },
];

interface BreakSuggestionsProps {
    mode: TimerMode;
}

export function BreakSuggestions({ mode }: BreakSuggestionsProps) {
    const [suggestion, setSuggestion] = useState<{ text: string; icon: string } | null>(null);

    useEffect(() => {
        if (mode === 'shortBreak' || mode === 'longBreak') {
            const activities = mode === 'shortBreak' ? shortBreakActivities : longBreakActivities;
            const randomIndex = Math.floor(Math.random() * activities.length);
            setSuggestion(activities[randomIndex]);
        } else {
            setSuggestion(null);
        }
    }, [mode]);

    if (!suggestion || mode === 'focus') return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center mt-2"
            >
                <p className="text-sm" style={{ color: 'var(--text-light)' }}>
                    <span className="mr-1">{suggestion.icon}</span>
                    {suggestion.text}
                </p>
            </motion.div>
        </AnimatePresence>
    );
}
