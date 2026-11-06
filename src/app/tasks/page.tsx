'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useTaskStore } from '@/store/taskStore';
import { AddTaskForm } from '@/components/AddTaskForm';
import { TaskItem } from '@/components/TaskItem';

export default function TasksPage() {
    const { tasks, getTodayTasks, activeTaskId } = useTaskStore();
    const [mounted, setMounted] = useState(false);
    const [todayTasks, setTodayTasks] = useState<ReturnType<typeof getTodayTasks>>([]);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            setTodayTasks(getTodayTasks());
        }
    }, [mounted, tasks, getTodayTasks]);

    if (!mounted) return null;

    const pendingTasks = todayTasks.filter((t) => t.status !== 'completed');
    const completedTasks = todayTasks.filter((t) => t.status === 'completed');
    const totalEstimated = todayTasks.reduce((acc, t) => acc + t.estimatedPomodoros, 0);
    const totalActual = todayTasks.reduce((acc, t) => acc + t.actualPomodoros, 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen p-6"
            style={{ backgroundColor: 'var(--background)' }}
        >
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-dark)' }}>
                            Today&apos;s Tasks
                        </h1>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
                    {activeTaskId && (
                        <Link href="/">
                            <motion.span
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="btn btn-primary"
                            >
                                Go to Timer
                            </motion.span>
                        </Link>
                    )}
                </div>

                {/* Summary */}
                <div className="card mb-6">
                    <div className="flex justify-around text-center">
                        <div>
                            <p className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>
                                {pendingTasks.length}
                            </p>
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                Tasks Left
                            </p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold" style={{ color: 'var(--success)' }}>
                                {completedTasks.length}
                            </p>
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                Completed
                            </p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold" style={{ color: 'var(--text-dark)' }}>
                                {totalActual} / {totalEstimated}
                            </p>
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                Pomodoros
                            </p>
                        </div>
                    </div>
                </div>

                {/* Add Task Form */}
                <AddTaskForm />

                {/* Pending Tasks */}
                <AnimatePresence>
                    {pendingTasks.length > 0 && (
                        <div className="mb-6">
                            <h2 className="text-sm font-medium mb-3" style={{ color: 'var(--text-light)' }}>
                                TO DO ({pendingTasks.length})
                            </h2>
                            {pendingTasks.map((task) => (
                                <TaskItem key={task.id} task={task} />
                            ))}
                        </div>
                    )}
                </AnimatePresence>

                {/* Completed Tasks */}
                <AnimatePresence>
                    {completedTasks.length > 0 && (
                        <div>
                            <h2 className="text-sm font-medium mb-3" style={{ color: 'var(--text-light)' }}>
                                COMPLETED ({completedTasks.length})
                            </h2>
                            {completedTasks.map((task) => (
                                <TaskItem key={task.id} task={task} />
                            ))}
                        </div>
                    )}
                </AnimatePresence>

                {/* Empty state */}
                {todayTasks.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-6xl mb-4">📝</p>
                        <p style={{ color: 'var(--text-muted)' }}>
                            No tasks for today. Add one above!
                        </p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
