'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSessionStore } from '@/store/sessionStore';
import { StatsCard } from '@/components/StatsCard';
import { CalendarHeatmap } from '@/components/CalendarHeatmap';

export default function StatsPage() {
    const { getTodayStats, getStreak, getAverageQuality, getMostProductiveHour, sessions } = useSessionStore();
    const [mounted, setMounted] = useState(false);
    const [todayStats, setTodayStats] = useState({ pomodoros: 0, focusMinutes: 0 });
    const [streak, setStreak] = useState(0);
    const [totalPomodoros, setTotalPomodoros] = useState(0);
    const [avgQuality, setAvgQuality] = useState({ value: 0, count: 0 });
    const [bestHour, setBestHour] = useState<{ hour: number; count: number } | null>(null);

    useEffect(() => {
        setMounted(true);
        setTodayStats(getTodayStats());
        setStreak(getStreak());
        setTotalPomodoros(sessions.filter((s) => s.type === 'focus').length);
        setAvgQuality(getAverageQuality());
        setBestHour(getMostProductiveHour());
    }, [getTodayStats, getStreak, getAverageQuality, getMostProductiveHour, sessions]);

    if (!mounted) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen p-6"
            style={{ backgroundColor: 'var(--background)' }}
        >
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold" style={{ color: 'var(--text-dark)' }}>
                        Statistics
                    </h1>
                </div>

                {/* Today's Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatsCard
                        title="Today's Pomodoros"
                        value={`${todayStats.pomodoros} 🍅`}
                    />
                    <StatsCard
                        title="Focus Time Today"
                        value={`${todayStats.focusMinutes}m`}
                        color="var(--text-dark)"
                    />
                    <StatsCard
                        title="Current Streak"
                        value={`${streak} days`}
                        color="var(--success)"
                    />
                    <StatsCard
                        title="Total Pomodoros"
                        value={totalPomodoros}
                        color="var(--primary-dark)"
                    />
                    <StatsCard
                        title="Avg Focus Quality"
                        value={avgQuality.value > 0 ? `${avgQuality.value} ★` : 'N/A'}
                        subtitle={avgQuality.count > 0 ? `Based on ${avgQuality.count} sessions` : 'No ratings yet'}
                        color="#FFD700"
                        className="col-span-2"
                    />
                    <StatsCard
                        title="Best Focus Time"
                        value={bestHour ? `${bestHour.hour}:00 - ${bestHour.hour + 1}:00` : 'N/A'}
                        subtitle={bestHour ? `${bestHour.count} sessions in this hour` : 'Need more data'}
                        color="#4ECDC4"
                        className="col-span-2"
                    />
                </div>

                {/* Calendar Heatmap */}
                <CalendarHeatmap days={35} />

                {/* Weekly Summary */}
                <div className="card mt-6">
                    <h3
                        className="text-lg font-semibold mb-4"
                        style={{ color: 'var(--text-dark)' }}
                    >
                        This Week
                    </h3>
                    <WeeklySummary />
                </div>

                {/* Weekly Goal */}
                <div className="card mt-6">
                    <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-dark)' }}>
                        Weekly Goal (20h)
                    </h3>
                    <WeeklyGoal />
                </div>
            </div>
        </motion.div>
    );
}

function WeeklySummary() {
    const { sessions } = useSessionStore();
    const [weekData, setWeekData] = useState<{ day: string; count: number }[]>([]);

    useEffect(() => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const data = days.map((day, index) => {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + index);
            const dateStr = date.toDateString();

            const count = sessions.filter((s) => {
                const sessionDate = new Date(s.completedAt);
                return sessionDate.toDateString() === dateStr && s.type === 'focus';
            }).length;

            return { day, count };
        });

        setWeekData(data);
    }, [sessions]);

    const maxCount = Math.max(...weekData.map((d) => d.count), 1);

    return (
        <div className="flex items-end justify-between gap-2 h-32">
            {weekData.map(({ day, count }) => (
                <div key={day} className="flex-1 flex flex-col items-center">
                    <motion.div
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="w-full rounded-t-lg origin-bottom"
                        style={{
                            backgroundColor: count > 0 ? 'var(--primary)' : 'var(--primary-lighter)',
                            height: `${Math.max((count / maxCount) * 80, 8)}px`,
                        }}
                    />
                    <span
                        className="text-xs mt-2"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        {day}
                    </span>
                    <span
                        className="text-xs font-medium"
                        style={{ color: 'var(--text-light)' }}
                    >
                        {count}
                    </span>
                </div>
            ))}
        </div>
    );
}

function WeeklyGoal() {
    const { sessions } = useSessionStore();
    const [weeklyHours, setWeeklyHours] = useState(0);
    const goalHours = 20;

    useEffect(() => {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const thisWeekSessions = sessions.filter(s => {
            const date = new Date(s.completedAt);
            return date >= startOfWeek && s.type === 'focus';
        });

        const totalMinutes = thisWeekSessions.reduce((acc, s) => acc + s.duration, 0) / 60;
        setWeeklyHours(Math.round(totalMinutes / 60 * 10) / 10);
    }, [sessions]);

    const progress = Math.min((weeklyHours / goalHours) * 100, 100);

    return (
        <div>
            <div className="flex justify-between mb-2 text-sm">
                <span style={{ color: 'var(--text-light)' }}>{weeklyHours} hrs completed</span>
                <span style={{ color: 'var(--text-muted)' }}>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--primary-lighter)' }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: 'var(--primary)' }}
                />
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                {weeklyHours >= goalHours ? '🎉 Goal reached! Amazing work!' : 'Keep going, you can do it! 💪'}
            </p>
        </div>
    );
}
