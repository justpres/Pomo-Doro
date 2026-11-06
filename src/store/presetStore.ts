import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Preset {
    id: string;
    name: string;
    focusDuration: number; // in seconds
    shortBreakDuration: number;
    longBreakDuration: number;
    pomodorosBeforeLongBreak: number;
    isDefault?: boolean;
}

interface PresetState {
    presets: Preset[];
    activePresetId: string | null;

    // Actions
    addPreset: (preset: Omit<Preset, 'id'>) => void;
    updatePreset: (id: string, updates: Partial<Preset>) => void;
    deletePreset: (id: string) => void;
    setActivePreset: (id: string | null) => void;
    getPreset: (id: string) => Preset | undefined;
}

// Research-backed default presets
const defaultPresets: Preset[] = [
    {
        id: 'classic',
        name: 'Classic Pomodoro',
        focusDuration: 25 * 60,
        shortBreakDuration: 5 * 60,
        longBreakDuration: 15 * 60,
        pomodorosBeforeLongBreak: 4,
        isDefault: true,
    },
    {
        id: 'desktime',
        name: 'DeskTime 52/17',
        focusDuration: 52 * 60,
        shortBreakDuration: 17 * 60,
        longBreakDuration: 30 * 60,
        pomodorosBeforeLongBreak: 3,
        isDefault: true,
    },
    {
        id: 'ultradian',
        name: 'Ultradian 90',
        focusDuration: 90 * 60,
        shortBreakDuration: 20 * 60,
        longBreakDuration: 45 * 60,
        pomodorosBeforeLongBreak: 2,
        isDefault: true,
    },
    {
        id: 'quick-sprint',
        name: 'Quick Sprint',
        focusDuration: 15 * 60,
        shortBreakDuration: 3 * 60,
        longBreakDuration: 10 * 60,
        pomodorosBeforeLongBreak: 4,
        isDefault: true,
    },
];

export const usePresetStore = create<PresetState>()(
    persist(
        (set, get) => ({
            presets: defaultPresets,
            activePresetId: 'classic',

            addPreset: (preset) => {
                const newPreset: Preset = {
                    ...preset,
                    id: `custom-${Date.now()}`,
                };
                set((state) => ({
                    presets: [...state.presets, newPreset],
                }));
            },

            updatePreset: (id, updates) => {
                set((state) => ({
                    presets: state.presets.map((p) =>
                        p.id === id ? { ...p, ...updates } : p
                    ),
                }));
            },

            deletePreset: (id) => {
                const preset = get().presets.find((p) => p.id === id);
                if (preset?.isDefault) return; // Can't delete default presets

                set((state) => ({
                    presets: state.presets.filter((p) => p.id !== id),
                    activePresetId: state.activePresetId === id ? 'classic' : state.activePresetId,
                }));
            },

            setActivePreset: (id) => set({ activePresetId: id }),

            getPreset: (id) => get().presets.find((p) => p.id === id),
        }),
        {
            name: 'pomodoro-presets-storage',
        }
    )
);
