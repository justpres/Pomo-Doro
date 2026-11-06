'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSessionStore } from '@/store/sessionStore';
import { StatsCard } from '@/components/StatsCard';
import { CalendarHeatmap } from '@/components/CalendarHeatmap';
import { CircadianAnalysisCard } from '@/components/CircadianAnalysisCard';
import { useMounted } from '@/hooks/useMounted';

export default function StatsPage() {
    const { getTodayStats, getStreak, getAverageQuality, getMostProductiveHour, sessions } = useSessionStore();
    const mounted = useMounted();

    const todayStats = useMemo(() => (mounted ? getTodayStats() : { pomodoros: 0, focusMinutes: 0 }), [mounted, getTodayStats]);
    const streak = useMemo(() => (mounted ? getStreak() : 0), [mounted, getStreak]);
    const totalPomodoros = useMemo(() => (mounted ? sessions.filter((s) => s.type === 'focus').length : 0), [mounted, sessions]);
    const avgQuality = useMemo(() => (mounted ? getAverageQuality() : { value: 0, count: 0 }), [mounted, getAverageQuality]);
    const bestHour = useMemo(() => (mounted ? getMostProductiveHour() : null), [mounted, getMostProductiveHour]);

    if (!mounted) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="min-h-screen p-4 sm:p-6 pb-28 md:pb-16"
            style={{ backgroundColor: 'var(--background)' }}
        >
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="pt-2">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
                        Productivity Insights
                    </h1>
                    <p className="text-xs sm:text-sm text-stone-500 mt-1">
                        Track your daily focus streaks, session counts, and work distribution.
                    </p>
                </div>

                {/* Metrics Summary Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    <StatsCard
                        title="Today's Sessions"
                        value={todayStats.pomodoros}
                        icon={
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#FF6363]">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                        }
                        color="#FF6363"
                    />
                    <StatsCard
                        title="Focus Minutes Today"
                        value={`${todayStats.focusMinutes}m`}
                        icon={
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-500">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 14 10" />
                            </svg>
                        }
                    />
                    <StatsCard
                        title="Daily Streak"
                        value={`${streak} days`}
                        icon={
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
                                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                            </svg>
                        }
                        color="#F59E0B"
                    />
                    <StatsCard
                        title="All-Time Sessions"
                        value={totalPomodoros}
                        icon={
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-500">
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                            </svg>
                        }
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <StatsCard
                        title="Avg Focus Rating"
                        value={avgQuality.value > 0 ? `${avgQuality.value} / 5` : 'N/A'}
                        subtitle={avgQuality.count > 0 ? `Based on ${avgQuality.count} rated sessions` : 'Rate sessions on completion'}
                        icon={
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                        }
                        color="#F59E0B"
                    />
                    <StatsCard
                        title="Peak Focus Window"
                        value={bestHour ? `${bestHour.hour}:00 – ${bestHour.hour + 1}:00` : 'Calibrating...'}
                        subtitle={bestHour ? `${bestHour.count} sessions completed in this window` : 'Complete more sessions to unlock'}
                        icon={
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
                                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                            </svg>
                        }
                        color="#10B981"
                    />
                </div>

                {/* Circadian Quality Analysis & Chronotype Advisory */}
                <CircadianAnalysisCard />

                {/* Calendar Heatmap */}
                <CalendarHeatmap days={35} />

                {/* Weekly Distribution Chart */}
                <div className="card p-5 space-y-4">
                    <div>
                        <h3 className="font-semibold text-sm text-stone-900">
                            Weekly Focus Distribution
                        </h3>
                        <p className="text-xs text-stone-500 mt-0.5">
                            Number of focus sessions completed per day this week.
                        </p>
                    </div>
                    <WeeklySummary />
                </div>

                {/* Weekly Goal Progress */}
                <div className="card p-5 space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-sm text-stone-900">
                                Weekly Focus Target (20h)
                            </h3>
                            <p className="text-xs text-stone-500 mt-0.5">
                                Steady deep work target for sustainable productivity.
                            </p>
                        </div>
                    </div>
                    <WeeklyGoal />
                </div>
            </div>
        </motion.div>
    );
}

function WeeklySummary() {
    const { sessions } = useSessionStore();

    const weekData = useMemo(() => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        return days.map((day, index) => {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + index);
            const dateStr = date.toDateString();

            const count = sessions.filter((s) => {
                const sessionDate = new Date(s.completedAt);
                return sessionDate.toDateString() === dateStr && s.type === 'focus';
            }).length;

            return { day, count };
        });
    }, [sessions]);

    const maxCount = Math.max(...weekData.map((d) => d.count), 1);

    return (
        <div className="flex items-end justify-between gap-2 h-36 pt-4">
            {weekData.map(({ day, count }) => {
                const ratio = Math.max((count / maxCount) * 100, count > 0 ? 12 : 4);
                return (
                    <div key={day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                        <span className="font-mono text-[11px] font-semibold text-stone-700 tabular-nums">
                            {count > 0 ? count : ''}
                        </span>
                        <div className="w-full max-w-[36px] bg-stone-100 rounded-lg overflow-hidden flex flex-col justify-end h-24 p-0.5">
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${ratio}%` }}
                                transition={{ duration: 0.4, ease: 'easeOut' }}
                                className={`w-full rounded-md transition-colors ${
                                    count > 0 ? 'bg-[#FF6363]' : 'bg-transparent'
                                }`}
                            />
                        </div>
                        <span className="text-[11px] font-medium text-stone-500">
                            {day}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

function WeeklyGoal() {
    const { sessions } = useSessionStore();
    const goalHours = 20;

    const weeklyHours = useMemo(() => {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const thisWeekSessions = sessions.filter((s) => {
            const date = new Date(s.completedAt);
            return date >= startOfWeek && s.type === 'focus';
        });

        const totalMinutes = thisWeekSessions.reduce((acc, s) => acc + s.duration, 0) / 60;
        return Math.round((totalMinutes / 60) * 10) / 10;
    }, [sessions]);

    const progress = Math.min((weeklyHours / goalHours) * 100, 100);

    return (
        <div className="space-y-2 pt-1">
            <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-stone-700">{weeklyHours}h completed</span>
                <span className="font-mono text-stone-400 tabular-nums">{Math.round(progress)}% of {goalHours}h</span>
            </div>
            <div className="w-full h-2.5 rounded-full overflow-hidden bg-stone-100">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full bg-[#FF6363]"
                />
            </div>
            <p className="text-[11px] text-stone-400">
                {weeklyHours >= goalHours ? 'Weekly goal achieved!' : `${(goalHours - weeklyHours).toFixed(1)}h remaining to reach your weekly focus target`}
            </p>
        </div>
    );
}
