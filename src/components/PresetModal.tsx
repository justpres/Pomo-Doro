'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Preset } from '@/store/presetStore';

interface PresetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (preset: Omit<Preset, 'id'>) => void;
    preset?: Preset | null; // If provided, we're editing
}

export function PresetModal({ isOpen, onClose, onSave, preset }: PresetModalProps) {
    const [name, setName] = useState('');
    const [focusMinutes, setFocusMinutes] = useState(25);
    const [shortBreakMinutes, setShortBreakMinutes] = useState(5);
    const [longBreakMinutes, setLongBreakMinutes] = useState(15);
    const [pomodorosBeforeLongBreak, setPomodorosBeforeLongBreak] = useState(4);

    useEffect(() => {
        if (preset) {
            setName(preset.name);
            setFocusMinutes(Math.floor(preset.focusDuration / 60));
            setShortBreakMinutes(Math.floor(preset.shortBreakDuration / 60));
            setLongBreakMinutes(Math.floor(preset.longBreakDuration / 60));
            setPomodorosBeforeLongBreak(preset.pomodorosBeforeLongBreak);
        } else {
            // Reset to defaults for new preset
            setName('');
            setFocusMinutes(25);
            setShortBreakMinutes(5);
            setLongBreakMinutes(15);
            setPomodorosBeforeLongBreak(4);
        }
    }, [preset, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        onSave({
            name: name.trim(),
            focusDuration: focusMinutes * 60,
            shortBreakDuration: shortBreakMinutes * 60,
            longBreakDuration: longBreakMinutes * 60,
            pomodorosBeforeLongBreak,
        });
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div
                            className="card w-full max-w-md"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2
                                className="text-2xl font-bold mb-6"
                                style={{ color: 'var(--text-dark)' }}
                            >
                                {preset ? 'Edit Preset' : 'Create Preset'}
                            </h2>

                            <form onSubmit={handleSubmit}>
                                {/* Name */}
                                <div className="mb-4">
                                    <label
                                        className="block text-sm font-medium mb-2"
                                        style={{ color: 'var(--text-light)' }}
                                    >
                                        Preset Name
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value.slice(0, 20))}
                                        placeholder="My Custom Preset"
                                        className="w-full px-4 py-2 rounded-lg border-2 outline-none transition-colors"
                                        style={{
                                            borderColor: 'var(--primary-lighter)',
                                            backgroundColor: 'white',
                                        }}
                                        maxLength={20}
                                        required
                                    />
                                </div>

                                {/* Focus Duration */}
                                <div className="mb-4">
                                    <label
                                        className="block text-sm font-medium mb-2"
                                        style={{ color: 'var(--text-light)' }}
                                    >
                                        Focus Duration: {focusMinutes} minutes
                                    </label>
                                    <input
                                        type="range"
                                        min={5}
                                        max={120}
                                        step={5}
                                        value={focusMinutes}
                                        onChange={(e) => setFocusMinutes(parseInt(e.target.value))}
                                        className="w-full"
                                        style={{ accentColor: 'var(--primary)' }}
                                    />
                                </div>

                                {/* Short Break */}
                                <div className="mb-4">
                                    <label
                                        className="block text-sm font-medium mb-2"
                                        style={{ color: 'var(--text-light)' }}
                                    >
                                        Short Break: {shortBreakMinutes} minutes
                                    </label>
                                    <input
                                        type="range"
                                        min={1}
                                        max={30}
                                        step={1}
                                        value={shortBreakMinutes}
                                        onChange={(e) => setShortBreakMinutes(parseInt(e.target.value))}
                                        className="w-full"
                                        style={{ accentColor: 'var(--success)' }}
                                    />
                                </div>

                                {/* Long Break */}
                                <div className="mb-4">
                                    <label
                                        className="block text-sm font-medium mb-2"
                                        style={{ color: 'var(--text-light)' }}
                                    >
                                        Long Break: {longBreakMinutes} minutes
                                    </label>
                                    <input
                                        type="range"
                                        min={5}
                                        max={60}
                                        step={5}
                                        value={longBreakMinutes}
                                        onChange={(e) => setLongBreakMinutes(parseInt(e.target.value))}
                                        className="w-full"
                                        style={{ accentColor: 'var(--success)' }}
                                    />
                                </div>

                                {/* Pomodoros before long break */}
                                <div className="mb-6">
                                    <label
                                        className="block text-sm font-medium mb-2"
                                        style={{ color: 'var(--text-light)' }}
                                    >
                                        Pomodoros before long break: {pomodorosBeforeLongBreak}
                                    </label>
                                    <input
                                        type="range"
                                        min={2}
                                        max={8}
                                        step={1}
                                        value={pomodorosBeforeLongBreak}
                                        onChange={(e) => setPomodorosBeforeLongBreak(parseInt(e.target.value))}
                                        className="w-full"
                                        style={{ accentColor: 'var(--primary)' }}
                                    />
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="btn btn-secondary flex-1"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary flex-1"
                                    >
                                        {preset ? 'Save Changes' : 'Create Preset'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
