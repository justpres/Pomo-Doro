'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface StatsCardProps {
    title: string;
    value: string | number;
    subtitle?: string; // Secondary info like "Based on 12 sessions"
    icon?: ReactNode;
    color?: string;
    className?: string; // Optional custom class
}

export function StatsCard({ title, value, subtitle, color = 'var(--primary)', className = '' }: StatsCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`card flex flex-col items-center justify-center py-6 ${className}`}
        >
            <p
                className="text-sm font-medium mb-2"
                style={{ color: 'var(--text-light)' }}
            >
                {title}
            </p>
            <p
                className="text-4xl font-bold"
                style={{ color }}
            >
                {value}
            </p>
            {subtitle && (
                <p
                    className="text-xs mt-1"
                    style={{ color: 'var(--text-muted)' }}
                >
                    {subtitle}
                </p>
            )}
        </motion.div>
    );
}
