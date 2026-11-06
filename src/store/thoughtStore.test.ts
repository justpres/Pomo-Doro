import { describe, it, expect, beforeEach } from 'vitest';
import { useThoughtStore } from './thoughtStore';
import { useTaskStore } from './taskStore';

describe('thoughtStore', () => {
    beforeEach(() => {
        useThoughtStore.setState({ thoughts: [] });
        useTaskStore.setState({ tasks: [], activeTaskId: null });
    });

    it('parks a thought with timestamp and status parked', () => {
        const id = useThoughtStore.getState().parkThought('Check tax invoice email', 'focus');
        const thoughts = useThoughtStore.getState().thoughts;

        expect(thoughts).toHaveLength(1);
        expect(thoughts[0].id).toBe(id);
        expect(thoughts[0].text).toBe('Check tax invoice email');
        expect(thoughts[0].mode).toBe('focus');
        expect(thoughts[0].status).toBe('parked');
        expect(thoughts[0].createdAt).toBeDefined();
    });

    it('resolves a parked thought', () => {
        const id = useThoughtStore.getState().parkThought('Reply to Slack message', 'focus');
        useThoughtStore.getState().resolveThought(id);

        const thought = useThoughtStore.getState().thoughts.find((t) => t.id === id);
        expect(thought?.status).toBe('resolved');
    });

    it('deletes a parked thought', () => {
        const id = useThoughtStore.getState().parkThought('Random fleeting idea', 'focus');
        useThoughtStore.getState().deleteThought(id);

        expect(useThoughtStore.getState().thoughts).toHaveLength(0);
    });

    it('converts a parked thought into a task in taskStore', () => {
        const id = useThoughtStore.getState().parkThought('Draft API schema for authentication', 'focus');
        useThoughtStore.getState().convertToTask(id, 2);

        // Thought should now be marked converted
        const thought = useThoughtStore.getState().thoughts.find((t) => t.id === id);
        expect(thought?.status).toBe('converted');

        // TaskStore should contain the converted task
        const tasks = useTaskStore.getState().tasks;
        expect(tasks).toHaveLength(1);
        expect(tasks[0].title).toBe('Draft API schema for authentication');
        expect(tasks[0].estimatedPomodoros).toBe(2);
    });

    it('filters active parked thoughts count correctly', () => {
        useThoughtStore.getState().parkThought('Idea 1', 'focus');
        const id2 = useThoughtStore.getState().parkThought('Idea 2', 'focus');
        useThoughtStore.getState().resolveThought(id2);

        expect(useThoughtStore.getState().getParkedCount()).toBe(1);
    });
});
