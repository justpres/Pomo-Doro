'use client';

import { motion } from 'framer-motion';
import { Task, useTaskStore } from '@/store/taskStore';

interface TaskItemProps {
    task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
    const { activeTaskId, setActiveTask, completeTask, deleteTask } = useTaskStore();
    const isActive = activeTaskId === task.id;
    const isCompleted = task.status === 'completed';

    // Build visual tokens array
    const totalTokens = Math.max(task.estimatedPomodoros, task.actualPomodoros, 1);
    const tokens = Array.from({ length: totalTokens }, (_, i) => {
        const isDone = i < task.actualPomodoros;
        const isExtra = i >= task.estimatedPomodoros && isDone;
        return { index: i, isDone, isExtra };
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`p-4 rounded-2xl border transition-all relative overflow-hidden bg-white mb-2.5 ${
                isActive
                    ? 'border-[#FF6363] shadow-xs ring-1 ring-[#FF6363]/25'
                    : isCompleted
                        ? 'border-stone-200/50 bg-stone-50/50 opacity-60'
                        : 'border-stone-200/80 hover:border-stone-300 shadow-xs'
            }`}
        >
            <div className="flex items-center gap-3.5">
                {/* Custom Checkbox */}
                <button
                    onClick={() => isCompleted ? null : completeTask(task.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                        isCompleted
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-stone-300 hover:border-[#FF6363]'
                    }`}
                    aria-label={isCompleted ? 'Task completed' : 'Mark task as complete'}
                >
                    {isCompleted && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    )}
                </button>

                {/* Task Body */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className={`font-medium text-sm text-stone-900 truncate ${isCompleted ? 'line-through text-stone-400' : ''}`}>
                            {task.title}
                        </p>
                        {isActive && (
                            <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FF6363]/10 text-[#FF6363] border border-[#FF6363]/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#FF6363] animate-pulse" />
                                FOCUSING
                            </span>
                        )}
                    </div>

                    {/* Visual Pomodoro Tokens */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <div className="flex items-center gap-1.5">
                            {tokens.map(({ index, isDone, isExtra }) => (
                                <span
                                    key={index}
                                    title={isDone ? (isExtra ? 'Extra session' : 'Completed session') : 'Estimated session'}
                                    className={`inline-block rounded-full transition-transform ${
                                        isDone
                                            ? isExtra
                                                ? 'w-2.5 h-2.5 bg-amber-500 ring-2 ring-amber-200'
                                                : 'w-2.5 h-2.5 bg-[#FF6363]'
                                            : 'w-2.5 h-2.5 border-2 border-stone-300 bg-stone-100'
                                    }`}
                                />
                            ))}
                        </div>

                        <span className="text-[11px] font-mono text-stone-400 tabular-nums">
                            {task.actualPomodoros} of {task.estimatedPomodoros} sessions
                        </span>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    {!isCompleted && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveTask(isActive ? null : task.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                                isActive
                                    ? 'bg-[#FF6363] text-white shadow-xs'
                                    : 'bg-stone-100 hover:bg-stone-200/80 text-stone-700'
                            }`}
                        >
                            {isActive ? 'Linked' : 'Set Active'}
                        </motion.button>
                    )}

                    <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                        aria-label="Delete task"
                        title="Delete task"
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
