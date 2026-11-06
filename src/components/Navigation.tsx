'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

// Custom SVG icons in tomato pink style
const TimerIcon = ({ active }: { active: boolean }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#FFFFFF' : '#FF6B6B'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const TasksIcon = ({ active }: { active: boolean }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#FFFFFF' : '#FF6B6B'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
);

const PresetsIcon = ({ active }: { active: boolean }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#FFFFFF' : '#FF6B6B'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
);

const StatsIcon = ({ active }: { active: boolean }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#FFFFFF' : '#FF6B6B'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
);

const SettingsIcon = ({ active }: { active: boolean }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#FFFFFF' : '#FF6B6B'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
);

// Plus icon for main button
const PlusIcon = ({ isOpen }: { isOpen: boolean }) => (
    <motion.svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </motion.svg>
);

const navItems = [
    { href: '/settings', label: 'Settings', Icon: SettingsIcon },
    { href: '/stats', label: 'Stats', Icon: StatsIcon },
    { href: '/presets', label: 'Presets', Icon: PresetsIcon },
    { href: '/tasks', label: 'Tasks', Icon: TasksIcon },
    { href: '/', label: 'Timer', Icon: TimerIcon },
];

export function Navigation() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const handleNavClick = () => {
        setIsOpen(false);
    };

    return (
        <>
            {/* Desktop Navigation - top bar */}
            <nav
                className="hidden md:flex fixed top-0 left-0 right-0 z-50 items-center justify-center gap-6 py-4"
                style={{ backgroundColor: 'rgba(255, 245, 245, 0.9)', backdropFilter: 'blur(10px)' }}
            >
                {[...navItems].reverse().map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href}>
                            <motion.span
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative px-4 py-2 text-sm font-medium transition-colors"
                                style={{
                                    color: isActive ? 'var(--primary)' : 'var(--text-light)',
                                }}
                            >
                                {item.label}
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-indicator"
                                        className="absolute bottom-0 left-0 right-0 h-0.5"
                                        style={{ backgroundColor: 'var(--primary)' }}
                                    />
                                )}
                            </motion.span>
                        </Link>
                    );
                })}
            </nav>

            {/* Mobile Navigation - Teardrop Design */}
            <div className="md:hidden">
                {/* Backdrop Overlay */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-40"
                            style={{
                                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                backdropFilter: 'blur(4px)',
                            }}
                        />
                    )}
                </AnimatePresence>

                {/* Teardrop Navigation Items */}
                <AnimatePresence>
                    {isOpen && (
                        <div className="fixed z-45" style={{ bottom: '92px', left: '20px' }}>
                            {navItems.map((item, index) => {
                                const isActive = pathname === item.href;
                                const Icon = item.Icon;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={handleNavClick}
                                        style={{
                                            WebkitTapHighlightColor: 'transparent',
                                            outline: 'none'
                                        }}
                                    >
                                        <motion.div
                                            initial={{ opacity: 0, y: 20, scale: 0.8 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 20, scale: 0.8 }}
                                            transition={{
                                                delay: index * 0.05,
                                                duration: 0.2,
                                                type: 'spring',
                                                stiffness: 300,
                                                damping: 20
                                            }}
                                            whileHover={{ scale: 1.1, x: 5 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="flex items-center gap-3 mb-3"
                                        >
                                            {/* Teardrop bubble */}
                                            <div
                                                className="flex items-center justify-center relative"
                                                style={{
                                                    width: '56px',
                                                    height: '56px',
                                                    borderRadius: '50% 50% 50% 0%',
                                                    transform: 'rotate(-45deg)',
                                                    backgroundColor: isActive ? '#FF6B6B' : '#FFF',
                                                    boxShadow: isActive
                                                        ? '0 6px 20px rgba(255, 107, 107, 0.5)'
                                                        : '0 4px 12px rgba(0, 0, 0, 0.15)',
                                                    border: isActive ? 'none' : '2px solid #FF6B6B',
                                                }}
                                            >
                                                <div style={{ transform: 'rotate(45deg)' }}>
                                                    <Icon active={isActive} />
                                                </div>
                                            </div>

                                            {/* Label */}
                                            <motion.span
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 + 0.1 }}
                                                className="text-sm font-medium px-3 py-1.5 rounded-full whitespace-nowrap"
                                                style={{
                                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                    color: isActive ? '#FF6B6B' : '#6B6B6B',
                                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                                }}
                                            >
                                                {item.label}
                                            </motion.span>
                                        </motion.div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </AnimatePresence>

                {/* Main Floating Button - Circular */}
                <motion.button
                    onClick={() => setIsOpen(!isOpen)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="fixed z-50 flex items-center justify-center"
                    style={{
                        bottom: '20px',
                        left: '20px',
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        backgroundColor: '#FF6B6B',
                        boxShadow: '0 6px 20px rgba(255, 107, 107, 0.5)',
                    }}
                    aria-label="Toggle menu"
                >
                    <PlusIcon isOpen={isOpen} />
                </motion.button>
            </div>
        </>
    );
}
