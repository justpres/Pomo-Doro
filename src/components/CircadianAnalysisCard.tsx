'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useSessionStore } from '@/store/sessionStore';
import {
    computeHourlyProfile,
    findBiologicalPrimeTime,
    HourlyProfile,
} from '@/lib/circadian';

export function CircadianAnalysisCard() {
    const { sessions } = useSessionStore();
    const [hoveredHour, setHoveredHour] = useState<HourlyProfile | null>(null);

    const hourlyProfile = useMemo(() => computeHourlyProfile(sessions), [sessions]);
    const bpt = useMemo(() => findBiologicalPrimeTime(sessions), [sessions]);

    const maxSessionCount = Math.max(...hourlyProfile.map((h) => h.sessionCount), 1);

    return (
        <div className="card p-5 sm:p-6 space-y-4 border border-stone-200/80 bg-white rounded-3xl shadow-xs">
            {/* Header */}
            <div>
                <h3 className="font-bold text-sm sm:text-base text-stone-900">
                    24-Hour Energy &amp; Focus Curve
                </h3>
            </div>

            {/* 24-Hour Chart */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-xs text-stone-500 font-medium">Hourly Focus Distribution</span>

                    {hoveredHour ? (
                        <span className="font-mono text-[11px] text-stone-700 font-medium">
                            {String(hoveredHour.hour).padStart(2, '0')}:00 • {hoveredHour.sessionCount} session{hoveredHour.sessionCount === 1 ? '' : 's'}
                            {hoveredHour.averageQuality > 0 ? ` (${hoveredHour.averageQuality}★)` : ''}
                        </span>
                    ) : (
                        <span className="text-[11px] text-stone-400">
                            Hover column for stats
                        </span>
                    )}
                </div>

                {/* 24 Columns Chart */}
                <div className="flex items-end justify-between gap-1 h-28 pt-2 pb-1 border-b border-stone-100">
                    {hourlyProfile.map((h) => {
                        const ratio = Math.max((h.sessionCount / maxSessionCount) * 100, h.sessionCount > 0 ? 15 : 4);
                        const isPrime = bpt && h.hour >= bpt.startHour && h.hour < bpt.endHour;
                        const isSlump = h.hour >= 13 && h.hour <= 15;

                        // Color coding by focus rating
                        const barColor =
                            h.sessionCount === 0
                                ? 'bg-stone-100'
                                : h.averageQuality >= 4
                                ? 'bg-emerald-500'
                                : h.averageQuality >= 3
                                ? 'bg-amber-500'
                                : 'bg-[#FF6363]';

                        return (
                            <div
                                key={h.hour}
                                onMouseEnter={() => setHoveredHour(h)}
                                onMouseLeave={() => setHoveredHour(null)}
                                className={`flex-1 flex flex-col items-center justify-end h-full relative cursor-pointer group ${
                                    isSlump ? 'opacity-85' : ''
                                }`}
                            >
                                <div className="w-full rounded-md overflow-hidden flex flex-col justify-end h-20 bg-stone-50 group-hover:bg-stone-100/80 transition-colors p-0.5">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${ratio}%` }}
                                        transition={{ duration: 0.4, ease: 'easeOut' }}
                                        className={`w-full rounded-sm ${barColor} ${
                                            isPrime ? 'ring-1 ring-emerald-600 shadow-2xs' : ''
                                        }`}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Time Axis Labels */}
                <div className="flex justify-between text-[10px] text-stone-400 font-mono pt-0.5 select-none px-1">
                    <span>12 AM</span>
                    <span>4 AM</span>
                    <span>8 AM</span>
                    <span>12 PM</span>
                    <span>4 PM</span>
                    <span>8 PM</span>
                    <span>11 PM</span>
                </div>
            </div>
        </div>
    );
}
