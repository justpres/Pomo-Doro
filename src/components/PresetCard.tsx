'use client';

import { motion } from 'framer-motion';
import { Preset, usePresetStore } from '@/store/presetStore';
import { useTimerStore } from '@/store/timerStore';
import { useState } from 'react';
import { ConfirmDialog } from './ConfirmDialog';

interface PresetCardProps {
    preset: Preset;
    onEdit?: (preset: Preset) => void;
    onDelete?: (id: string) => void;
}

export function PresetCard({ preset, onEdit, onDelete }: PresetCardProps) {
    const { activePresetId, setActivePreset } = usePresetStore();
    const { updateSettings, setMode, isRunning, pause } = useTimerStore();
    const isActive = activePresetId === preset.id;
    const [showConfirm, setShowConfirm] = useState(false);

    const applyPreset = () => {
        if (isRunning) {
            pause();
        }
        setActivePreset(preset.id);
        updateSettings({
            focusDuration: preset.focusDuration,
            shortBreakDuration: preset.shortBreakDuration,
            longBreakDuration: preset.longBreakDuration,
            pomodorosBeforeLongBreak: preset.pomodorosBeforeLongBreak,
        });
        setMode('focus');
        setShowConfirm(false);
    };

    const handleApply = () => {
        if (isRunning) {
            setShowConfirm(true);
        } else {
            applyPreset();
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        return `${mins}m`;
    };

    return (
        <>
            <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="card cursor-pointer relative overflow-hidden"
                style={{
                    borderLeft: isActive ? '4px solid var(--primary)' : '4px solid transparent',
                    backgroundColor: isActive ? 'rgba(255, 107, 107, 0.05)' : 'var(--background-card)',
                }}
                onClick={handleApply}
            >
                {/* Active indicator */}
                {isActive && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute top-2 right-2 text-xs font-medium px-2 py-1 rounded-full"
                        style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                    >
                        Active
                    </motion.div>
                )}

                {/* Preset name */}
                <h3
                    className="text-lg font-semibold mb-3"
                    style={{ color: 'var(--text-dark)' }}
                >
                    {preset.name}
                </h3>

                {/* Durations */}
                <div className="flex gap-4 text-sm" style={{ color: 'var(--text-light)' }}>
                    <div>
                        <span className="font-medium" style={{ color: 'var(--primary)' }}>
                            {formatDuration(preset.focusDuration)}
                        </span>
                        <span className="ml-1">focus</span>
                    </div>
                    <div>
                        <span className="font-medium" style={{ color: 'var(--success)' }}>
                            {formatDuration(preset.shortBreakDuration)}
                        </span>
                        <span className="ml-1">break</span>
                    </div>
                </div>

                {/* Long break info */}
                <div className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                    Long break ({formatDuration(preset.longBreakDuration)}) every{' '}
                    {preset.pomodorosBeforeLongBreak} pomodoros
                </div>

                {/* Edit/Delete buttons for custom presets */}
                {!preset.isDefault && (
                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit?.(preset);
                            }}
                            className="text-xs px-3 py-1 rounded-lg"
                            style={{ backgroundColor: 'var(--primary-lighter)', color: 'var(--text-dark)' }}
                        >
                            Edit
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete?.(preset.id);
                            }}
                            className="text-xs px-3 py-1 rounded-lg"
                            style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}
                        >
                            Delete
                        </button>
                    </div>
                )}
            </motion.div>

            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showConfirm}
                title="Timer is Running"
                message="Changing presets will reset your current timer session. Do you want to continue?"
                onConfirm={applyPreset}
                onCancel={() => setShowConfirm(false)}
            />
        </>
    );
}
