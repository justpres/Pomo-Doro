'use client';

import { motion } from 'framer-motion';
import { useTimerStore } from '@/store/timerStore';
import { useNotification } from '@/hooks/useNotification';
import { useMounted } from '@/hooks/useMounted';
import { useState, useCallback, useRef } from 'react';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useMusicStore } from '@/store/musicStore';

const ALARM_SOUNDS = [
    { id: 'digital-alarm-clock-2.mp3', name: 'Digital Chime', tag: 'Modern' },
    { id: 'chiptune-alarm-clock-4.mp3', name: 'Chiptune Retro', tag: '8-Bit' },
    { id: 'clock-alarm-3.mp3', name: 'Classic Alarm', tag: 'Vintage' },
    { id: 'generic-alarm-clock-1.mp3', name: 'Subtle Beep', tag: 'Minimal' },
];

export default function SettingsPage() {
    const { settings, updateSettings, isRunning, pause } = useTimerStore();
    const { volume: musicVolume, setVolume: setMusicVolume } = useMusicStore();
    const { permission: notificationPermission, requestPermission, isSupported } = useNotification();
    const mounted = useMounted();
    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingUpdate, setPendingUpdate] = useState<Partial<typeof settings> | null>(null);
    const [previewingSound, setPreviewingSound] = useState<string | null>(null);
    const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

    const handleRequestNotification = async () => {
        await requestPermission();
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

    const handlePreviewSound = (soundFile: string) => {
        if (previewingSound === soundFile && audioPreviewRef.current) {
            audioPreviewRef.current.pause();
            audioPreviewRef.current = null;
            setPreviewingSound(null);
            return;
        }

        if (audioPreviewRef.current) {
            audioPreviewRef.current.pause();
        }

        const audio = new Audio(`/sounds/${soundFile}`);
        audio.volume = settings.soundVolume / 100;
        audioPreviewRef.current = audio;
        setPreviewingSound(soundFile);

        audio.onended = () => {
            setPreviewingSound(null);
            audioPreviewRef.current = null;
        };

        audio.play().catch(() => {
            setPreviewingSound(null);
        });
    };

    if (!mounted) {
        return null;
    }

    const focusMinutes = Math.floor(settings.focusDuration / 60);
    const shortBreakMinutes = Math.floor(settings.shortBreakDuration / 60);
    const longBreakMinutes = Math.floor(settings.longBreakDuration / 60);

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="min-h-screen p-4 sm:p-6 pb-28 md:pb-16"
            style={{ backgroundColor: 'var(--background)' }}
        >
            <div className="max-w-xl mx-auto space-y-6">
                {/* Header */}
                <div className="pt-2">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
                        Settings
                    </h1>
                    <p className="text-xs sm:text-sm text-stone-500 mt-1">
                        Customize your focus intervals, audio soundscapes, and automation.
                    </p>
                </div>

                {/* Section 1: Timer Durations */}
                <div className="card space-y-5">
                    <div className="border-b border-stone-200/60 pb-3">
                        <h2 className="text-base font-semibold text-stone-900 flex items-center gap-2">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-700">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12 6 12 12 16 14"/>
                            </svg>
                            <span>Focus & Break Cadence</span>
                        </h2>
                        <p className="text-xs text-stone-500 mt-0.5">
                            Set your ideal session length and rest intervals.
                        </p>
                    </div>

                    {/* Focus Duration */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs sm:text-sm font-medium text-stone-700">
                                Focus Duration
                            </label>
                            <span className="font-mono text-xs font-semibold text-[#FF6363] bg-[#FF6363]/10 px-2 py-0.5 rounded-md tabular-nums">
                                {focusMinutes} min
                            </span>
                        </div>

                        {/* Quick select pills */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            {[15, 25, 45, 50, 60, 90].map((mins) => (
                                <button
                                    key={mins}
                                    onClick={() => handleSettingsChange({ focusDuration: mins * 60 })}
                                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                        focusMinutes === mins
                                            ? 'bg-stone-900 text-white shadow-xs'
                                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'
                                    }`}
                                >
                                    {mins}m
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-3 pt-1">
                            <button
                                onClick={() => handleSettingsChange({ focusDuration: Math.max(5 * 60, settings.focusDuration - 60) })}
                                className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold flex items-center justify-center transition-colors"
                                aria-label="Decrease focus duration"
                            >
                                -
                            </button>
                            <input
                                type="range"
                                min={5 * 60}
                                max={90 * 60}
                                step={60}
                                value={settings.focusDuration}
                                onChange={(e) => handleSettingsChange({ focusDuration: parseInt(e.target.value) })}
                                className="flex-1"
                                aria-label="Focus duration slider"
                            />
                            <button
                                onClick={() => handleSettingsChange({ focusDuration: Math.min(90 * 60, settings.focusDuration + 60) })}
                                className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold flex items-center justify-center transition-colors"
                                aria-label="Increase focus duration"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Short Break */}
                    <div className="space-y-2 pt-2 border-t border-stone-100">
                        <div className="flex items-center justify-between">
                            <label className="text-xs sm:text-sm font-medium text-stone-700">
                                Short Break
                            </label>
                            <span className="font-mono text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md tabular-nums">
                                {shortBreakMinutes} min
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                            {[3, 5, 10, 15].map((mins) => (
                                <button
                                    key={mins}
                                    onClick={() => handleSettingsChange({ shortBreakDuration: mins * 60 })}
                                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                        shortBreakMinutes === mins
                                            ? 'bg-stone-900 text-white shadow-xs'
                                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'
                                    }`}
                                >
                                    {mins}m
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-3 pt-1">
                            <button
                                onClick={() => handleSettingsChange({ shortBreakDuration: Math.max(1 * 60, settings.shortBreakDuration - 60) })}
                                className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold flex items-center justify-center transition-colors"
                                aria-label="Decrease short break duration"
                            >
                                -
                            </button>
                            <input
                                type="range"
                                min={1 * 60}
                                max={20 * 60}
                                step={60}
                                value={settings.shortBreakDuration}
                                onChange={(e) => handleSettingsChange({ shortBreakDuration: parseInt(e.target.value) })}
                                className="flex-1"
                                aria-label="Short break slider"
                            />
                            <button
                                onClick={() => handleSettingsChange({ shortBreakDuration: Math.min(20 * 60, settings.shortBreakDuration + 60) })}
                                className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold flex items-center justify-center transition-colors"
                                aria-label="Increase short break duration"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Long Break */}
                    <div className="space-y-2 pt-2 border-t border-stone-100">
                        <div className="flex items-center justify-between">
                            <label className="text-xs sm:text-sm font-medium text-stone-700">
                                Long Break
                            </label>
                            <span className="font-mono text-xs font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md tabular-nums">
                                {longBreakMinutes} min
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                            {[15, 20, 25, 30, 45].map((mins) => (
                                <button
                                    key={mins}
                                    onClick={() => handleSettingsChange({ longBreakDuration: mins * 60 })}
                                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                        longBreakMinutes === mins
                                            ? 'bg-stone-900 text-white shadow-xs'
                                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'
                                    }`}
                                >
                                    {mins}m
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-3 pt-1">
                            <button
                                onClick={() => handleSettingsChange({ longBreakDuration: Math.max(5 * 60, settings.longBreakDuration - 60) })}
                                className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold flex items-center justify-center transition-colors"
                                aria-label="Decrease long break duration"
                            >
                                -
                            </button>
                            <input
                                type="range"
                                min={5 * 60}
                                max={45 * 60}
                                step={60}
                                value={settings.longBreakDuration}
                                onChange={(e) => handleSettingsChange({ longBreakDuration: parseInt(e.target.value) })}
                                className="flex-1"
                                aria-label="Long break slider"
                            />
                            <button
                                onClick={() => handleSettingsChange({ longBreakDuration: Math.min(45 * 60, settings.longBreakDuration + 60) })}
                                className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold flex items-center justify-center transition-colors"
                                aria-label="Increase long break duration"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Cycle count */}
                    <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                        <div>
                            <label className="text-xs sm:text-sm font-medium text-stone-700 block">
                                Pomodoros before Long Break
                            </label>
                            <span className="text-[11px] text-stone-400">
                                Standard technique recommendation is 4 cycles
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            {[2, 3, 4, 5, 6].map((num) => (
                                <button
                                    key={num}
                                    onClick={() => handleSettingsChange({ pomodorosBeforeLongBreak: num })}
                                    className={`w-7 h-7 rounded-lg text-xs font-mono font-medium transition-all ${
                                        settings.pomodorosBeforeLongBreak === num
                                            ? 'bg-[#FF6363] text-white shadow-xs'
                                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                    }`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Section 2: Audio & Sound Alerts */}
                <div className="card space-y-4">
                    <div className="border-b border-stone-200/60 pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-stone-900 flex items-center gap-2">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-700">
                                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                                        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                                    </svg>
                                    <span>Audio & Alarm Chimes</span>
                                </h2>
                                <p className="text-xs text-stone-500 mt-0.5">
                                    Notification chime played when a focus or break interval concludes.
                                </p>
                            </div>
                            <button
                                onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                                    settings.soundEnabled ? 'bg-[#FF6363]' : 'bg-stone-200'
                                }`}
                                aria-label="Toggle sound alerts"
                            >
                                <motion.div
                                    className="w-5 h-5 bg-white rounded-full shadow-xs"
                                    animate={{ x: settings.soundEnabled ? 20 : 0 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                />
                            </button>
                        </div>
                    </div>

                    {settings.soundEnabled && (
                        <div className="space-y-4">
                            {/* Alarm selection grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {ALARM_SOUNDS.map((sound) => {
                                    const isSelected = settings.selectedSound === sound.id;
                                    const isPreviewing = previewingSound === sound.id;
                                    return (
                                        <div
                                            key={sound.id}
                                            onClick={() => updateSettings({ selectedSound: sound.id })}
                                            className={`p-3 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                                                isSelected
                                                    ? 'bg-[#FF6363]/5 border-[#FF6363] shadow-xs ring-1 ring-[#FF6363]/20'
                                                    : 'bg-stone-50/70 border-stone-200/70 hover:bg-stone-100/70'
                                            }`}
                                        >
                                            <div className="min-w-0">
                                                <div className="font-medium text-stone-900 truncate">
                                                    {sound.name}
                                                </div>
                                                <div className="text-[10px] text-stone-400 font-mono">
                                                    {sound.tag}
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handlePreviewSound(sound.id);
                                                }}
                                                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                                                    isPreviewing
                                                        ? 'bg-[#FF6363] text-white'
                                                        : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                                                }`}
                                                aria-label={`Preview ${sound.name}`}
                                            >
                                                {isPreviewing ? 'Playing...' : 'Test'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Alarm Volume */}
                            <div className="pt-2">
                                <div className="flex items-center justify-between text-xs text-stone-600 mb-1.5">
                                    <span>Alarm Volume</span>
                                    <span className="font-mono tabular-nums text-stone-800">{settings.soundVolume}%</span>
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    step={5}
                                    value={settings.soundVolume}
                                    onChange={(e) => updateSettings({ soundVolume: parseInt(e.target.value) })}
                                    className="w-full"
                                    aria-label="Alarm volume slider"
                                />
                            </div>

                            {/* Soundscape Music Volume */}
                            <div className="pt-3 border-t border-stone-100">
                                <div className="flex items-center justify-between text-xs text-stone-600 mb-1.5">
                                    <span>Ambient Soundscape Volume</span>
                                    <span className="font-mono tabular-nums text-stone-800">{musicVolume}%</span>
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    step={5}
                                    value={musicVolume}
                                    onChange={(e) => setMusicVolume(parseInt(e.target.value))}
                                    className="w-full accent-[#FF6363]"
                                    aria-label="Ambient soundscape volume slider"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Section 4: Automation & Behavior */}
                <div className="card space-y-4">
                    <div className="border-b border-stone-200/60 pb-3">
                        <h2 className="text-base font-semibold text-stone-900 flex items-center gap-2">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-700">
                                <line x1="4" y1="21" x2="4" y2="14"/>
                                <line x1="4" y1="10" x2="4" y2="3"/>
                                <line x1="12" y1="21" x2="12" y2="12"/>
                                <line x1="12" y1="8" x2="12" y2="3"/>
                                <line x1="20" y1="21" x2="20" y2="16"/>
                                <line x1="20" y1="12" x2="20" y2="3"/>
                                <line x1="1" y1="14" x2="7" y2="14"/>
                                <line x1="9" y1="8" x2="15" y2="8"/>
                                <line x1="17" y1="16" x2="23" y2="16"/>
                            </svg>
                            <span>Automation & Notifications</span>
                        </h2>
                        <p className="text-xs text-stone-500 mt-0.5">
                            Streamline your transitions between work and rest.
                        </p>
                    </div>

                    <div className="flex items-center justify-between py-1">
                        <div>
                            <span className="text-xs sm:text-sm font-medium text-stone-800 block">
                                Auto-start Breaks
                            </span>
                            <span className="text-[11px] text-stone-400">
                                Automatically start timer when focus session completes
                            </span>
                        </div>
                        <button
                            onClick={() => updateSettings({ autoStartBreaks: !settings.autoStartBreaks })}
                            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 flex-shrink-0 ${
                                settings.autoStartBreaks ? 'bg-[#FF6363]' : 'bg-stone-200'
                            }`}
                            aria-label="Toggle auto-start breaks"
                        >
                            <motion.div
                                className="w-5 h-5 bg-white rounded-full shadow-xs"
                                animate={{ x: settings.autoStartBreaks ? 20 : 0 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                        </button>
                    </div>

                    <div className="flex items-center justify-between py-1 border-t border-stone-100">
                        <div>
                            <span className="text-xs sm:text-sm font-medium text-stone-800 block">
                                Auto-start Pomodoros
                            </span>
                            <span className="text-[11px] text-stone-400">
                                Automatically resume work when break period concludes
                            </span>
                        </div>
                        <button
                            onClick={() => updateSettings({ autoStartPomodoros: !settings.autoStartPomodoros })}
                            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 flex-shrink-0 ${
                                settings.autoStartPomodoros ? 'bg-[#FF6363]' : 'bg-stone-200'
                            }`}
                            aria-label="Toggle auto-start pomodoros"
                        >
                            <motion.div
                                className="w-5 h-5 bg-white rounded-full shadow-xs"
                                animate={{ x: settings.autoStartPomodoros ? 20 : 0 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                        </button>
                    </div>

                    {isSupported && (
                        <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                            <div>
                                <span className="text-xs sm:text-sm font-medium text-stone-800 block">
                                    Browser Push Notifications
                                </span>
                                <span className="text-[11px] text-stone-400">
                                    {notificationPermission === 'granted'
                                        ? 'Active — notifications sent on completion'
                                        : notificationPermission === 'denied'
                                            ? 'Blocked in browser permissions'
                                            : 'Receive desktop alerts even when tab is backgrounded'}
                                </span>
                            </div>

                            {notificationPermission === 'default' && (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleRequestNotification}
                                    className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-[#FF6363] text-white shadow-xs hover:bg-[#E04848] transition-colors"
                                >
                                    Enable
                                </motion.button>
                            )}

                            {notificationPermission === 'granted' && (
                                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                                    Enabled
                                </span>
                            )}

                            {notificationPermission === 'denied' && (
                                <span className="text-xs font-medium text-stone-400 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200">
                                    Blocked
                                </span>
                            )}
                        </div>
                    )}
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
