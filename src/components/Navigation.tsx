'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SoundscapeDroplet } from './MusicPlayer';

interface IconProps {
    active: boolean;
}

const TimerIcon = ({ active }: IconProps) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? 'text-white' : 'text-stone-500'}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const TasksIcon = ({ active }: IconProps) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? 'text-white' : 'text-stone-500'}>
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
);

const PresetsIcon = ({ active }: IconProps) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? 'text-white' : 'text-stone-500'}>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
);

const StatsIcon = ({ active }: IconProps) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? 'text-white' : 'text-stone-500'}>
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
);

const SettingsIcon = ({ active }: IconProps) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? 'text-white' : 'text-stone-500'}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
);

const navItems = [
    { href: '/', label: 'Timer', Icon: TimerIcon },
    { href: '/tasks', label: 'Tasks', Icon: TasksIcon },
    { href: '/presets', label: 'Presets', Icon: PresetsIcon },
    { href: '/stats', label: 'Stats', Icon: StatsIcon },
    { href: '/settings', label: 'Settings', Icon: SettingsIcon },
];

export function Navigation() {
    const pathname = usePathname();

    return (
        <>
            {/* Desktop Navigation: Single Continuous Vector Silhouette */}
            <header className="fixed top-5 left-1/2 -translate-x-1/2 z-50 hidden md:flex flex-col items-center w-[496px] pointer-events-none">
                {/* Unified SVG Background: Single continuous path for nav + liquid meniscus droplet */}
                <div className="absolute inset-0 -z-10 pointer-events-none">
                    <svg
                        width="496"
                        height="88"
                        viewBox="0 0 496 88"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-full h-full filter drop-shadow-[0_4px_16px_rgba(28,25,23,0.07)]"
                    >
                        <path
                            d="M 24 0 L 472 0 A 24 24 0 0 1 472 48 L 388 48 A 16 16 0 0 0 372 64 L 372 72 A 16 16 0 0 1 356 88 L 140 88 A 16 16 0 0 1 124 72 L 124 64 A 16 16 0 0 0 108 48 L 24 48 A 24 24 0 0 1 24 0 Z"
                            fill="#FFFFFF"
                            stroke="rgba(231, 229, 228, 0.95)"
                            strokeWidth="1"
                        />
                    </svg>
                </div>

                {/* Top Row: Navigation Links */}
                <nav className="h-[48px] w-full flex items-center justify-around px-3 pointer-events-auto" aria-label="Main Navigation">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.Icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={isActive ? 'page' : undefined}
                                className={`relative px-4 py-2 text-xs font-medium rounded-full transition-all duration-150 flex items-center gap-2 select-none ${
                                    isActive ? 'text-white' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
                                }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNavDesktop"
                                        className="absolute inset-0 bg-[#FF6363] rounded-full shadow-xs"
                                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-2 font-medium">
                                    <Icon active={isActive} />
                                    <span>{item.label}</span>
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Row: Soundscape Droplet Controls */}
                <div className="h-[40px] w-[248px] flex items-center justify-center pointer-events-auto">
                    <SoundscapeDroplet variant="desktop" />
                </div>
            </header>

            {/* Mobile Navigation: Floating Bottom Pill with 44px+ touch targets */}
            <nav className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 md:hidden w-[92%] max-w-sm" aria-label="Mobile Navigation">
                <div className="flex items-center justify-around px-2 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-stone-200/80 shadow-[0_4px_20px_rgba(28,25,23,0.08)]">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.Icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={isActive ? 'page' : undefined}
                                className={`relative flex flex-col items-center justify-center min-w-[48px] min-h-[46px] px-2 py-1 rounded-full transition-all duration-150 ${
                                    isActive ? 'text-white' : 'text-stone-600 active:bg-stone-100/60'
                                }`}
                                aria-label={item.label}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNavMobile"
                                        className="absolute inset-0 bg-[#FF6363] rounded-full shadow-xs"
                                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10 flex flex-col items-center">
                                    <Icon active={isActive} />
                                    <span className={`text-[10px] mt-0.5 font-medium ${isActive ? 'text-white font-semibold' : 'text-stone-600'}`}>
                                        {item.label}
                                    </span>
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}
