import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Station {
    id: string;
    name: string;
    description: string;
    streamUrl: string;
    type?: 'stream' | 'procedural';
}

export const STATIONS: Station[] = [
    {
        id: 'lofi-radio',
        name: 'Lofi 24/7',
        description: 'Chill beats to relax/study to',
        streamUrl: 'https://play.streamafrica.net/lofiradio',
        type: 'stream',
    },
    {
        id: 'brown-noise',
        name: 'Brown Noise',
        description: 'Velvety deep focus acoustic masking',
        streamUrl: 'procedural://brown-noise',
        type: 'procedural',
    },
    {
        id: 'pink-noise',
        name: 'Pink Noise',
        description: '1/f rainfall steady state focus',
        streamUrl: 'procedural://pink-noise',
        type: 'procedural',
    },
    {
        id: 'gamma-40hz',
        name: '40Hz Gamma',
        description: '40Hz cognitive gamma entrainment',
        streamUrl: 'procedural://gamma-40hz',
        type: 'procedural',
    },
    {
        id: 'chillhop',
        name: 'Chillhop Radio',
        description: 'Jazzy & Lofi Hip Hop beats',
        streamUrl: 'https://streams.fluxfm.de/Chillhop/mp3-128/streams.fluxfm.de/',
        type: 'stream',
    },
    {
        id: 'smooth-chill',
        name: 'Smooth Chill',
        description: 'Relaxing smooth jazz & beats',
        streamUrl: 'https://media-ssl.musicradio.com/SmoothChill',
        type: 'stream',
    },
    {
        id: 'coffee-shop',
        name: 'Coffee Shop Vibes',
        description: 'Cafe ambiance & jazz',
        streamUrl: 'https://ais-sa8.cdnstream1.com/3629_128.mp3',
        type: 'stream',
    },
];

interface MusicState {
    isPlaying: boolean;
    volume: number;
    savedVolume: number | null; // For volume ducking during alarm
    currentStationId: string;
    isMuted: boolean;
    isPlayerOpen: boolean;

    // Actions
    togglePlay: () => void;
    setVolume: (volume: number) => void;
    setStation: (stationId: string) => void;
    toggleMute: () => void;
    togglePlayer: () => void;
    nextStation: () => void;
    previousStation: () => void;
    duckVolume: () => void; // Lower volume for alarm
    restoreVolume: () => void; // Restore original volume
}

export const useMusicStore = create<MusicState>()(
    persist(
        (set, get) => ({
            isPlaying: false,
            volume: 50,
            savedVolume: null,
            currentStationId: STATIONS[0].id, // Default: 'lofi-radio'
            isMuted: false,
            isPlayerOpen: false,

            togglePlay: () => set({ isPlaying: !get().isPlaying }),

            setVolume: (volume) => set({ volume }),

            setStation: (stationId) => {
                const valid = STATIONS.some((s) => s.id === stationId);
                set({ currentStationId: valid ? stationId : STATIONS[0].id, isPlaying: true });
            },

            toggleMute: () => set({ isMuted: !get().isMuted }),

            togglePlayer: () => set({ isPlayerOpen: !get().isPlayerOpen }),

            nextStation: () => {
                const { currentStationId } = get();
                const currentIndex = STATIONS.findIndex((s) => s.id === currentStationId);
                const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % STATIONS.length;
                set({ currentStationId: STATIONS[nextIndex].id, isPlaying: true });
            },

            previousStation: () => {
                const { currentStationId } = get();
                const currentIndex = STATIONS.findIndex((s) => s.id === currentStationId);
                const prevIndex =
                    currentIndex === -1 ? 0 : (currentIndex - 1 + STATIONS.length) % STATIONS.length;
                set({ currentStationId: STATIONS[prevIndex].id, isPlaying: true });
            },

            duckVolume: () => {
                const { volume, savedVolume, isPlaying } = get();
                if (isPlaying && savedVolume === null) {
                    set({
                        savedVolume: volume,
                        volume: 5,
                    });
                }
            },

            restoreVolume: () => {
                const { savedVolume } = get();
                if (savedVolume !== null) {
                    set({
                        volume: savedVolume,
                        savedVolume: null,
                    });
                }
            },
        }),
        {
            name: 'pomodoro-music-storage',
            partialize: (state) => ({
                volume: state.volume,
                currentStationId: state.currentStationId,
                isMuted: state.isMuted,
            }),
            migrate: (persistedState: unknown) => {
                if (persistedState && typeof persistedState === 'object') {
                    const state = { ...(persistedState as Record<string, unknown>) };
                    if (!STATIONS.some((s) => s.id === state.currentStationId)) {
                        state.currentStationId = STATIONS[0].id;
                    }
                    return state as unknown as MusicState;
                }
                return persistedState as unknown as MusicState;
            },
            onRehydrateStorage: () => (state) => {
                if (!state) return;
                if (!STATIONS.some((s) => s.id === state.currentStationId)) {
                    state.currentStationId = STATIONS[0].id;
                }
            },
        }
    )
);
