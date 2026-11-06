'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Portal } from './Portal';

interface ResumptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (cue: { whereLeftOff: string; nextAction: string }) => void;
    initialWhereLeftOff?: string;
    initialNextAction?: string;
}

export function ResumptionModal({
    isOpen,
    onClose,
    onSave,
    initialWhereLeftOff = '',
    initialNextAction = '',
}: ResumptionModalProps) {
    const [whereLeftOff, setWhereLeftOff] = useState(initialWhereLeftOff);
    const [nextAction, setNextAction] = useState(initialNextAction);
    const whereInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (isOpen) {
            setWhereLeftOff(initialWhereLeftOff);
            setNextAction(initialNextAction);
            const timer = setTimeout(() => {
                whereInputRef.current?.focus();
            }, 180);
            return () => clearTimeout(timer);
        }
    }, [isOpen, initialWhereLeftOff, initialNextAction]);

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const trimmedWhere = whereLeftOff.trim();
        const trimmedNext = nextAction.trim();

        if (trimmedWhere || trimmedNext) {
            onSave({
                whereLeftOff: trimmedWhere || 'Paused mid-session',
                nextAction: trimmedNext || 'Resume focus on active task',
            });
        }
        onClose();
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
                                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                                </svg>
                            </span>
                            <div>
                                <h2 className="text-sm sm:text-base font-semibold text-stone-900">
                                    Ready-to-Resume Plan
                                </h2>
                                <p className="text-[11px] text-stone-400">
                                    Capture a 10s exit note before stepping away
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
                            aria-label="Close"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>

                    {/* Clean Minimalist Tip */}
                    <p className="text-[11px] text-stone-500 mt-2.5 mb-1 shrink-0">
                        <span className="font-semibold text-stone-700">Tip:</span> Note where you stopped and your immediate next action so your mind can completely rest.
                    </p>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 shrink-0">
                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                                1. Where did you leave off?
                            </label>
                            <input
                                ref={whereInputRef}
                                type="text"
                                value={whereLeftOff}
                                onChange={(e) => setWhereLeftOff(e.target.value)}
                                placeholder="e.g. 'Drafted auth middleware up to line 45'"
                                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                                2. What is your exact first step when you return?
                            </label>
                            <input
                                type="text"
                                value={nextAction}
                                onChange={(e) => setNextAction(e.target.value)}
                                placeholder="e.g. 'Write unit test for token refresh'"
                                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-3 border-t border-stone-100 mt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="text-xs text-stone-400 hover:text-stone-700 transition-colors"
                            >
                                Step Away Without Note
                            </button>

                            <button
                                type="submit"
                                className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer"
                            >
                                Save &amp; Rest Mind
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
