'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useMusicStore, STATIONS } from '@/store/musicStore';

export function MusicPlayer() {
    const {
        isPlaying,
        volume,
        currentStationId,
        isMuted,
    } = useMusicStore();

    const audioRef = useRef<HTMLAudioElement>(null);
    const currentStation = STATIONS.find(s => s.id === currentStationId) || STATIONS[0];
    const [mounted, setMounted] = useState(false);

    // Don't render on server
    useEffect(() => setMounted(true), []);

    // Handle Volume
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume / 100;
        }
    }, [volume, isMuted]);

    // Handle Play/Pause
    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.error("Audio play failed:", error);
                    });
                }
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying, currentStationId]); // Re-try play when station changes

    if (!mounted) return null;

    return (
        <div
            className="fixed pointer-events-none opacity-0 overflow-hidden"
            style={{ width: '1px', height: '1px', left: '-10px', bottom: '0', zIndex: -1 }}
        >
            <audio
                ref={audioRef}
                src={currentStation.streamUrl}
                preload="none"
                crossOrigin="anonymous"
                onPlay={() => console.log("Native Audio Started:", currentStation.name)}
                onError={(e) => console.error("Native Audio Error:", e)}
            />
        </div>
    );
}

export function MusicPlayerWidget() {
    const {
        isPlaying,
        volume,
        savedVolume,
        currentStationId,
        isMuted,
        togglePlay,
        setVolume,
        setStation,
        toggleMute,
        nextStation,
        previousStation
    } = useMusicStore();

    // Don't render on server
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    const currentStation = STATIONS.find(s => s.id === currentStationId) || STATIONS[0];
    const isDucked = savedVolume !== null; // Volume is currently lowered for alarm

    return (
        <div className="p-5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] w-full max-w-sm relative overflow-hidden mx-auto"
            style={{
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                border: '1px solid rgba(255, 107, 107, 0.1)',
                backdropFilter: 'blur(16px) saturate(180%)',
            }}
        >
            {/* Decorative background blur */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            {/* Header: Station Info */}
            <div className="relative z-10 mb-6 text-center pt-2">
                <h3 className="font-bold text-lg truncate" style={{ color: 'var(--text-dark)' }}>
                    {currentStation.name}
                </h3>
                <p className="text-xs font-medium uppercase tracking-wider mt-1" style={{ color: 'var(--primary)' }}>
                    {currentStation.description}
                </p>
            </div>

            {/* Main Controls Row */}
            <div className="relative z-10 flex items-center justify-center gap-4 mb-6">
                {/* Previous Station */}
                <button
                    onClick={previousStation}
                    className="p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-lg focus:outline-none outline-none border-none"
                    style={{ color: 'var(--text-dark)' }}
                    title="Previous Station"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                    </svg>
                </button>

                {/* Play/Pause Button (Centerpiece) */}
                <button
                    onClick={togglePlay}
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transform transition-all hover:scale-105 active:scale-95 hover:shadow-xl relative group focus:outline-none outline-none border-none"
                    style={{ backgroundColor: 'var(--primary)' }}
                >
                    <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                    {isPlaying ? (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="6" y="4" width="4" height="16" rx="1" />
                            <rect x="14" y="4" width="4" height="16" rx="1" />
                        </svg>
                    ) : (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="ml-1">
                            <path d="M5 3l14 9-14 9V3z" />
                        </svg>
                    )}
                </button>

                {/* Next Station */}
                <button
                    onClick={nextStation}
                    className="p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-lg focus:outline-none outline-none border-none"
                    style={{ color: 'var(--text-dark)' }}
                    title="Next Station"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 18l8.5-6L6 6zm9-12h2v12h-2z" />
                    </svg>
                </button>
            </div>

            {/* Volume Controls Row */}
            <div className="relative z-10 flex items-center gap-3 mb-6 px-2">
                <button
                    onClick={toggleMute}
                    className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-xl focus:outline-none outline-none"
                    title={isMuted ? "Unmute" : "Mute"}
                    style={{ color: isMuted ? 'var(--text-muted)' : 'var(--text-dark)' }}
                >
                    {isMuted || volume === 0 ? '🔇' : (volume < 50 ? '🔉' : '🔊')}
                </button>
                <div className="flex-1">
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={(e) => setVolume(parseInt(e.target.value))}
                        disabled={isDucked}
                        className="w-full h-1.5 appearance-none rounded-full cursor-pointer no-spinner outline-none"
                        style={{
                            backgroundColor: isDucked ? '#FFE0E0' : 'var(--primary-lighter)',
                            backgroundImage: `linear-gradient(${isDucked ? '#FF9999' : 'var(--primary)'}, ${isDucked ? '#FF9999' : 'var(--primary)'})`,
                            backgroundSize: `${volume}% 100%`,
                            backgroundRepeat: 'no-repeat',
                            opacity: isDucked ? 0.6 : 1,
                        }}
                    />
                </div>
                <span className="text-[10px] font-bold w-12 text-right" style={{ color: isDucked ? 'var(--primary)' : 'var(--text-muted)' }}>
                    {isDucked ? `${volume}% → ${savedVolume}%` : `${volume}%`}
                </span>
            </div>

            {/* Ducking Indicator */}
            {isDucked && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 flex items-center justify-center gap-2 mb-4 px-3 py-2 rounded-xl"
                    style={{ backgroundColor: 'rgba(255, 107, 107, 0.15)' }}
                >
                    <span className="text-lg">🔔</span>
                    <span className="text-xs font-medium" style={{ color: 'var(--primary-dark)' }}>
                        Volume lowered for alarm • Will restore to {savedVolume}%
                    </span>
                </motion.div>
            )}

            {/* Station List */}
            <div className="relative z-10 border-t pt-4" style={{ borderColor: 'rgba(255, 107, 107, 0.1)' }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3 px-1" style={{ color: 'var(--text-muted)' }}>
                    Live Stations
                </p>
                <div
                    className="space-y-1 max-h-40 overflow-y-auto pr-1 -mr-2 transition-all no-scrollbar"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    <style jsx>{`
                        .no-scrollbar::-webkit-scrollbar {
                            display: none;
                        }
                    `}</style>
                    {STATIONS.map((station) => (
                        <button
                            key={station.id}
                            onClick={() => setStation(station.id)}
                            className={`w-full text-left px-4 py-2.5 rounded-2xl text-sm transition-all truncate flex items-center justify-between group relative focus:outline-none outline-none border-none ring-0 focus:ring-0 focus-visible:outline-none focus-visible:ring-0 ${currentStationId === station.id
                                ? 'font-semibold overflow-hidden'
                                : 'hover:bg-red-50/50'
                                }`}
                            style={{
                                backgroundColor: currentStationId === station.id
                                    ? 'white'
                                    : 'transparent',
                                color: currentStationId === station.id
                                    ? 'var(--primary)'
                                    : 'var(--text-dark)',
                                outline: 'none',
                                boxShadow: 'none',
                                WebkitTapHighlightColor: 'transparent'
                            }}
                        >
                            {currentStationId === station.id && (
                                <motion.div
                                    layoutId="active-pill"
                                    className="absolute inset-0 bg-white"
                                    style={{ zIndex: -1 }}
                                />
                            )}
                            <span className="truncate relative z-10">{station.name}</span>
                            {currentStationId === station.id && (
                                <div className="flex gap-0.5 items-end h-4 relative z-10">
                                    <motion.div
                                        animate={{ height: ['4px', '12px', '4px'] }}
                                        transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
                                        className="w-0.5 bg-red-400 rounded-full"
                                    />
                                    <motion.div
                                        animate={{ height: ['8px', '16px', '6px', '10px'] }}
                                        transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut", delay: 0.1 }}
                                        className="w-0.5 bg-red-400 rounded-full"
                                    />
                                    <motion.div
                                        animate={{ height: ['6px', '10px', '4px'] }}
                                        transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut", delay: 0.2 }}
                                        className="w-0.5 bg-red-400 rounded-full"
                                    />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
