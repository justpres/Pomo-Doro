import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toLocalDateKey } from '@/lib/date';

export interface Task {
    id: string;
    title: string;
    estimatedPomodoros: number;
    actualPomodoros: number;
    status: 'pending' | 'in-progress' | 'completed';
    date: string; // ISO date string (YYYY-MM-DD) in local time
    createdAt: string;
    completedAt?: string;
}

interface TaskState {
    tasks: Task[];
    activeTaskId: string | null;

    // Actions
    addTask: (title: string, estimatedPomodoros: number) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    deleteTask: (id: string) => void;
    setActiveTask: (id: string | null) => void;
    incrementTaskPomodoro: (id: string) => void;
    completeTask: (id: string) => void;
    getTasksByDate: (date: string) => Task[];
    getTodayTasks: () => Task[];
}

export const useTaskStore = create<TaskState>()(
    persist(
        (set, get) => ({
            tasks: [],
            activeTaskId: null,

            addTask: (title, estimatedPomodoros) => {
                const now = new Date();
                const id = typeof crypto !== 'undefined' && crypto.randomUUID
                    ? crypto.randomUUID()
                    : `task-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

                const newTask: Task = {
                    id,
                    title,
                    estimatedPomodoros,
                    actualPomodoros: 0,
                    status: 'pending',
                    date: toLocalDateKey(now),
                    createdAt: now.toISOString(),
                };
                set((state) => ({
                    tasks: [...state.tasks, newTask],
                }));
            },

            updateTask: (id, updates) => {
                set((state) => ({
                    tasks: state.tasks.map((task) =>
                        task.id === id ? { ...task, ...updates } : task
                    ),
                }));
            },

            deleteTask: (id) => {
                set((state) => ({
                    tasks: state.tasks.filter((task) => task.id !== id),
                    activeTaskId: state.activeTaskId === id ? null : state.activeTaskId,
                }));
            },

            setActiveTask: (id) => {
                if (id) {
                    const task = get().tasks.find((t) => t.id === id);
                    if (task && task.status === 'pending') {
                        get().updateTask(id, { status: 'in-progress' });
                    }
                }
                set({ activeTaskId: id });
            },

            incrementTaskPomodoro: (id) => {
                set((state) => ({
                    tasks: state.tasks.map((task) =>
                        task.id === id
                            ? { ...task, actualPomodoros: task.actualPomodoros + 1 }
                            : task
                    ),
                }));
            },

            completeTask: (id) => {
                set((state) => ({
                    tasks: state.tasks.map((task) =>
                        task.id === id
                            ? { ...task, status: 'completed', completedAt: new Date().toISOString() }
                            : task
                    ),
                    activeTaskId: state.activeTaskId === id ? null : state.activeTaskId,
                }));
            },

            getTasksByDate: (date) => {
                return get().tasks.filter((task) => task.date === date);
            },

            getTodayTasks: () => {
                return get().getTasksByDate(toLocalDateKey());
            },
        }),
        {
            name: 'pomodoro-tasks-storage',
            version: 1,
            migrate: (persistedState: unknown, version: number) => {
                const state = persistedState as (Partial<TaskState> & { tasks?: Array<Task & { createdAt?: string }> }) | undefined;
                if (version < 1 && state?.tasks) {
                    const migratedTasks = state.tasks.map((task) => ({
                        ...task,
                        date: task.createdAt ? toLocalDateKey(new Date(task.createdAt)) : task.date,
                    }));
                    return {
                        ...state,
                        tasks: migratedTasks,
                    } as TaskState;
                }
                return persistedState as TaskState;
            },
        }
    )
);
