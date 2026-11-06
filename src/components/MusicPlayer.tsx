'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMusicStore, STATIONS } from '@/store/musicStore';
import { useMounted } from '@/hooks/useMounted';
import {
    isProceduralStation,
    proceduralAudio,
    ProceduralSoundId,
} from '@/lib/proceduralAudio';

const STATION_SUBTITLES: Record<string, string> = {
    'lofi-radio': 'Lofi Beats',
    'brown-noise': 'Deep Focus',
    'pink-noise': 'Steady State',
    'gamma-40hz': 'Cortical Drive',
    'chillhop': 'Chillhop',
    'smooth-chill': 'Smooth Jazz',
    'coffee-shop': 'Cafe Vibes',
};

// Animated 4-Bar Audio Equalizer (Waveform Visualizer)
function AudioEqualizer({ colorClass }: { colorClass: string }) {
    const bars = [
        { initial: 0.35, target: 1.15, duration: 0.72, delay: 0 },
        { initial: 0.85, target: 0.25, duration: 0.58, delay: 0.14 },
        { initial: 0.4, target: 1.25, duration: 0.82, delay: 0.07 },
        { initial: 0.95, target: 0.35, duration: 0.65, delay: 0.21 },
    ];

    return (
        <div
            className="flex items-center justify-center gap-[2.5px] h-7 px-2"
            aria-label="Soundscape playing animation"
        >
            {bars.map((bar, i) => (
                <motion.span
                    key={i}
                    animate={{
                        scaleY: [bar.initial, bar.target, bar.initial],
                    }}
                    transition={{
                        duration: bar.duration,
                        repeat: Infinity,
                        repeatType: 'reverse',
                        ease: 'easeInOut',
                        delay: bar.delay,
                    }}
                    className={`w-[2.5px] h-3.5 rounded-full origin-center ${colorClass}`}
                />
            ))}
        </div>
    );
}

