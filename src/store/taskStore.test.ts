import { describe, it, expect, beforeEach } from 'vitest';
import { useTaskStore } from './taskStore';
import { toLocalDateKey } from '@/lib/date';

describe('taskStore', () => {
    beforeEach(() => {
        useTaskStore.setState({ tasks: [], activeTaskId: null });
    });

    it('adds task with local date key (B5 fix)', () => {
        const store = useTaskStore.getState();
        store.addTask('Test Task', 3);

        const tasks = useTaskStore.getState().tasks;
        expect(tasks.length).toBe(1);
        expect(tasks[0].title).toBe('Test Task');
        expect(tasks[0].estimatedPomodoros).toBe(3);
        expect(tasks[0].actualPomodoros).toBe(0);
        expect(tasks[0].status).toBe('pending');
        expect(tasks[0].date).toBe(toLocalDateKey());
    });

    it('updates active task and sets pending status to in-progress', () => {
        const store = useTaskStore.getState();
        store.addTask('Active Test', 2);
        const taskId = useTaskStore.getState().tasks[0].id;

        store.setActiveTask(taskId);
        expect(useTaskStore.getState().activeTaskId).toBe(taskId);
        expect(useTaskStore.getState().tasks[0].status).toBe('in-progress');

        store.setActiveTask(null);
        expect(useTaskStore.getState().activeTaskId).toBeNull();
    });

    it('increments task pomodoro count', () => {
        const store = useTaskStore.getState();
        store.addTask('Increment Test', 4);
        const taskId = useTaskStore.getState().tasks[0].id;

        store.incrementTaskPomodoro(taskId);
        expect(useTaskStore.getState().tasks[0].actualPomodoros).toBe(1);

        store.incrementTaskPomodoro(taskId);
        expect(useTaskStore.getState().tasks[0].actualPomodoros).toBe(2);
    });

    it('completes task and clears activeTaskId if active', () => {
        const store = useTaskStore.getState();
        store.addTask('Complete Test', 1);
        const taskId = useTaskStore.getState().tasks[0].id;
        store.setActiveTask(taskId);

        store.completeTask(taskId);
        const updated = useTaskStore.getState().tasks[0];
        expect(updated.status).toBe('completed');
        expect(updated.completedAt).toBeDefined();
        expect(useTaskStore.getState().activeTaskId).toBeNull();
    });

    it('retrieves today tasks using local date', () => {
        const store = useTaskStore.getState();
        store.addTask('Today Task', 2);
        const todayTasks = store.getTodayTasks();
        expect(todayTasks.length).toBe(1);
        expect(todayTasks[0].title).toBe('Today Task');
    });
});
