'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useSessionStore, Session } from '@/store/sessionStore';

interface CalendarHeatmapProps {
    days?: number; // Number of days to show
}

export function CalendarHeatmap({ days = 35 }: CalendarHeatmapProps) {
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
        if (count === 0) return 'rgba(28, 25, 23, 0.06)';
        const intensity = Math.min(count / maxCount, 1);
        if (intensity < 0.25) return '#FFB3B3';
        if (intensity < 0.5) return '#FF8585';
        if (intensity < 0.75) return '#FF6363';
        return '#E04848';
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-sm text-stone-900">
                        Daily Focus Heatmap
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                        Session distribution across the last {days} days.
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
                {heatmapData.map(({ date, count, dateStr }, index) => (
                    <motion.div
                        key={dateStr}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: Math.min((index % 20) * 0.01, 0.15) }}
                        className="w-4 h-4 rounded-[3px] cursor-pointer transition-transform hover:scale-125 border border-stone-200/40"
                        style={{ backgroundColor: getColor(count) }}
                        title={`${formatDate(date)}: ${count} pomodoro${count !== 1 ? 's' : ''}`}
                    />
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 pt-1 text-[11px] text-stone-400">
                <span>Less</span>
                <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="w-3 h-3 rounded-[2px]"
                            style={{ backgroundColor: getColor(i * 2) }}
                        />
                    ))}
                </div>
                <span>More</span>
            </div>
        </div>
    );
}
