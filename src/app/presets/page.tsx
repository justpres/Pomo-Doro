'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePresetStore, Preset } from '@/store/presetStore';
import { PresetCard } from '@/components/PresetCard';
import { PresetModal } from '@/components/PresetModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useMounted } from '@/hooks/useMounted';

export default function PresetsPage() {
    const { presets, addPreset, updatePreset, deletePreset } = usePresetStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPreset, setEditingPreset] = useState<Preset | null>(null);
    const mounted = useMounted();
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [selectionMode, setSelectionMode] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const customPresets = presets.filter((p) => !p.isDefault);

    const handleAddPreset = (presetData: Omit<Preset, 'id'>) => {
        if (editingPreset) {
            updatePreset(editingPreset.id, presetData);
        } else {
            addPreset(presetData);
        }
        setEditingPreset(null);
    };

    const handleEdit = (preset: Preset) => {
        if (selectionMode) return;
        setEditingPreset(preset);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        deletePreset(id);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPreset(null);
    };

    const toggleSelection = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const selectAll = () => {
        setSelectedIds(new Set(customPresets.map((p) => p.id)));
    };

    const deselectAll = () => {
        setSelectedIds(new Set());
    };

    const deleteSelected = () => {
        selectedIds.forEach((id) => deletePreset(id));
        setSelectedIds(new Set());
        setSelectionMode(false);
        setShowDeleteConfirm(false);
    };

    const exitSelectionMode = () => {
        setSelectionMode(false);
        setSelectedIds(new Set());
    };

    if (!mounted) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="min-h-screen p-4 sm:p-6 pb-28 md:pb-16"
            style={{ backgroundColor: 'var(--background)' }}
        >
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between pt-2">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
                            Focus Cadences
                        </h1>
                        <p className="text-xs sm:text-sm text-stone-500 mt-1">
                            Choose scientifically-backed work rhythms or configure custom intervals.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {!selectionMode ? (
                            <>
                                {customPresets.length > 0 && (
                                    <button
                                        onClick={() => setSelectionMode(true)}
                                        className="px-3 py-2 rounded-xl text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                                    >
                                        Select
                                    </button>
                                )}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setIsModalOpen(true)}
                                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-[#FF6363] hover:bg-[#E04848] text-white shadow-xs transition-colors flex items-center gap-1.5"
                                >
                                    <span>+</span>
                                    <span>New Cadence</span>
                                </motion.button>
                            </>
                        ) : (
                            <button
                                onClick={exitSelectionMode}
                                className="px-3.5 py-2 rounded-xl text-xs font-medium bg-stone-200 hover:bg-stone-300 text-stone-700 transition-colors"
                            >
                                Done
                            </button>
                        )}
                    </div>
                </div>

                {/* Selection toolbar */}
                <AnimatePresence>
                    {selectionMode && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-3 rounded-xl flex items-center justify-between bg-stone-100 border border-stone-200 text-xs"
                        >
                            <div className="flex items-center gap-3">
                                <span className="font-medium text-stone-800">
                                    {selectedIds.size} selected
                                </span>
                                <button
                                    onClick={selectedIds.size === customPresets.length ? deselectAll : selectAll}
                                    className="underline text-[#FF6363]"
                                >
                                    {selectedIds.size === customPresets.length ? 'Deselect All' : 'Select All'}
                                </button>
                            </div>
                            {selectedIds.size > 0 && (
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="px-3 py-1 rounded-lg font-medium bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                                >
                                    Delete ({selectedIds.size})
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Presets Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {presets.map((preset) => (
                        <div key={preset.id} className="relative">
                            {selectionMode && !preset.isDefault && (
                                <button
                                    className={`absolute top-3 left-3 z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                                        selectedIds.has(preset.id)
                                            ? 'bg-[#FF6363] text-white shadow-xs'
                                            : 'bg-white border-2 border-stone-300'
                                    }`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleSelection(preset.id);
                                    }}
                                    aria-label="Select preset"
                                >
                                    {selectedIds.has(preset.id) && (
                                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    )}
                                </button>
                            )}
                            <PresetCard
                                preset={preset}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal */}
            <PresetModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleAddPreset}
                preset={editingPreset}
            />

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                title="Delete Presets"
                message={`Are you sure you want to delete ${selectedIds.size} preset${selectedIds.size > 1 ? 's' : ''}? This cannot be undone.`}
                onConfirm={deleteSelected}
                onCancel={() => setShowDeleteConfirm(false)}
            />
        </motion.div>
    );
}
