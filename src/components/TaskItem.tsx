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
    const progress = task.estimatedPomodoros > 0
        ? Math.min(task.actualPomodoros / task.estimatedPomodoros, 1)
        : 0;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="card mb-3 relative overflow-hidden"
            style={{
                borderLeft: isActive ? '4px solid var(--primary)' : '4px solid transparent',
                opacity: isCompleted ? 0.6 : 1,
            }}
        >
            {/* Progress bar background */}
            <div
                className="absolute inset-0 transition-all duration-300"
                style={{
                    width: `${progress * 100}%`,
                    backgroundColor: isCompleted ? 'rgba(81, 207, 102, 0.1)' : 'rgba(255, 107, 107, 0.1)',
                }}
            />

            <div className="relative flex items-center gap-4">
                {/* Checkbox */}
                <button
                    onClick={() => isCompleted ? null : completeTask(task.id)}
                    className="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors"
                    style={{
                        borderColor: isCompleted ? 'var(--success)' : 'var(--primary-lighter)',
                        backgroundColor: isCompleted ? 'var(--success)' : 'transparent',
                    }}
                >
                    {isCompleted && (
                        <span className="text-white text-sm">✓</span>
                    )}
                </button>

                {/* Task info */}
                <div className="flex-1">
                    <p
                        className="font-medium"
                        style={{
                            color: 'var(--text-dark)',
                            textDecoration: isCompleted ? 'line-through' : 'none',
                        }}
                    >
                        {task.title}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {task.actualPomodoros} / {task.estimatedPomodoros} 🍅
                        {task.status === 'in-progress' && !isCompleted && (
                            <span className="ml-2" style={{ color: 'var(--primary)' }}>
                                • In Progress
                            </span>
                        )}
                    </p>
                </div>

                {/* Actions */}
                {!isCompleted && (
                    <div className="flex gap-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveTask(isActive ? null : task.id)}
                            className="text-sm px-3 py-1 rounded-lg"
                            style={{
                                backgroundColor: isActive ? 'var(--primary)' : 'var(--primary-lighter)',
                                color: isActive ? 'white' : 'var(--text-dark)',
                            }}
                        >
                            {isActive ? 'Linked' : 'Link'}
                        </motion.button>
                    </div>
                )}

                {/* Delete button */}
                <button
                    onClick={() => deleteTask(task.id)}
                    className="text-sm px-2 py-1 rounded opacity-50 hover:opacity-100 transition-opacity"
                    style={{ color: 'var(--text-muted)' }}
                >
                    ×
                </button>
            </div>
        </motion.div>
    );
}
