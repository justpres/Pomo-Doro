'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Preset } from '@/store/presetStore';
import { Portal } from './Portal';

interface PresetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (preset: Omit<Preset, 'id'>) => void;
    preset?: Preset | null;
}

interface PresetModalFormProps {
    onClose: () => void;
    onSave: (preset: Omit<Preset, 'id'>) => void;
    preset?: Preset | null;
}

function PresetModalForm({ onClose, onSave, preset }: PresetModalFormProps) {
    const [name, setName] = useState(preset ? preset.name : '');
    const [focusMinutes, setFocusMinutes] = useState(preset ? Math.floor(preset.focusDuration / 60) : 25);
    const [shortBreakMinutes, setShortBreakMinutes] = useState(preset ? Math.floor(preset.shortBreakDuration / 60) : 5);
    const [longBreakMinutes, setLongBreakMinutes] = useState(preset ? Math.floor(preset.longBreakDuration / 60) : 15);
    const [pomodorosBeforeLongBreak, setPomodorosBeforeLongBreak] = useState(preset ? preset.pomodorosBeforeLongBreak : 4);

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
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Deep Work, Quick Task"
                    className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#FF6363]"
                    style={{
                        backgroundColor: 'var(--background)',
                        color: 'var(--text-dark)',
                    }}
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
                    min={1}
                    max={90}
                    step={1}
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
                    style={{ accentColor: 'var(--primary-light)' }}
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
    );
}

export function PresetModal({ isOpen, onClose, onSave, preset }: PresetModalProps) {
    return (
        <Portal>
            <AnimatePresence>
                {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100]"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
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

                            <PresetModalForm
                                key={preset ? preset.id : 'new'}
                                onClose={onClose}
                                onSave={onSave}
                                preset={preset}
                            />
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    </Portal>
    );
}
