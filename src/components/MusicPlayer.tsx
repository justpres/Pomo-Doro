'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMusicStore, STATIONS } from '@/store/musicStore';
import { useMounted } from '@/hooks/useMounted';

const STATION_SUBTITLES: Record<string, string> = {
    'lofi-radio': 'Lofi Beats',
    'chillhop': 'Chillhop',
    'smooth-chill': 'Smooth Jazz',
    'coffee-shop': 'Cafe Vibes',
};

// Soundscape Droplet component (Spotify Dynamic Island layout):
// - desktop variant: controls rendered inside the continuous vector droplet in Navigation.tsx
// - mobile variant: floating droplet pill at top of screen
export function SoundscapeDroplet({ variant = 'desktop' }: { variant?: 'desktop' | 'mobile' }) {
    const { isPlaying, currentStationId, togglePlay, nextStation, previousStation } = useMusicStore();
    const currentStation = STATIONS.find(s => s.id === currentStationId) || STATIONS[0];

    const content = (
        <div className="flex items-center justify-between w-full h-full px-3 select-none text-stone-800">
            {/* Left: Spinning Vinyl Record Disc Badge (Click to go to previous station) */}
            <button
                onClick={previousStation}
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
                        <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-[#FF6363]' : 'bg-stone-500'}`} />
                    </div>
                </motion.div>
            </button>

            {/* Middle: Stacked Two-Line Typography (Spotify Island style: Category/Artist on top, Title below) */}
            <div className="flex flex-col justify-center min-w-0 text-left flex-1 pl-2.5 pr-2">
                <span className="text-[9px] font-semibold text-stone-400 uppercase tracking-wider truncate block leading-tight">
                    {STATION_SUBTITLES[currentStation.id] || 'Lofi Beats'}
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

            {/* Right: Transport Controls (Play/Pause with glowing ring + Next Station) */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
                {/* Circular Play/Pause Button */}
                <button
                    onClick={togglePlay}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90 flex-shrink-0 ${
                        isPlaying
                            ? 'bg-[#FF6363] text-white hover:bg-[#E04848] ring-2 ring-[#FF6363]/30 shadow-xs'
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
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 text-[#FF6363]" aria-hidden="true">
                            <path d="M5 3l14 9-14 9V3z" />
                        </svg>
                    )}
                </button>

                {/* Next Station Button (⏭) */}
                <button
                    onClick={nextStation}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors active:scale-90 flex-shrink-0"
                    aria-label="Next soundscape"
                    title="Next soundscape"
                >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M6 18l8.5-6L6 6zm9-12h2v12h-2z" />
                    </svg>
                </button>
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
    const {
        isPlaying,
        volume,
        currentStationId,
        isMuted
    } = useMusicStore();

    const audioRef = useRef<HTMLAudioElement>(null);
    const mounted = useMounted();

    const currentStation = STATIONS.find(s => s.id === currentStationId) || STATIONS[0];

    // Handle Volume
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume / 100;
        }
    }, [volume, isMuted]);

    // Handle Play/Pause and station switching cleanly without AbortError noise
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        let isCancelled = false;

        if (isPlaying) {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    // AbortError is a normal HTML5 Audio behavior when switching streams
                    // or when a play() call is superseded by a subsequent load request.
                    if (error.name === 'AbortError' || isCancelled) {
                        return;
                    }
                    if (error.name === 'NotAllowedError') {
                        // Browser autoplay restriction before user interaction
                        return;
                    }
                    console.warn('Audio play notice:', error);
                });
            }
        } else {
            audio.pause();
        }

        return () => {
            isCancelled = true;
        };
    }, [isPlaying, currentStationId]);

    if (!mounted) return null;

    return (
        <>
            {/* Native Invisible Audio Element */}
            <div
                className="fixed pointer-events-none opacity-0 overflow-hidden"
                style={{ width: '1px', height: '1px', left: '-10px', bottom: '0', zIndex: -1 }}
            >
                <audio
                    ref={audioRef}
                    src={currentStation.streamUrl}
                    preload="none"
                    crossOrigin="anonymous"
                />
            </div>

            {/* Mobile Soundscape Droplet (Desktop variant is seamlessly part of Navigation header) */}
            <SoundscapeDroplet variant="mobile" />
        </>
    );
}
