'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Portal } from './Portal';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }: ConfirmDialogProps) {


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
                        onClick={onCancel}
                        className="fixed inset-0 z-[110]"
                        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 8 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed inset-0 z-[110] flex items-center justify-center p-4 transform-gpu"
                    >
                        <div
                            className="w-full max-w-sm rounded-2xl p-6 shadow-xl"
                            style={{ backgroundColor: 'white' }}
                        >
                            {/* Icon */}
                            {/* Icon - Tomato pink warning */}
                            <div
                                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                                style={{ backgroundColor: 'rgba(255, 107, 107, 0.15)' }}
                            >
                                <svg
                                    width="28"
                                    height="28"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#FF6B6B"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                            </div>

                            {/* Title */}
                            <h3
                                className="text-lg font-semibold text-center mb-2"
                                style={{ color: 'var(--text-dark)' }}
                            >
                                {title}
                            </h3>

                            {/* Message */}
                            <p
                                className="text-sm text-center mb-6"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                {message}
                            </p>

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={onCancel}
                                    className="flex-1 py-2.5 rounded-xl font-medium"
                                    style={{
                                        backgroundColor: 'var(--primary-lighter)',
                                        color: 'var(--text-dark)',
                                    }}
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={onConfirm}
                                    className="flex-1 py-2.5 rounded-xl font-medium"
                                    style={{
                                        backgroundColor: '#FF6B6B',
                                        color: 'white',
                                    }}
                                >
                                    Continue
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    </Portal>
    );
}
