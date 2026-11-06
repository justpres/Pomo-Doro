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

    const focusMins = Math.floor(preset.focusDuration / 60);
    const breakMins = Math.floor(preset.shortBreakDuration / 60);
    const totalCycle = preset.focusDuration + preset.shortBreakDuration;
    const focusRatio = totalCycle > 0 ? (preset.focusDuration / totalCycle) * 100 : 80;
    const breakRatio = 100 - focusRatio;

    return (
        <>
            <motion.div
                whileHover={{ y: -3, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleApply}
                className={`card p-4 sm:p-5 cursor-pointer relative overflow-hidden transition-all bg-white border ${
                    isActive
                        ? 'border-[#FF6363] shadow-xs ring-1 ring-[#FF6363]/20 bg-gradient-to-b from-[#FF6363]/5 to-white'
                        : 'border-stone-200/80 hover:border-stone-300 shadow-xs'
                }`}
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                        <h3 className="font-semibold text-base text-stone-900">
                            {preset.name}
                        </h3>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                            Long break every {preset.pomodorosBeforeLongBreak} sessions ({formatDuration(preset.longBreakDuration)})
                        </p>
                    </div>

                    {isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#FF6363] text-white shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            Active
                        </span>
                    ) : (
                        <span className="text-[11px] font-medium text-stone-400 group-hover:text-stone-600">
                            Use Cadence →
                        </span>
                    )}
                </div>

                {/* Proportional Cadence Ratio Bar */}
                <div className="space-y-1.5 my-3.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-[#FF6363] font-medium">{focusMins}m Focus</span>
                        <span className="text-emerald-700 font-medium">{breakMins}m Rest</span>
                    </div>

                    <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden flex" title={`${Math.round(focusRatio)}% Focus / ${Math.round(breakRatio)}% Rest`}>
                        <div
                            style={{ width: `${focusRatio}%` }}
                            className="h-full bg-[#FF6363] transition-all rounded-l-full"
                        />
                        <div
                            style={{ width: `${breakRatio}%` }}
                            className="h-full bg-emerald-500 transition-all rounded-r-full"
                        />
                    </div>
                </div>

                {/* Action buttons for custom presets */}
                {!preset.isDefault && (
                    <div className="flex items-center gap-2 pt-2 border-t border-stone-100 mt-3">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit?.(preset);
                            }}
                            className="text-xs px-2.5 py-1 rounded-lg text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/80 transition-colors"
                        >
                            Edit
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete?.(preset.id);
                            }}
                            className="text-xs px-2.5 py-1 rounded-lg text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors ml-auto"
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
