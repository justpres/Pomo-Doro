'use client';

import { motion } from 'framer-motion';
import { useTimerStore } from '@/store/timerStore';
import { useNotification } from '@/hooks/useNotification';
import { useState, useEffect, useCallback } from 'react';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { MusicPlayerWidget } from '@/components/MusicPlayer';

export default function SettingsPage() {
    const { settings, updateSettings, isRunning, pause } = useTimerStore();
    const { requestPermission, isSupported } = useNotification();
    const [mounted, setMounted] = useState(false);
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingUpdate, setPendingUpdate] = useState<Partial<typeof settings> | null>(null);


    useEffect(() => {
        setMounted(true);
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setNotificationPermission(Notification.permission);
        }
    }, []);

    const handleRequestNotification = async () => {
        const granted = await requestPermission();
        setNotificationPermission(granted ? 'granted' : 'denied');
    };

    // Wrap settings update to show confirm if timer is running and changing durations
    const handleSettingsChange = useCallback((update: Partial<typeof settings>) => {
        const isDurationChange =
            'focusDuration' in update ||
            'shortBreakDuration' in update ||
            'longBreakDuration' in update ||
            'pomodorosBeforeLongBreak' in update;

        if (isRunning && isDurationChange) {
            setPendingUpdate(update);
            setShowConfirm(true);
        } else {
            updateSettings(update);
        }
    }, [isRunning, updateSettings]);

    const handleConfirm = () => {
        if (pendingUpdate) {
            pause();
            updateSettings(pendingUpdate);
            setPendingUpdate(null);
        }
        setShowConfirm(false);
    };

    const handleCancel = () => {
        setPendingUpdate(null);
        setShowConfirm(false);
    };

    if (!mounted) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen p-6"
            style={{ backgroundColor: 'var(--background)' }}
        >
            <div className="max-w-lg mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold" style={{ color: 'var(--text-dark)' }}>
                        Settings
                    </h1>
                </div>

                {/* Timer Durations */}
                <div className="card mb-6">
                    <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-dark)' }}>
                        Timer Durations
                    </h2>

                    {/* Focus Duration */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-light)' }}>
                            Focus Duration: {Math.floor(settings.focusDuration / 60)} minutes
                        </label>
                        <input
                            type="range"
                            min={5 * 60}
                            max={90 * 60}
                            step={60}
                            value={settings.focusDuration}
                            onChange={(e) => handleSettingsChange({ focusDuration: parseInt(e.target.value) })}
                            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    {/* Short Break */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-light)' }}>
                            Short Break: {Math.floor(settings.shortBreakDuration / 60)} minutes
                        </label>
                        <input
                            type="range"
                            min={1 * 60}
                            max={20 * 60}
                            step={60}
                            value={settings.shortBreakDuration}
                            onChange={(e) => handleSettingsChange({ shortBreakDuration: parseInt(e.target.value) })}
                            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    {/* Long Break */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-light)' }}>
                            Long Break: {Math.floor(settings.longBreakDuration / 60)} minutes
                        </label>
                        <input
                            type="range"
                            min={5 * 60}
                            max={45 * 60}
                            step={60}
                            value={settings.longBreakDuration}
                            onChange={(e) => handleSettingsChange({ longBreakDuration: parseInt(e.target.value) })}
                            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    {/* Pomodoros before long break */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-light)' }}>
                            Pomodoros before long break: {settings.pomodorosBeforeLongBreak}
                        </label>
                        <input
                            type="range"
                            min={2}
                            max={8}
                            step={1}
                            value={settings.pomodorosBeforeLongBreak}
                            onChange={(e) => handleSettingsChange({ pomodorosBeforeLongBreak: parseInt(e.target.value) })}
                            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>

                {/* Auto-Start Options */}
                <div className="card mb-6">
                    <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-dark)' }}>
                        Auto-Start
                    </h2>

                    <div className="flex items-center justify-between mb-4">
                        <span style={{ color: 'var(--text-light)' }}>Auto-start breaks</span>
                        <button
                            onClick={() => updateSettings({ autoStartBreaks: !settings.autoStartBreaks })}
                            className="w-12 h-6 rounded-full transition-colors duration-200"
                            style={{ backgroundColor: settings.autoStartBreaks ? '#FF6B6B' : '#D1D5DB' }}
                        >
                            <motion.div
                                className="w-5 h-5 bg-white rounded-full shadow-md"
                                animate={{ x: settings.autoStartBreaks ? 26 : 2 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <span style={{ color: 'var(--text-light)' }}>Auto-start pomodoros</span>
                        <button
                            onClick={() => updateSettings({ autoStartPomodoros: !settings.autoStartPomodoros })}
                            className="w-12 h-6 rounded-full transition-colors duration-200"
                            style={{ backgroundColor: settings.autoStartPomodoros ? '#FF6B6B' : '#D1D5DB' }}
                        >
                            <motion.div
                                className="w-5 h-5 bg-white rounded-full shadow-md"
                                animate={{ x: settings.autoStartPomodoros ? 26 : 2 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                        </button>
                    </div>
                </div>

                {/* Sound Settings */}
                <div className="card mb-6">
                    <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-dark)' }}>
                        Sound
                    </h2>

                    <div className="flex items-center justify-between mb-4">
                        <span style={{ color: 'var(--text-light)' }}>Sound enabled</span>
                        <button
                            onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                            className="w-12 h-6 rounded-full transition-colors duration-200"
                            style={{ backgroundColor: settings.soundEnabled ? '#FF6B6B' : '#D1D5DB' }}
                        >
                            <motion.div
                                className="w-5 h-5 bg-white rounded-full shadow-md"
                                animate={{ x: settings.soundEnabled ? 26 : 2 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                        </button>
                    </div>

                    {settings.soundEnabled && (
                        <div>
                            {/* Volume Slider */}
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-light)' }}>
                                Volume: {settings.soundVolume}%
                            </label>
                            <input
                                type="range"
                                min={0}
                                max={100}
                                step={5}
                                value={settings.soundVolume}
                                onChange={(e) => updateSettings({ soundVolume: parseInt(e.target.value) })}
                                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    )}
                </div>

                {/* Browser Notifications */}
                {isSupported && (
                    <div className="card mb-6">
                        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-dark)' }}>
                            Notifications
                        </h2>

                        <div className="flex items-center justify-between">
                            <div>
                                <span style={{ color: 'var(--text-light)' }}>Notifications</span>
                                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                    {notificationPermission === 'granted'
                                        ? 'You will receive alerts when timer ends'
                                        : notificationPermission === 'denied'
                                            ? 'Blocked - enable in browser settings'
                                            : 'Get notified when timer completes'}
                                </p>
                            </div>

                            {/* Toggle for granted state */}
                            {notificationPermission === 'granted' && (
                                <button
                                    className="w-12 h-6 rounded-full transition-colors duration-200"
                                    style={{ backgroundColor: '#FF6B6B' }}
                                    disabled
                                >
                                    <motion.div
                                        className="w-5 h-5 bg-white rounded-full shadow-md"
                                        animate={{ x: 26 }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    />
                                </button>
                            )}

                            {/* Enable button for default state */}
                            {notificationPermission === 'default' && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleRequestNotification}
                                    className="px-4 py-2 rounded-xl text-sm font-medium"
                                    style={{ backgroundColor: '#FF6B6B', color: 'white' }}
                                >
                                    Enable
                                </motion.button>
                            )}

                            {/* Disabled toggle for denied state */}
                            {notificationPermission === 'denied' && (
                                <button
                                    className="w-12 h-6 rounded-full transition-colors duration-200 opacity-50"
                                    style={{ backgroundColor: '#D1D5DB' }}
                                    disabled
                                >
                                    <motion.div
                                        className="w-5 h-5 bg-white rounded-full shadow-md"
                                        animate={{ x: 2 }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Music Player */}
                <div className="card mb-6">
                    <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-dark)' }}>
                        Music Player
                    </h2>
                    <div className="py-2">
                        <MusicPlayerWidget />
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showConfirm}
                title="Timer is Running"
                message="Changing this setting will reset your current timer session. Do you want to continue?"
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </motion.div>
    );
}
