'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useSessionStore } from '@/store/sessionStore';
import {
    computeHourlyProfile,
    detectChronotype,
    findBiologicalPrimeTime,
    HourlyProfile,
} from '@/lib/circadian';

export function CircadianAnalysisCard() {
    const { sessions } = useSessionStore();
    const [hoveredHour, setHoveredHour] = useState<HourlyProfile | null>(null);

    const hourlyProfile = useMemo(() => computeHourlyProfile(sessions), [sessions]);
    const chronotype = useMemo(() => detectChronotype(sessions), [sessions]);
    const bpt = useMemo(() => findBiologicalPrimeTime(sessions), [sessions]);

    const maxSessionCount = Math.max(...hourlyProfile.map((h) => h.sessionCount), 1);

    return (
        <div className="card p-5 sm:p-6 space-y-5 border border-stone-200/80 bg-white rounded-3xl shadow-xs">
            {/* Header with Chronotype Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 rounded-2xl bg-stone-50 border border-stone-200/60 flex items-center justify-center">
                        {chronotype.icon}
                    </span>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm sm:text-base text-stone-900">
                                {chronotype.label}
                            </h3>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-700">
                                {chronotype.badge}
                            </span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                            Circadian rhythm &amp; biological prime-time analysis
                        </p>
                    </div>
                </div>

                {bpt && (
                    <div className="flex items-center gap-2 self-start sm:self-auto bg-emerald-50/80 border border-emerald-200/60 px-3 py-1.5 rounded-2xl">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <div>
                            <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-800 block leading-tight">
                                Biological Prime Time
                            </span>
                            <span className="text-xs font-semibold text-emerald-950 font-mono">
                                {String(bpt.startHour).padStart(2, '0')}:00 – {String(bpt.endHour).padStart(2, '0')}:00
                                {bpt.averageQuality > 0 && ` (${bpt.averageQuality}★)`}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* 24-Hour Circadian Heatmap & Distribution Chart */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-700 flex items-center gap-1.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-500">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        24-Hour Energy &amp; Focus Curve
                    </span>

                    {hoveredHour ? (
                        <span className="font-mono text-[11px] text-stone-600 font-medium">
                            {String(hoveredHour.hour).padStart(2, '0')}:00 • {hoveredHour.sessionCount} session{hoveredHour.sessionCount === 1 ? '' : 's'}
                            {hoveredHour.averageQuality > 0 ? ` (${hoveredHour.averageQuality}★)` : ''}
                        </span>
                    ) : (
                        <span className="text-[11px] text-stone-400">
                            Hover column to view hourly rating
                        </span>
                    )}
                </div>

                {/* 24 Columns Chart */}
                <div className="flex items-end justify-between gap-1 h-32 pt-2 pb-1 border-b border-stone-100">
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
                                <div className="w-full rounded-md overflow-hidden flex flex-col justify-end h-24 bg-stone-50 group-hover:bg-stone-100/80 transition-colors p-0.5">
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

            {/* Scientific Recommendation & Task Alignment */}
            <div className="bg-stone-50/80 border border-stone-200/60 rounded-2xl p-4 space-y-2">
                <div className="flex items-start gap-2">
                    <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block mt-0.5">
                        Chronobiology Advisory:
                    </span>
                </div>
                <p className="text-xs text-stone-700 leading-relaxed">
                    {chronotype.recommendation}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-stone-200/50 mt-2">
                    <span className="text-[10px] uppercase font-bold text-stone-400">
                        Prime Work:
                    </span>
                    <span className="text-xs font-medium text-stone-800 bg-white px-2.5 py-0.5 rounded-lg border border-stone-200/80">
                        {chronotype.optimalTasks}
                    </span>
                </div>

                <p className="text-[10px] text-stone-400 italic pt-1">
                    Grounding: {chronotype.scientificBasis}
                </p>
            </div>
        </div>
    );
}
