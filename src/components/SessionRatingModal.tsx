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
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white rounded-2xl p-6 max-w-sm w-full border border-stone-200/80 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-semibold text-center mb-1 text-stone-900">
                            How was your focus?
                        </h3>
                        <p className="text-xs text-center mb-5 text-stone-500">
                            Rate this session to track your productivity
                        </p>

                        {/* Star Rating */}
                        <div className="flex justify-center gap-2 mb-6">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <motion.button
                                    key={star}
                                    whileHover={{ scale: 1.15 }}
                                    whileTap={{ scale: 0.9 }}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    onClick={() => setSelectedRating(star)}
                                    className="p-1 transition-colors"
                                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                                    style={{
                                        color: star <= (hoveredRating || selectedRating) ? '#F59E0B' : '#E7E5E4',
                                    }}
                                >
                                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                    </svg>
                                </motion.button>
                            ))}
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-2 rounded-xl text-sm font-medium bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
                            >
                                Skip
                            </button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSubmit}
                                className="flex-1 py-2 rounded-xl text-sm font-medium text-white transition-colors"
                                style={{ backgroundColor: selectedRating > 0 ? '#FF6363' : '#D6D3D1' }}
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
