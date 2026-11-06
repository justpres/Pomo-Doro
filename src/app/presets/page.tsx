'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePresetStore, Preset } from '@/store/presetStore';
import { PresetCard } from '@/components/PresetCard';
import { PresetModal } from '@/components/PresetModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';

export default function PresetsPage() {
    const { presets, addPreset, updatePreset, deletePreset } = usePresetStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPreset, setEditingPreset] = useState<Preset | null>(null);
    const [mounted, setMounted] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [selectionMode, setSelectionMode] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Only custom presets can be selected/deleted
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen p-4 md:p-6 pb-24 md:pb-6"
            style={{ backgroundColor: 'var(--background)' }}
        >
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 md:mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--text-dark)' }}>
                        Timer Presets
                    </h1>
                    <div className="flex gap-2">
                        {!selectionMode ? (
                            <>
                                {customPresets.length > 0 && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSelectionMode(true)}
                                        className="px-3 py-2 rounded-xl text-sm font-medium"
                                        style={{ backgroundColor: 'var(--primary-lighter)', color: 'var(--text-dark)' }}
                                    >
                                        Select
                                    </motion.button>
                                )}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setIsModalOpen(true)}
                                    className="btn btn-primary text-sm md:text-base"
                                >
                                    Create
                                </motion.button>
                            </>
                        ) : (
                            <>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={exitSelectionMode}
                                    className="px-3 py-2 rounded-xl text-sm font-medium"
                                    style={{ backgroundColor: '#E5E7EB', color: 'var(--text-dark)' }}
                                >
                                    Cancel
                                </motion.button>
                            </>
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
                            className="mb-4 p-3 rounded-xl flex items-center justify-between"
                            style={{ backgroundColor: 'rgba(255, 107, 107, 0.1)' }}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium" style={{ color: 'var(--text-dark)' }}>
                                    {selectedIds.size} selected
                                </span>
                                <button
                                    onClick={selectedIds.size === customPresets.length ? deselectAll : selectAll}
                                    className="text-sm font-medium underline"
                                    style={{ color: 'var(--primary)' }}
                                >
                                    {selectedIds.size === customPresets.length ? 'Deselect All' : 'Select All'}
                                </button>
                            </div>
                            {selectedIds.size > 0 && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="px-3 py-1.5 rounded-lg text-sm font-medium"
                                    style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}
                                >
                                    Delete ({selectedIds.size})
                                </motion.button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Description */}
                {!selectionMode && (
                    <p className="mb-4 md:mb-6 text-xs md:text-sm" style={{ color: 'var(--text-light)' }}>
                        Click on a preset to apply it. Create custom presets for different work styles.
                    </p>
                )}

                {/* Presets Grid */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                        visible: { transition: { staggerChildren: 0.05 } },
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4"
                >
                    {presets.map((preset) => (
                        <motion.div
                            key={preset.id}
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0 },
                            }}
                            className="relative"
                        >
                            {/* Selection checkbox for custom presets */}
                            {selectionMode && !preset.isDefault && (
                                <motion.button
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute top-3 left-3 z-10 w-6 h-6 rounded-full flex items-center justify-center"
                                    style={{
                                        backgroundColor: selectedIds.has(preset.id) ? '#FF6B6B' : 'white',
                                        border: selectedIds.has(preset.id) ? 'none' : '2px solid #D1D5DB',
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleSelection(preset.id);
                                    }}
                                >
                                    {selectedIds.has(preset.id) && (
                                        <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2">
                                            <path d="M2 7l4 4 6-8" />
                                        </svg>
                                    )}
                                </motion.button>
                            )}
                            <PresetCard
                                preset={preset}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        </motion.div>
                    ))}
                </motion.div>
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