// Soundscape Droplet component (Spotify Dynamic Island layout):
// - desktop variant: controls rendered inside the continuous vector droplet in Navigation.tsx
// - mobile variant: floating droplet pill at top of screen
export function SoundscapeDroplet({ variant = 'desktop' }: { variant?: 'desktop' | 'mobile' }) {
    const { isPlaying, currentStationId, togglePlay, nextStation, previousStation } =
        useMusicStore();
    const currentStation = STATIONS.find((s) => s.id === currentStationId) || STATIONS[0];
    const isProcedural = isProceduralStation(currentStation.id);

    const [isHovered, setIsHovered] = useState(false);
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // On touch/tap or click, briefly reveal controls for 3.5 seconds
    const handleDropletTap = () => {
        if (!isPlaying) return;
        setIsHovered(true);
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = setTimeout(() => {
            setIsHovered(false);
        }, 3500);
    };

    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        };
    }, []);

    const content = (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleDropletTap}
            className="flex items-center justify-between w-full h-full px-3 select-none text-stone-800"
        >
            {/* Left: Spinning Vinyl Disc Badge (Click to go to previous station) */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    previousStation();
                }}
                className="w-7 h-7 rounded-full bg-stone-950 border border-stone-800 flex items-center justify-center relative overflow-hidden flex-shrink-0 shadow-xs cursor-pointer focus:outline-hidden hover:border-stone-700 transition-colors"
                title="Previous soundscape"
                aria-label="Previous soundscape"
            >
                <motion.div
                    animate={{ rotate: isPlaying ? 360 : 0 }}
                    transition={{ repeat: Infinity, duration: 4.5, ease: 'linear' }}
                    className="w-full h-full flex items-center justify-center"
                >
                    <div className="w-4 h-4 rounded-full border border-stone-800 flex items-center justify-center">
                        <span
                            className={`w-1.5 h-1.5 rounded-full ${
                                isPlaying
                                    ? isProcedural
                                        ? 'bg-emerald-500'
                                        : 'bg-[#FF6363]'
                                    : 'bg-stone-500'
                            }`}
                        />
                    </div>
                </motion.div>
            </button>

            {/* Middle: Stacked Two-Line Typography */}
            <div className="flex flex-col justify-center min-w-0 text-left flex-1 pl-2.5 pr-2">
                <span className="text-[9px] font-semibold text-stone-400 uppercase tracking-wider truncate block leading-tight flex items-center gap-1">
                    {STATION_SUBTITLES[currentStation.id] || 'Lofi Beats'}
                    {isProcedural && (
                        <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded">
                            Neuro
                        </span>
                    )}
                </span>
                <AnimatePresence mode="wait">
                    <motion.span
                        key={currentStation.id}
                        initial={{ opacity: 0, y: 1 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -1 }}
                        transition={{ duration: 0.15 }}
                        className="text-xs font-semibold text-stone-900 truncate block leading-tight"
                    >
                        {currentStation.name}
                    </motion.span>
                </AnimatePresence>
            </div>

            {/* Right: Dynamic Island Transport Controls vs Audio Equalizer Waveform */}
            <div className="relative flex items-center justify-end min-w-[58px] h-7 flex-shrink-0">
                <AnimatePresence mode="wait" initial={false}>
                    {isPlaying && !isHovered ? (
                        <motion.div
                            key="equalizer"
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.85 }}
                            transition={{ duration: 0.18 }}
                            className="flex items-center justify-end w-full h-full cursor-pointer"
                            title="Hover to show controls"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsHovered(true);
                            }}
                        >
                            <AudioEqualizer
                                colorClass={isProcedural ? 'bg-emerald-500' : 'bg-[#FF6363]'}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="controls"
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.85 }}
                            transition={{ duration: 0.18 }}
                            className="flex items-center gap-1.5"
                        >
                            {/* Circular Play/Pause Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    togglePlay();
                                }}
                                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90 flex-shrink-0 cursor-pointer ${
                                    isPlaying
                                        ? isProcedural
                                            ? 'bg-emerald-600 text-white hover:bg-emerald-700 ring-2 ring-emerald-500/30 shadow-xs'
                                            : 'bg-[#FF6363] text-white hover:bg-[#E04848] ring-2 ring-[#FF6363]/30 shadow-xs'
                                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200/80 hover:text-stone-900 ring-1 ring-stone-200/80'
                                }`}
                                aria-label={isPlaying ? 'Pause soundscape' : 'Play soundscape'}
                                title={isPlaying ? 'Pause' : 'Play'}
                            >
                                {isPlaying ? (
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                        <rect x="6" y="4" width="4" height="16" rx="1" />
                                        <rect x="14" y="4" width="4" height="16" rx="1" />
                                    </svg>
                                ) : (
                                    <svg
                                        width="10"
                                        height="10"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className={`ml-0.5 ${isProcedural ? 'text-emerald-600' : 'text-[#FF6363]'}`}
                                        aria-hidden="true"
                                    >
                                        <path d="M5 3l14 9-14 9V3z" />
                                    </svg>
                                )}
                            </button>

                            {/* Next Station Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    nextStation();
                                }}
                                className="w-6 h-6 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors active:scale-90 flex-shrink-0 cursor-pointer"
                                aria-label="Next soundscape"
                                title="Next soundscape"
                            >
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                    <path d="M6 18l8.5-6L6 6zm9-12h2v12h-2z" />
                                </svg>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );

    if (variant === 'desktop') {
        return content;
    }

    // Mobile variant: floating organic droplet at top-3
    return (
        <aside
            aria-label="Ambient soundscape player"
            className="fixed top-3 left-1/2 -translate-x-1/2 z-40 md:hidden w-[248px]"
        >
            <div className="h-[40px] w-full rounded-full bg-white/95 backdrop-blur-md border border-stone-200/90 shadow-[0_4px_16px_rgba(28,25,23,0.08)] select-none">
                {content}
            </div>
        </aside>
    );
}

export function MusicPlayer() {
    const { isPlaying, volume, currentStationId, isMuted } = useMusicStore();
    const audioRef = useRef<HTMLAudioElement>(null);
    const mounted = useMounted();

    const currentStation = STATIONS.find((s) => s.id === currentStationId) || STATIONS[0];
    const isProcedural = isProceduralStation(currentStation.id);

    // Handle Volume
    useEffect(() => {
        const effectiveVol = isMuted ? 0 : volume / 100;
        if (audioRef.current) {
            audioRef.current.volume = effectiveVol;
        }
        proceduralAudio.setVolume(effectiveVol);
    }, [volume, isMuted]);

    // Handle Play/Pause and Station switching
    useEffect(() => {
        const audio = audioRef.current;
        let isCancelled = false;

        if (isPlaying) {
            if (isProceduralStation(currentStationId)) {
                // Procedural soundscape: stop HTML5 stream, play procedural audio
                if (audio) {
                    audio.pause();
                }
                proceduralAudio.play(
                    currentStationId as ProceduralSoundId,
                    isMuted ? 0 : volume / 100
                );
            } else {
                // Web radio stream: stop procedural audio, play HTML5 stream
                proceduralAudio.stop();
                if (audio) {
                    const playPromise = audio.play();
                    if (playPromise !== undefined) {
                        playPromise.catch((error) => {
                            if (error.name === 'AbortError' || isCancelled) return;
                            if (error.name === 'NotAllowedError') return;
                            console.warn('Audio play notice:', error);
                        });
                    }
                }
            }
        } else {
            if (audio) {
                audio.pause();
            }
            proceduralAudio.stop();
        }

        return () => {
            isCancelled = true;
        };
    }, [isPlaying, currentStationId, isMuted, volume]);

    // Stop procedural audio on unmount
    useEffect(() => {
        return () => {
            proceduralAudio.stop();
        };
    }, []);

    if (!mounted) return null;

    return (
        <>
            {/* Native Invisible Audio Element for Stream playback */}
            <div
                className="fixed pointer-events-none opacity-0 overflow-hidden"
                style={{ width: '1px', height: '1px', left: '-10px', bottom: '0', zIndex: -1 }}
            >
                <audio
                    ref={audioRef}
                    src={isProcedural ? undefined : currentStation.streamUrl}
                    preload="none"
                    crossOrigin="anonymous"
                />
            </div>

            {/* Mobile Soundscape Droplet (Desktop variant is rendered inside Navigation) */}
            <SoundscapeDroplet variant="mobile" />
        </>
    );
}
