'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useTaskStore } from '@/store/taskStore';
import { AddTaskForm } from '@/components/AddTaskForm';
import { TaskItem } from '@/components/TaskItem';
import { useMounted } from '@/hooks/useMounted';
import { toLocalDateKey } from '@/lib/date';

type TaskFilter = 'all' | 'pending' | 'completed';

export default function TasksPage() {
    const { tasks, activeTaskId } = useTaskStore();
    const mounted = useMounted();
    const [filter, setFilter] = useState<TaskFilter>('all');

    const todayTasks = useMemo(() => {
        if (!mounted) return [];
        const todayKey = toLocalDateKey();
        return tasks.filter((t) => t.date === todayKey);
    }, [mounted, tasks]);

    if (!mounted) return null;

    const pendingTasks = todayTasks.filter((t) => t.status !== 'completed');
    const completedTasks = todayTasks.filter((t) => t.status === 'completed');
    const totalEstimated = todayTasks.reduce((acc, t) => acc + t.estimatedPomodoros, 0);
    const totalActual = todayTasks.reduce((acc, t) => acc + t.actualPomodoros, 0);

    const filteredTasks = filter === 'pending'
        ? pendingTasks
        : filter === 'completed'
            ? completedTasks
            : todayTasks;

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="min-h-screen p-4 sm:p-6 pb-28 md:pb-16"
            style={{ backgroundColor: 'var(--background)' }}
        >
            <div className="max-w-xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between pt-2">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
                            Today&apos;s Focus
                        </h1>
                        <p className="text-xs sm:text-sm text-stone-500 mt-1">
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'short',
                                day: 'numeric',
                            })}
                        </p>
                    </div>

                    {activeTaskId && (
                        <Link href="/">
                            <motion.span
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium bg-[#FF6363] text-white shadow-xs hover:bg-[#E04848] transition-colors"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                Active Timer
                            </motion.span>
                        </Link>
                    )}
                </div>

                {/* Metrics Summary Grid */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="card p-3 sm:p-4 text-center">
                        <p className="font-mono text-xl sm:text-2xl font-bold text-stone-900 tabular-nums">
                            {pendingTasks.length}
                        </p>
                        <p className="text-[11px] font-medium text-stone-500 uppercase tracking-wider mt-0.5">
                            Remaining
                        </p>
                    </div>

                    <div className="card p-3 sm:p-4 text-center">
                        <p className="font-mono text-xl sm:text-2xl font-bold text-emerald-600 tabular-nums">
                            {completedTasks.length}
                        </p>
                        <p className="text-[11px] font-medium text-stone-500 uppercase tracking-wider mt-0.5">
                            Completed
                        </p>
                    </div>

                    <div className="card p-3 sm:p-4 text-center">
                        <p className="font-mono text-xl sm:text-2xl font-bold text-[#FF6363] tabular-nums">
                            {totalActual} <span className="text-sm font-normal text-stone-400">/ {totalEstimated}</span>
                        </p>
                        <p className="text-[11px] font-medium text-stone-500 uppercase tracking-wider mt-0.5">
                            Sessions
                        </p>
                    </div>
                </div>

                {/* Add Task Form */}
                <AddTaskForm />

                {/* Filter Tabs */}
                {todayTasks.length > 0 && (
                    <div className="flex items-center justify-between border-b border-stone-200/70 pb-2">
                        <div className="flex items-center gap-1">
                            {(['all', 'pending', 'completed'] as TaskFilter[]).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setFilter(tab)}
                                    className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                                        filter === tab
                                            ? 'bg-stone-900 text-white shadow-xs'
                                            : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                                    }`}
                                >
                                    {tab === 'all' ? `All (${todayTasks.length})` : tab === 'pending' ? `To Do (${pendingTasks.length})` : `Done (${completedTasks.length})`}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Task List */}
                <div className="space-y-1">
                    <AnimatePresence mode="popLayout">
                        {filteredTasks.map((task) => (
                            <TaskItem key={task.id} task={task} />
                        ))}
                    </AnimatePresence>

                    {todayTasks.length === 0 && (
                        <div className="card py-12 px-6 text-center border-dashed border-stone-200">
                            <svg className="w-8 h-8 text-stone-300 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="m9 12 2 2 4-4"/>
                            </svg>
                            <h3 className="text-sm font-semibold text-stone-800">Clear queue for today</h3>
                            <p className="text-xs text-stone-400 mt-1 max-w-xs mx-auto">
                                Add your high-leverage tasks above with estimated sessions to begin focused work.
                            </p>
                        </div>
                    )}

                    {todayTasks.length > 0 && filteredTasks.length === 0 && (
                        <div className="py-8 text-center text-xs text-stone-400">
                            No tasks matching this filter.
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
