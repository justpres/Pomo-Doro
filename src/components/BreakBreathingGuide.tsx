'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BREATH_PROTOCOLS,
    ProtocolId,
    BreathStep,
    getProtocol,
} from '@/lib/breathProtocols';
import { breathAudio } from '@/lib/breathAudio';
import { formatTime } from '@/lib/constants';
import { Portal } from './Portal';

interface BreakBreathingGuideProps {
    isOpen: boolean;
    onClose: () => void;
    breakTimeRemaining?: number;
}

export function BreakBreathingGuide({
    isOpen,
    onClose,
    breakTimeRemaining,
}: BreakBreathingGuideProps) {
    const [selectedProtocolId, setSelectedProtocolId] = useState<ProtocolId>('cyclic-sigh');
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [currentCycle, setCurrentCycle] = useState(1);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [stepSecondsRemaining, setStepSecondsRemaining] = useState<number>(0);

    const protocol = getProtocol(selectedProtocolId);
    const currentStep: BreathStep = protocol.steps[currentStepIndex] || protocol.steps[0];

    const stepTimerRef = useRef<NodeJS.Timeout | null>(null);
    const tickIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Sync audio muted state
    const handleToggleMute = () => {
        const nextMuted = !isMuted;
        setIsMuted(nextMuted);
        breathAudio.setMuted(nextMuted);
    };

    // Reset when switching protocols
    const handleSelectProtocol = (id: ProtocolId) => {
        setSelectedProtocolId(id);
        setCurrentStepIndex(0);
        setCurrentCycle(1);
        setIsCompleted(false);
        setIsPlaying(true);
        const p = getProtocol(id);
        setStepSecondsRemaining(p.steps[0].duration);
    };

    // Progress to next step or next cycle
    const advanceStep = useCallback(() => {
        setCurrentStepIndex((prevStep) => {
            const nextStepIndex = prevStep + 1;
            if (nextStepIndex < protocol.steps.length) {
                // Next step in current cycle
                const nextStep = protocol.steps[nextStepIndex];
                setStepSecondsRemaining(nextStep.duration);
                breathAudio.playPhaseCue(nextStep.phase);
                return nextStepIndex;
            } else {
                // End of cycle
                setCurrentCycle((prevCycle) => {
                    const nextCycle = prevCycle + 1;
                    if (nextCycle <= protocol.targetCycles) {
                        const firstStep = protocol.steps[0];
                        setStepSecondsRemaining(firstStep.duration);
                        breathAudio.playPhaseCue(firstStep.phase);
                        return nextCycle;
                    } else {
                        // Protocol complete!
                        setIsCompleted(true);
                        setIsPlaying(false);
                        breathAudio.playCompletionChime();
                        return prevCycle;
                    }
                });
                return 0;
            }
        });
    }, [protocol]);

    // Handle timer intervals
    useEffect(() => {
        if (!isOpen || !isPlaying || isCompleted) {
            if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
            if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
            return;
        }

        // Play cue on initial launch
        breathAudio.playPhaseCue(currentStep.phase);
        setStepSecondsRemaining(currentStep.duration);

        // Tick every 100ms for smooth remaining countdown
        const stepEndTime = Date.now() + currentStep.duration * 1000;
        tickIntervalRef.current = setInterval(() => {
            const timeLeft = Math.max(0, (stepEndTime - Date.now()) / 1000);
            setStepSecondsRemaining(Number(timeLeft.toFixed(1)));
        }, 100);

        // Timeout to advance step
        stepTimerRef.current = setTimeout(() => {
            advanceStep();
        }, currentStep.duration * 1000);

        return () => {
            if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
            if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
        };
    }, [isOpen, isPlaying, isCompleted, currentStepIndex, currentCycle, selectedProtocolId, advanceStep]);

    // Restart protocol
    const handleRestart = () => {
        setCurrentStepIndex(0);
        setCurrentCycle(1);
        setIsCompleted(false);
        setIsPlaying(true);
        setStepSecondsRemaining(protocol.steps[0].duration);
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
                            className="relative w-full max-w-lg bg-white rounded-3xl p-4 sm:p-6 shadow-2xl border border-stone-200/80 flex flex-col max-h-[92vh] overflow-y-auto scrollbar-thin transform-gpu my-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                    {/* Header Bar */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-stone-100 shrink-0">
                        <div className="flex items-center gap-2">
                            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            <h2 className="text-sm sm:text-base font-semibold text-stone-900">
                                Active Recovery Guide
                            </h2>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Break Countdown Indicator */}
                            {breakTimeRemaining !== undefined && (
                                <div className="text-[11px] font-medium text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full">
                                    Break: {formatTime(breakTimeRemaining)}
                                </div>
                            )}

                            {/* Sound Toggle */}
                            <button
                                onClick={handleToggleMute}
                                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors"
                                title={isMuted ? 'Unmute Cues' : 'Mute Cues'}
                                aria-label={isMuted ? 'Unmute Cues' : 'Mute Cues'}
                            >
                                {isMuted ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                        <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                                        <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
                                        <line x1="12" y1="19" x2="12" y2="23" />
                                        <line x1="8" y1="23" x2="16" y2="23" />
                                    </svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                                    </svg>
                                )}
                            </button>

                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
                                aria-label="Close Guide"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Protocol Tabs (scrollbar hidden cleanly across all browsers, guaranteed no shrinking) */}
                    <div className="flex items-center gap-1.5 overflow-x-auto py-2 shrink-0 min-h-[42px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                        {BREATH_PROTOCOLS.map((p) => {
                            const isSelected = p.id === selectedProtocolId;
                            return (
                                <button
                                    key={p.id}
                                    onClick={() => handleSelectProtocol(p.id)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                                        isSelected
                                            ? 'bg-stone-900 text-white shadow-xs'
                                            : 'bg-stone-100 hover:bg-stone-200/70 text-stone-600'
                                    }`}
                                >
                                    {p.name}
                                </button>
                            );
                        })}
                    </div>

                    {/* Central Display */}
                    {!isCompleted ? (
                        <div className="flex flex-col items-center justify-center my-1.5 sm:my-3 relative">
                            {/* Animated Breathing Orb - Compact and proportioned for all viewport heights */}
                            <div className="relative flex items-center justify-center w-40 h-40 sm:w-52 sm:h-52">
                                {/* Outer ambient pulse ring */}
                                <motion.div
                                    animate={{
                                        scale: isPlaying ? [1, currentStep.scale * 1.15, 1] : 1,
                                        opacity: [0.15, 0.35, 0.15],
                                    }}
                                    transition={{
                                        duration: currentStep.duration,
                                        ease: 'easeInOut',
                                        repeat: Infinity,
                                    }}
                                    className="absolute inset-0 rounded-full bg-emerald-300/40 blur-xl pointer-events-none"
                                />

                                {/* Main Breathing Sphere */}
                                <motion.div
                                    animate={{
                                        scale: isPlaying ? currentStep.scale : 1,
                                    }}
                                    transition={{
                                        duration: currentStep.duration,
                                        ease: currentStep.phase === 'topup' ? 'easeOut' : 'easeInOut',
                                    }}
                                    className="relative flex flex-col items-center justify-center w-32 h-32 sm:w-40 sm:h-40 rounded-full shadow-lg border border-emerald-300/60"
                                    style={{
                                        background: 'radial-gradient(circle at 35% 35%, #D1FAE5 0%, #A7F3D0 50%, #6EE7B7 100%)',
                                    }}
                                >
                                    <span className="text-[11px] sm:text-xs uppercase tracking-wider font-semibold text-emerald-950 mb-0.5">
                                        {currentStep.label}
                                    </span>
                                    <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-emerald-950">
                                        {stepSecondsRemaining > 0 ? stepSecondsRemaining.toFixed(1) : '0.0'}s
                                    </span>
                                </motion.div>
                            </div>

                            {/* Step Instruction */}
                            <div className="min-h-[2rem] flex items-center justify-center text-center mt-2 px-4">
                                <motion.p
                                    key={`${selectedProtocolId}-${currentStepIndex}`}
                                    initial={{ opacity: 0, y: 3 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-xs sm:text-sm font-medium text-stone-700"
                                >
                                    {currentStep.instruction}
                                </motion.p>
                            </div>

                            {/* Cycle Progress Dots */}
                            {protocol.targetCycles > 1 && (
                                <div className="flex items-center gap-1.5 mt-1.5">
                                    <span className="text-[11px] font-medium text-stone-500 mr-1">
                                        Cycle {currentCycle} of {protocol.targetCycles}
                                    </span>
                                    {Array.from({ length: protocol.targetCycles }).map((_, idx) => (
                                        <span
                                            key={idx}
                                            className={`h-2 rounded-full transition-all ${
                                                idx + 1 === currentCycle
                                                    ? 'w-5 bg-emerald-600'
                                                    : idx + 1 < currentCycle
                                                    ? 'w-2 bg-emerald-300'
                                                    : 'w-2 bg-stone-200'
                                            }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Completion View */
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex flex-col items-center justify-center py-6 text-center"
                        >
                            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4 text-emerald-600">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-stone-900 mb-1">
                                Autonomic Reset Complete
                            </h3>
                            <p className="text-xs text-stone-600 max-w-sm mb-6 leading-relaxed">
                                You have successfully stimulated your parasympathetic vagal brake and cleared prefrontal fatigue. Your directed attention reserves are primed for the next focus sprint.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleRestart}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                                >
                                    Repeat Protocol
                                </button>
                                <button
                                    onClick={onClose}
                                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                                >
                                    Return to Timer
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Bottom Action Controls */}
                    {!isCompleted && (
                        <div className="flex items-center justify-between pt-2.5 border-t border-stone-100 mt-2 shrink-0">
                            <button
                                onClick={handleRestart}
                                className="text-xs text-stone-400 hover:text-stone-700 transition-colors"
                            >
                                Restart
                            </button>

                            <div className="flex items-center gap-2.5">
                                <button
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors"
                                >
                                    {isPlaying ? 'Pause' : 'Resume'}
                                </button>
                                <button
                                    onClick={onClose}
                                    className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white shadow-xs transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Portal>
    );
}
