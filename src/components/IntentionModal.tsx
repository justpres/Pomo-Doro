'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Portal } from './Portal';

interface IntentionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (intention: string) => void;
    currentIntention?: string | null;
    activeTaskTitle?: string;
}

const COMMON_SUGGESTIONS = [
    'Write the next section/function',
    'Solve single bug & pass tests',
    'Review PR / documentation',
    'Outline next chapter / notes',
    'Read 5 focused pages',
];

export function IntentionModal({
    isOpen,
    onClose,
    onConfirm,
    currentIntention,
    activeTaskTitle,
}: IntentionModalProps) {
    const [input, setInput] = useState(currentIntention || '');
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (isOpen) {
            setInput(currentIntention || '');
            const timer = setTimeout(() => {
                inputRef.current?.focus();
                inputRef.current?.select();
            }, 180);
            return () => clearTimeout(timer);
        }
    }, [isOpen, currentIntention]);

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const trimmed = input.trim();
        if (trimmed) {
            onConfirm(trimmed);
        } else {
            onClose();
        }
    };

    const handleSelectSuggestion = (suggestion: string) => {
        setInput(suggestion);
        onConfirm(suggestion);
    };

    return (
        <Portal>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-md transform-gpu"
                        onClick={onClose}
                    >
                        <motion.div
                            initial={{ scale: 0.96, opacity: 0, y: 8 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.96, opacity: 0, y: 8 }}
                            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                            className="relative w-full max-w-md bg-white rounded-3xl p-5 sm:p-7 shadow-2xl border border-stone-200/80 flex flex-col max-h-[92vh] overflow-y-auto scrollbar-thin my-auto transform-gpu"
                            onClick={(e) => e.stopPropagation()}
                        >
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-stone-100 shrink-0">
                        <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-stone-100 text-stone-700 border border-stone-200/60">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <circle cx="12" cy="12" r="6" />
                                    <circle cx="12" cy="12" r="2" />
                                </svg>
                            </span>
                            <div>
                                <h2 className="text-sm sm:text-base font-semibold text-stone-900">
                                    Sprint Target Commitment
                                </h2>
                                <p className="text-[11px] text-stone-400">
                                    Define your single concrete objective
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
                            aria-label="Skip Intention"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>

                    {/* Clean Minimalist Tip */}
                    <p className="text-[11px] text-stone-500 mt-2.5 mb-1 shrink-0">
                        <span className="font-semibold text-stone-700">Tip:</span> Set a single concrete micro-goal to trigger immediate momentum and eliminate starting friction.
                    </p>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="mt-4 space-y-3 shrink-0">
                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                                What is your ONE non-negotiable target for this sprint?
                            </label>
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="e.g. 'Draft the checkout API handler'"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FF6363]/20 focus:border-[#FF6363] transition-all bg-white"
                            />
                        </div>

                        {/* Quick Suggestion Pills */}
                        <div>
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-400 block mb-1.5">
                                Quick Intentions
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                                {activeTaskTitle && (
                                    <button
                                        type="button"
                                        onClick={() => handleSelectSuggestion(`Progress on: ${activeTaskTitle}`)}
                                        className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-stone-100 text-stone-700 border border-stone-200 hover:bg-stone-200/80 transition-colors truncate max-w-[280px]"
                                    >
                                        Progress on: {activeTaskTitle}
                                    </button>
                                )}
                                {COMMON_SUGGESTIONS.map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => handleSelectSuggestion(s)}
                                        className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-stone-100 text-stone-600 hover:bg-stone-200/80 transition-colors"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-3 border-t border-stone-100 mt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="text-xs text-stone-400 hover:text-stone-700 transition-colors"
                            >
                                Skip Target
                            </button>

                            <button
                                type="submit"
                                className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#FF6363] hover:bg-[#E04848] text-white shadow-xs transition-colors cursor-pointer"
                            >
                                Lock In &amp; Start
                            </button>
                        </div>
                    </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Portal>
    );
}
