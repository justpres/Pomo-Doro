import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TimerMode } from '@/lib/constants';
import { useTaskStore } from './taskStore';

export interface ParkedThought {
    id: string;
    text: string;
    mode: TimerMode;
    status: 'parked' | 'resolved' | 'converted';
    createdAt: string;
}

interface ThoughtState {
    thoughts: ParkedThought[];

    // Actions
    parkThought: (text: string, mode?: TimerMode) => string;
    resolveThought: (id: string) => void;
    deleteThought: (id: string) => void;
    convertToTask: (id: string, estimatedPomodoros?: number) => void;
    clearResolved: () => void;
    getParkedCount: () => number;
}

export const useThoughtStore = create<ThoughtState>()(
    persist(
        (set, get) => ({
            thoughts: [],

            parkThought: (text, mode = 'focus') => {
                const trimmed = text.trim();
                if (!trimmed) return '';

                const id =
                    typeof crypto !== 'undefined' && crypto.randomUUID
                        ? crypto.randomUUID()
                        : `thought-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

                const newThought: ParkedThought = {
                    id,
                    text: trimmed,
                    mode,
                    status: 'parked',
                    createdAt: new Date().toISOString(),
                };

                set((state) => ({
                    thoughts: [newThought, ...state.thoughts],
                }));

                return id;
            },

            resolveThought: (id) => {
                set((state) => ({
                    thoughts: state.thoughts.map((t) =>
                        t.id === id ? { ...t, status: 'resolved' } : t
                    ),
                }));
            },

            deleteThought: (id) => {
                set((state) => ({
                    thoughts: state.thoughts.filter((t) => t.id !== id),
                }));
            },

            convertToTask: (id, estimatedPomodoros = 1) => {
                const thought = get().thoughts.find((t) => t.id === id);
                if (!thought) return;

                useTaskStore.getState().addTask(thought.text, estimatedPomodoros);

                set((state) => ({
                    thoughts: state.thoughts.map((t) =>
                        t.id === id ? { ...t, status: 'converted' } : t
                    ),
                }));
            },

            clearResolved: () => {
                set((state) => ({
                    thoughts: state.thoughts.filter((t) => t.status === 'parked'),
                }));
            },

            getParkedCount: () => {
                return get().thoughts.filter((t) => t.status === 'parked').length;
            },
        }),
        {
            name: 'pomodoro-thought-storage',
        }
    )
);
