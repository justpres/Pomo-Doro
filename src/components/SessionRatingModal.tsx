'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface SessionRatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRate: (rating: number) => void;
}

export function SessionRatingModal({ isOpen, onClose, onRate }: SessionRatingModalProps) {
    const [selectedRating, setSelectedRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);

    const handleSubmit = () => {
        if (selectedRating > 0) {
            onRate(selectedRating);
        }
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-semibold text-center mb-2" style={{ color: 'var(--text-dark)' }}>
                            How was your focus? 🎯
                        </h3>
                        <p className="text-sm text-center mb-4" style={{ color: 'var(--text-muted)' }}>
                            Rate this session to track your productivity
                        </p>

                        {/* Star Rating */}
                        <div className="flex justify-center gap-2 mb-6">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <motion.button
                                    key={star}
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    onClick={() => setSelectedRating(star)}
                                    className="text-3xl transition-colors"
                                    style={{
                                        color: star <= (hoveredRating || selectedRating) ? '#FFD700' : '#E5E7EB',
                                    }}
                                >
                                    ★
                                </motion.button>
                            ))}
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-2 rounded-xl text-sm font-medium"
                                style={{ backgroundColor: '#F3F4F6', color: 'var(--text-muted)' }}
                            >
                                Skip
                            </button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSubmit}
                                className="flex-1 py-2 rounded-xl text-sm font-medium text-white"
                                style={{ backgroundColor: selectedRating > 0 ? '#FF6B6B' : '#D1D5DB' }}
                                disabled={selectedRating === 0}
                            >
                                Save
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
