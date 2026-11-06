'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThoughtStore, ParkedThought } from '@/store/thoughtStore';
import { TimerMode } from '@/lib/constants';
import { Portal } from './Portal';

interface ThoughtParkingModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentMode?: TimerMode;
}

export function ThoughtParkingModal({
    isOpen,
    onClose,
    currentMode = 'focus',
}: ThoughtParkingModalProps) {
    const { thoughts, parkThought, resolveThought, deleteThought, convertToTask, clearResolved } =
        useThoughtStore();

    const [input, setInput] = useState('');
    const [justParked, setJustParked] = useState(false);
    const [activeTab, setActiveTab] = useState<'parked' | 'history'>('parked');
    const inputRef = useRef<HTMLInputElement | null>(null);

    // Auto-focus input when opened
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 180);
            return () => clearTimeout(timer);
        } else {
            setInput('');
            setJustParked(false);
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = input.trim();
        if (!trimmed) return;

        parkThought(trimmed, currentMode);
        setInput('');
        setJustParked(true);

        setTimeout(() => {
            setJustParked(false);
        }, 2200);
    };

    const parkedThoughts = thoughts.filter((t) => t.status === 'parked');
    const historicalThoughts = thoughts.filter((t) => t.status !== 'parked');
    const displayedThoughts = activeTab === 'parked' ? parkedThoughts : historicalThoughts;

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
                            className="relative w-full max-w-lg bg-white rounded-3xl p-5 sm:p-7 shadow-2xl border border-stone-200/80 flex flex-col max-h-[92vh] overflow-y-auto scrollbar-thin my-auto transform-gpu"
                            onClick={(e) => e.stopPropagation()}
                        >
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-stone-100 shrink-0">
                        <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-stone-100 text-stone-700 border border-stone-200/60">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 20h9" />
                                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                </svg>
                            </span>
                            <div>
                                <h2 className="text-sm sm:text-base font-semibold text-stone-900 flex items-center gap-2">
                                    Thought Parking Lot
                                    {parkedThoughts.length > 0 && (
                                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                                            {parkedThoughts.length}
                                        </span>
                                    )}
                                </h2>
                                <p className="text-[11px] text-stone-400">
                                    Park sudden urges in &lt; 3s to protect working memory.
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
                        <span className="font-semibold text-stone-700">Tip:</span> Park sudden urges in &lt; 3s to free your working memory and maintain flow state.
                    </p>

                    {/* Fast-Entry Input Form */}
                    <form onSubmit={handleSubmit} className="mt-4 relative shrink-0">
                        <div className="flex gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="What thought just distracted you? (e.g. 'Pay bill', 'Lookup flight')"
                                className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FF6363]/20 focus:border-[#FF6363] transition-all bg-white"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim()}
                                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#FF6363] hover:bg-[#E04848] text-white disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-xs"
                            >
                                Park It
                            </button>
                        </div>

                        <AnimatePresence>
                            {justParked && (
                                <motion.div
                                    initial={{ opacity: 0, y: 3 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -3 }}
                                    className="absolute left-0 -bottom-6 text-[11px] font-medium text-emerald-600 flex items-center gap-1"
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    <span>Thought parked safely. Back to deep focus!</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>

                    {/* Tabs */}
                    <div className="flex items-center justify-between mt-8 mb-2 pb-1 border-b border-stone-100">
                        <div className="flex gap-3">
                            <button
                                onClick={() => setActiveTab('parked')}
                                className={`text-xs font-medium pb-1 transition-all ${
                                    activeTab === 'parked'
                                        ? 'text-stone-900 border-b-2 border-[#FF6363] font-semibold'
                                        : 'text-stone-400 hover:text-stone-600'
                                }`}
                            >
                                Active Parked ({parkedThoughts.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`text-xs font-medium pb-1 transition-all ${
                                    activeTab === 'history'
                                        ? 'text-stone-900 border-b-2 border-[#FF6363] font-semibold'
                                        : 'text-stone-400 hover:text-stone-600'
                                }`}
                            >
                                History ({historicalThoughts.length})
                            </button>
                        </div>

                        {activeTab === 'history' && historicalThoughts.length > 0 && (
                            <button
                                onClick={clearResolved}
                                className="text-[11px] text-stone-400 hover:text-rose-600 transition-colors"
                            >
                                Clear History
                            </button>
                        )}
                    </div>

                    {/* Thoughts List */}
                    <div className="overflow-y-auto space-y-2 py-1 pr-1 flex-1 max-h-60 scrollbar-thin">
                        {displayedThoughts.length === 0 ? (
                            <div className="py-8 text-center text-stone-400 text-xs">
                                {activeTab === 'parked'
                                    ? 'No active distractions. You are completely in flow!'
                                    : 'No resolved thoughts yet.'}
                            </div>
                        ) : (
                            displayedThoughts.map((thought: ParkedThought) => (
                                <motion.div
                                    key={thought.id}
                                    layout
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="p-3 rounded-xl border border-stone-200/80 bg-stone-50/50 hover:bg-stone-50 transition-colors flex items-center justify-between gap-3"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p
                                            className={`text-xs font-medium text-stone-800 break-words ${
                                                thought.status !== 'parked' ? 'line-through text-stone-400' : ''
                                            }`}
                                        >
                                            {thought.text}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1 text-[10px] text-stone-400">
                                            <span className="capitalize">{thought.mode}</span>
                                            <span>•</span>
                                            <span>
                                                {new Date(thought.createdAt).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                            {thought.status === 'converted' && (
                                                <span className="text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.2 rounded">
                                                    Added to Tasks
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-1.5">
                                        {thought.status === 'parked' && (
                                            <>
                                                <button
                                                    onClick={() => convertToTask(thought.id, 1)}
                                                    className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-white border border-stone-200 text-stone-700 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                                                    title="Convert into a task on Today's list"
                                                >
                                                    + To Task
                                                </button>
                                                <button
                                                    onClick={() => resolveThought(thought.id)}
                                                    className="p-1 rounded-lg text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                                    title="Mark resolved"
                                                    aria-label="Mark resolved"
                                                >
                                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                </button>
                                            </>
                                        )}

                                        <button
                                            onClick={() => deleteThought(thought.id)}
                                            className="p-1 rounded-lg text-stone-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                            title="Delete"
                                            aria-label="Delete"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                <line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>

                    {/* Footer Tip */}
                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                        <span>
                            Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-stone-100 border border-stone-200 text-[10px] font-mono text-stone-600">P</kbd> anywhere to quickly park a thought
                        </span>
                        <button
                            onClick={onClose}
                            className="px-3.5 py-1.5 rounded-xl font-semibold bg-stone-900 text-white hover:bg-stone-800 text-xs transition-colors"
                        >
                            Close
                        </button>
                    </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Portal>
    );
}
