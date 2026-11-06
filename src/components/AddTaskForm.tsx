'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTaskStore } from '@/store/taskStore';

export function AddTaskForm() {
    const [title, setTitle] = useState('');
    const [estimated, setEstimated] = useState(1);
    const { addTask } = useTaskStore();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        addTask(title.trim(), estimated);
        setTitle('');
        setEstimated(1);
    };

    return (
        <form onSubmit={handleSubmit} className="card mb-6">
            <div className="flex gap-3 items-end">
                {/* Title input */}
                <div className="flex-1">
                    <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: 'var(--text-light)' }}
                    >
                        New Task
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="What are you working on?"
                        className="w-full px-4 py-2 rounded-lg border-2 outline-none transition-colors"
                        style={{
                            borderColor: 'var(--primary-lighter)',
                            backgroundColor: 'white',
                        }}
                        maxLength={100}
                    />
                </div>

                {/* Estimated pomodoros */}
                <div className="w-24">
                    <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: 'var(--text-light)' }}
                    >
                        Est. 🍅
                    </label>
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={estimated}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === '') {
                                setEstimated(0); // Temporary state for empty input
                                return;
                            }
                            const num = parseInt(val);
                            if (!isNaN(num)) {
                                // Clamp between 1 and 20
                                setEstimated(Math.min(Math.max(1, num), 20));
                            }
                        }}
                        onBlur={() => {
                            // Ensure valid value on blur
                            if (!estimated || estimated < 1) setEstimated(1);
                        }}
                        className="w-full px-3 py-2 rounded-lg border-2 outline-none text-center"
                        style={{
                            borderColor: 'var(--primary-lighter)',
                            backgroundColor: 'white',
                        }}
                    />
                </div>

                {/* Submit button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="btn btn-primary"
                >
                    Add
                </motion.button>
            </div>
        </form>
    );
}
