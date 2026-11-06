import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Task {
    id: string;
    title: string;
    estimatedPomodoros: number;
    actualPomodoros: number;
    status: 'pending' | 'in-progress' | 'completed';
    date: string; // ISO date string (YYYY-MM-DD)
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

const getDateString = (date: Date = new Date()): string => {
    return date.toISOString().split('T')[0];
};

export const useTaskStore = create<TaskState>()(
    persist(
        (set, get) => ({
            tasks: [],
            activeTaskId: null,

            addTask: (title, estimatedPomodoros) => {
                const newTask: Task = {
                    id: `task-${Date.now()}`,
                    title,
                    estimatedPomodoros,
                    actualPomodoros: 0,
                    status: 'pending',
                    date: getDateString(),
                    createdAt: new Date().toISOString(),
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
                const task = id ? get().tasks.find((t) => t.id === id) : null;
                if (task && task.status === 'pending') {
                    get().updateTask(id!, { status: 'in-progress' });
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
                return get().getTasksByDate(getDateString());
            },
        }),
        {
            name: 'pomodoro-tasks-storage',
        }
    )
);
