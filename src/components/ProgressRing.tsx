'use client';

import { motion } from 'framer-motion';

interface ProgressRingProps {
    progress: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    mode?: 'focus' | 'shortBreak' | 'longBreak';
}

export function ProgressRing({
    progress,
    size = 300,
    strokeWidth = 8,
    color = 'var(--primary)',
    mode = 'focus',
}: ProgressRingProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - progress * circumference;

    const isFocusMode = mode === 'focus';
    const fillProgress = isFocusMode ? progress : (1 - progress);
    const innerSize = size - strokeWidth * 2;

    // Water level position (from bottom)
    const waterLevel = fillProgress * 100;

    // Colors - tomato pink for focus, green for break
    const primaryColor = isFocusMode ? '#FF6B6B' : '#51CF66';

    return (
        <div className="relative" style={{ width: size, height: size }}>
            {/* Circular clipping container */}
            <div
                className="absolute overflow-hidden"
                style={{
                    width: innerSize,
                    height: innerSize,
                    left: strokeWidth,
                    top: strokeWidth,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                }}
            >
                {/* Water container */}
                <motion.div
                    className="absolute left-0 right-0 bottom-0"
                    animate={{ height: `${waterLevel}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{ overflow: 'hidden' }}
                >
                    {/* Wave layer 1 - oscillates left to right to left */}
                    <div
                        style={{
                            position: 'absolute',
                            top: -20,
                            left: '-50%',
                            width: '200%',
                            height: 50,
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,60 C150,90 350,30 600,60 C850,90 1050,30 1200,60 L1200,120 L0,120 Z' fill='${encodeURIComponent(primaryColor)}' fill-opacity='0.6'/%3E%3C/svg%3E")`,
                            backgroundSize: '200px 50px',
                            backgroundRepeat: 'repeat-x',
                            animation: 'waveOscillate 2s ease-in-out infinite alternate',
                        }}
                    />

                    {/* Wave layer 2 - oscillates opposite direction */}
                    <div
                        style={{
                            position: 'absolute',
                            top: -12,
                            left: '-50%',
                            width: '200%',
                            height: 40,
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,60 C200,30 400,90 600,60 C800,30 1000,90 1200,60 L1200,120 L0,120 Z' fill='${encodeURIComponent(primaryColor)}' fill-opacity='0.4'/%3E%3C/svg%3E")`,
                            backgroundSize: '180px 40px',
                            backgroundRepeat: 'repeat-x',
                            animation: 'waveOscillate 2.5s ease-in-out infinite alternate-reverse',
                        }}
                    />

                    {/* Solid water body */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 20,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: primaryColor,
                            opacity: 0.4,
                        }}
                    />
                </motion.div>
            </div>

            {/* SVG Progress Ring */}
            <svg
                width={size}
                height={size}
                className="progress-ring absolute top-0 left-0"
                style={{ transform: 'rotate(-90deg)' }}
            >
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="var(--primary-lighter)"
                    strokeWidth={strokeWidth}
                    opacity={0.3}
                />
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                />
            </svg>

            {/* Wave animation - oscillates back and forth */}

        </div>
    );
}
