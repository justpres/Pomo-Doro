'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface StatsCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: ReactNode;
    color?: string;
    className?: string;
}

export function StatsCard({ title, value, subtitle, icon, color, className = '' }: StatsCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`card p-4 sm:p-5 flex flex-col justify-between transition-all bg-white border border-stone-200/80 shadow-xs hover:border-stone-300 ${className}`}
        >
            <div className="flex items-center justify-between text-xs text-stone-500 font-medium mb-2">
                <span>{title}</span>
                {icon && <span className="text-base">{icon}</span>}
            </div>

            <div>
                <p
                    className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 tabular-nums"
                    style={color ? { color } : undefined}
                >
                    {value}
                </p>
                {subtitle && (
                    <p className="text-[11px] text-stone-400 mt-1 truncate">
                        {subtitle}
                    </p>
                )}
            </div>
        </motion.div>
    );
}
