import { describe, it, expect } from 'vitest';
import {
    computeHourlyProfile,
    detectChronotype,
    findBiologicalPrimeTime,
} from './circadian';
import { Session } from '@/store/sessionStore';

describe('circadian analytics', () => {
    it('initializes 24 hours in hourly profile', () => {
        const profile = computeHourlyProfile([]);
        expect(profile).toHaveLength(24);
        expect(profile[0].hour).toBe(0);
        expect(profile[23].hour).toBe(23);
        expect(profile.every((h) => h.sessionCount === 0)).toBe(true);
    });

    it('aggregates sessions and quality accurately per hour', () => {
        const mockSessions: Session[] = [
            {
                id: '1',
                type: 'focus',
                duration: 1500,
                completedAt: '2026-11-06T09:15:00.000Z',
                focusQuality: 5,
            },
            {
                id: '2',
                type: 'focus',
                duration: 1500,
                completedAt: '2026-11-06T09:45:00.000Z',
                focusQuality: 4,
            },
            {
                id: '3',
                type: 'focus',
                duration: 1500,
                completedAt: '2026-11-06T14:30:00.000Z',
                focusQuality: 2,
            },
        ];

        const profile = computeHourlyProfile(mockSessions);
        const hour9 = profile.find((h) => h.hour === new Date('2026-11-06T09:15:00.000Z').getHours());
        expect(hour9).toBeDefined();
        expect(hour9?.sessionCount).toBe(2);
        expect(hour9?.averageQuality).toBe(4.5);
    });

    it('identifies Morning Lark chronotype when peak focus is morning', () => {
        // Create morning sessions (8am - 10am)
        const date = new Date();
        date.setHours(9, 0, 0, 0);

        const morningSessions: Session[] = [
            { id: '1', type: 'focus', duration: 1500, completedAt: date.toISOString(), focusQuality: 5 },
            { id: '2', type: 'focus', duration: 1500, completedAt: date.toISOString(), focusQuality: 5 },
            { id: '3', type: 'focus', duration: 1500, completedAt: date.toISOString(), focusQuality: 4 },
        ];

        const chronotype = detectChronotype(morningSessions);
        expect(chronotype.type).toBe('lark');
        expect(chronotype.label).toContain('Morning Lark');
    });

    it('identifies Night Owl chronotype when peak focus is late evening', () => {
        const date = new Date();
        date.setHours(21, 0, 0, 0);

        const eveningSessions: Session[] = [
            { id: '1', type: 'focus', duration: 1500, completedAt: date.toISOString(), focusQuality: 5 },
            { id: '2', type: 'focus', duration: 1500, completedAt: date.toISOString(), focusQuality: 5 },
            { id: '3', type: 'focus', duration: 1500, completedAt: date.toISOString(), focusQuality: 5 },
        ];

        const chronotype = detectChronotype(eveningSessions);
        expect(chronotype.type).toBe('owl');
        expect(chronotype.label).toContain('Night Owl');
    });

    it('finds Biological Prime Time (BPT) window based on session density and rating', () => {
        const date = new Date();
        date.setHours(10, 0, 0, 0);

        const sessions: Session[] = [
            { id: '1', type: 'focus', duration: 1500, completedAt: date.toISOString(), focusQuality: 5 },
            { id: '2', type: 'focus', duration: 1500, completedAt: date.toISOString(), focusQuality: 5 },
        ];

        const bpt = findBiologicalPrimeTime(sessions);
        expect(bpt).toBeDefined();
        expect(bpt?.startHour).toBe(10);
        expect(bpt?.averageQuality).toBe(5);
    });
});
