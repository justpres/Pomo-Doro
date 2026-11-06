import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Session {
    id: string;
    type: 'focus' | 'shortBreak' | 'longBreak';
    duration: number; // in seconds
    completedAt: string; // ISO date string
    presetId?: string;
    focusQuality?: number; // 1-5 rating
}

interface SessionState {
    sessions: Session[];

    // Actions
    logSession: (session: Omit<Session, 'id' | 'completedAt'>) => void;
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

            logSession: (session) => {
                const newSession: Session = {
                    ...session,
                    id: `session-${Date.now()}`,
                    completedAt: new Date().toISOString(),
                };
                set((state) => ({
                    sessions: [...state.sessions, newSession],
                }));
            },

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
                const sessions = get().sessions;
                if (sessions.length === 0) return 0;

                // Sort sessions by date descending
                const sortedDates = [...new Set(
                    sessions
                        .filter((s) => s.type === 'focus')
                        .map((s) => new Date(s.completedAt).toDateString())
                )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

                if (sortedDates.length === 0) return 0;

                let streak = 0;
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                for (let i = 0; i < sortedDates.length; i++) {
                    const sessionDate = new Date(sortedDates[i]);
                    sessionDate.setHours(0, 0, 0, 0);

                    const expectedDate = new Date(today);
                    expectedDate.setDate(today.getDate() - i);

                    if (sessionDate.getTime() === expectedDate.getTime()) {
                        streak++;
                    } else if (i === 0 && sessionDate.getTime() === expectedDate.getTime() - 86400000) {
                        // Allow for yesterday if no session today yet
                        continue;
                    } else {
                        break;
                    }
                }

                return streak;
            },

            getAverageQuality: () => {
                const ratedSessions = get().sessions.filter(s => s.focusQuality !== undefined);
                if (ratedSessions.length === 0) return { value: 0, count: 0 };
                const total = ratedSessions.reduce((acc, s) => acc + (s.focusQuality || 0), 0);
                return {
                    value: Math.round((total / ratedSessions.length) * 10) / 10,
                    count: ratedSessions.length
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
                const sessions = get().sessions.filter(s => s.type === 'focus');
                if (sessions.length === 0) return null;

                const hourCounts = new Map<number, number>();
                sessions.forEach(session => {
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
        }
    )
);
