'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useSessionStore, Session } from '@/store/sessionStore';

interface CalendarHeatmapProps {
    days?: number; // Number of days to show
}

export function CalendarHeatmap({ days = 30 }: CalendarHeatmapProps) {
    const { sessions } = useSessionStore();

    const heatmapData = useMemo(() => {
        const data: { date: Date; count: number; dateStr: string }[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);

            const dateStr = date.toDateString();
            const count = sessions.filter((s: Session) => {
                const sessionDate = new Date(s.completedAt);
                return sessionDate.toDateString() === dateStr && s.type === 'focus';
            }).length;

            data.push({ date, count, dateStr });
        }

        return data;
    }, [sessions, days]);

    const maxCount = Math.max(...heatmapData.map((d) => d.count), 1);

    const getColor = (count: number) => {
        if (count === 0) return 'var(--primary-lighter)';
        const intensity = Math.min(count / maxCount, 1);
        if (intensity < 0.25) return '#FFB3B3';
        if (intensity < 0.5) return '#FF8787';
        if (intensity < 0.75) return '#FF6B6B';
        return '#E85555';
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="card">
            <h3
                className="text-lg font-semibold mb-4"
                style={{ color: 'var(--text-dark)' }}
            >
                Activity (Last {days} Days)
            </h3>

            <div className="flex flex-wrap gap-1">
                {heatmapData.map(({ date, count, dateStr }) => (
                    <motion.div
                        key={dateStr}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: Math.random() * 0.2 }}
                        className="w-4 h-4 rounded-sm cursor-pointer transition-transform hover:scale-125"
                        style={{ backgroundColor: getColor(count) }}
                        title={`${formatDate(date)}: ${count} pomodoro${count !== 1 ? 's' : ''}`}
                    />
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span>Less</span>
                <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="w-3 h-3 rounded-sm"
                            style={{ backgroundColor: getColor(i * 2) }}
                        />
                    ))}
                </div>
                <span>More</span>
            </div>
        </div>
    );
}
