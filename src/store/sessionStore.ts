import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { computeStreak } from '@/lib/stats';

export interface Session {
    id: string;
    type: 'focus' | 'shortBreak' | 'longBreak';
    duration: number; // in seconds
    completedAt: string; // ISO date string
    presetId?: string;
    focusQuality?: number; // 1-5 rating
    intention?: string;
}

export type LogSessionInput = Omit<Session, 'id' | 'completedAt'> & {
    completedAt?: string | number | Date;
};

interface SessionState {
    sessions: Session[];
    pendingRatingId: string | null;

    // Actions
    logSession: (session: LogSessionInput) => string;
    setPendingRating: (id: string | null) => void;
    clearPendingRating: () => void;
    getSessionsByDate: (date: Date) => Session[];
    getSessionsInRange: (startDate: Date, endDate: Date) => Session[];
    getTodayStats: () => { pomodoros: number; focusMinutes: number };
    getStreak: () => number;
    getAverageQuality: () => { value: number; count: number };
    updateSessionQuality: (id: string, quality: number) => void;
    getLastSessionId: () => string | null;
    getMostProductiveHour: () => { hour: number; count: number } | null;
    clearSessions: () => void;
}

const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
};

export const useSessionStore = create<SessionState>()(
    persist(
        (set, get) => ({
            sessions: [],
            pendingRatingId: null,

            logSession: (session) => {
                const id = typeof crypto !== 'undefined' && crypto.randomUUID
                    ? crypto.randomUUID()
                    : `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

                const completedAt = session.completedAt
                    ? new Date(session.completedAt).toISOString()
                    : new Date().toISOString();

                const newSession: Session = {
                    ...session,
                    id,
                    completedAt,
                };

                set((state) => ({
                    sessions: [...state.sessions, newSession],
                }));

                return id;
            },

            setPendingRating: (id) => set({ pendingRatingId: id }),

            clearPendingRating: () => set({ pendingRatingId: null }),

            getSessionsByDate: (date) => {
                return get().sessions.filter((session) =>
                    isSameDay(new Date(session.completedAt), date)
                );
            },

            getSessionsInRange: (startDate, endDate) => {
                return get().sessions.filter((session) => {
                    const sessionDate = new Date(session.completedAt);
                    return sessionDate >= startDate && sessionDate <= endDate;
                });
            },

            getTodayStats: () => {
                const today = new Date();
                const todaySessions = get().getSessionsByDate(today);
                const focusSessions = todaySessions.filter((s) => s.type === 'focus');

                return {
                    pomodoros: focusSessions.length,
                    focusMinutes: Math.round(
                        focusSessions.reduce((acc, s) => acc + s.duration, 0) / 60
                    ),
                };
            },

            getStreak: () => {
                const focusDates = get().sessions
                    .filter((s) => s.type === 'focus')
                    .map((s) => new Date(s.completedAt));
                return computeStreak(focusDates, new Date());
            },

            getAverageQuality: () => {
                const ratedSessions = get().sessions.filter((s) => s.focusQuality !== undefined);
                if (ratedSessions.length === 0) return { value: 0, count: 0 };
                const total = ratedSessions.reduce((acc, s) => acc + (s.focusQuality || 0), 0);
                return {
                    value: Math.round((total / ratedSessions.length) * 10) / 10,
                    count: ratedSessions.length,
                };
            },

            updateSessionQuality: (id, quality) => {
                set((state) => ({
                    sessions: state.sessions.map((s) =>
                        s.id === id ? { ...s, focusQuality: quality } : s
                    ),
                }));
            },

            getLastSessionId: () => {
                const sessions = get().sessions;
                if (sessions.length === 0) return null;
                return sessions[sessions.length - 1].id;
            },

            getMostProductiveHour: () => {
                const sessions = get().sessions.filter((s) => s.type === 'focus');
                if (sessions.length === 0) return null;

                const hourCounts = new Map<number, number>();
                sessions.forEach((session) => {
                    const hour = new Date(session.completedAt).getHours();
                    hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
                });

                let maxHour = 0;
                let maxCount = -1;

                hourCounts.forEach((count, hour) => {
                    if (count > maxCount) {
                        maxCount = count;
                        maxHour = hour;
                    }
                });

                return maxCount > 0 ? { hour: maxHour, count: maxCount } : null;
            },

            clearSessions: () => set({ sessions: [] }),
        }),
        {
            name: 'pomodoro-sessions-storage',
            partialize: (state) => ({
                sessions: state.sessions,
            }),
        }
    )
);
