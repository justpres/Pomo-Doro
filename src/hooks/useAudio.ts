'use client';

import { useCallback, useRef, useState } from 'react';
import { useTimerStore } from '@/store/timerStore';
import { useMusicStore } from '@/store/musicStore';

export function useAudio() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const lastSoundRef = useRef<string>('');
    const [isPlaying, setIsPlaying] = useState(false);
    const { settings } = useTimerStore();
    const { duckVolume, restoreVolume } = useMusicStore();

    const playNotification = useCallback(() => {
        if (!settings.soundEnabled) return;

        const soundFile = `/sounds/${settings.selectedSound}`;

        // Create new audio element if sound changed or doesn't exist
        if (!audioRef.current || lastSoundRef.current !== settings.selectedSound) {
            audioRef.current = new Audio(soundFile);
            lastSoundRef.current = settings.selectedSound;
        }

        audioRef.current.volume = settings.soundVolume / 100;
        audioRef.current.currentTime = 0;

        // Duck music volume while alarm plays
        duckVolume();

        // Track when audio ends and restore music volume
        audioRef.current.onended = () => {
            setIsPlaying(false);
            restoreVolume();
        };

        audioRef.current.play().then(() => {
            setIsPlaying(true);
        }).catch(() => {
            console.log('Audio playback was prevented');
            restoreVolume(); // Restore if playback fails
        });
    }, [settings.soundEnabled, settings.soundVolume, settings.selectedSound, duckVolume, restoreVolume]);

    const stopNotification = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
            restoreVolume(); // Restore music volume when alarm is stopped
        }
    }, [restoreVolume]);

    return { playNotification, stopNotification, isPlaying };
}
