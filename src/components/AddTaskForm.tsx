'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTaskStore } from '@/store/taskStore';

export function AddTaskForm() {
    const [title, setTitle] = useState('');
    const [estimated, setEstimated] = useState(2);
    const { addTask } = useTaskStore();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        addTask(title.trim(), estimated);
        setTitle('');
        setEstimated(2);
    };

    return (
        <form onSubmit={handleSubmit} className="card p-4 sm:p-5 mb-6 space-y-3.5">
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What are you focusing on today?"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200/80 bg-stone-50/50 focus:bg-white text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:border-[#FF6363] focus:ring-1 focus:ring-[#FF6363]/25 transition-all"
                    maxLength={100}
                />
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={!title.trim()}
                    className="px-5 py-2.5 rounded-xl bg-[#FF6363] hover:bg-[#E04848] disabled:opacity-50 text-white font-medium text-xs sm:text-sm shadow-xs transition-colors flex-shrink-0"
                >
                    Add Task
                </motion.button>
            </div>

            {/* Quick estimate selector */}
            <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
                <span>Estimated Sessions:</span>
                <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((count) => (
                        <button
                            key={count}
                            type="button"
                            onClick={() => setEstimated(count)}
                            className={`px-2.5 py-1 rounded-lg font-mono text-xs transition-all ${
                                estimated === count
                                    ? 'bg-stone-900 text-white shadow-xs'
                                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'
                            }`}
                        >
                            {count} {count === 1 ? 'session' : 'sessions'}
                        </button>
                    ))}
                </div>
            </div>
        </form>
    );
}
