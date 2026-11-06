import { describe, it, expect } from 'vitest';
import {
    BREATH_PROTOCOLS,
    getProtocol,
    calculateCycleDuration,
    calculateTotalProtocolDuration,
    type ProtocolId,
} from './breathProtocols';

describe('breathProtocols', () => {
    it('provides all 4 core research-backed protocols', () => {
        expect(BREATH_PROTOCOLS).toHaveLength(4);
        const ids = BREATH_PROTOCOLS.map((p) => p.id);
        expect(ids).toContain('cyclic-sigh');
        expect(ids).toContain('box-breathing');
        expect(ids).toContain('relax-478');
        expect(ids).toContain('ocular-reset');
    });

    it('returns the cyclic-sigh protocol by default or valid id', () => {
        const protocol = getProtocol('cyclic-sigh');
        expect(protocol.name).toBe('Cyclic Sigh');
        expect(protocol.steps).toHaveLength(3);
        expect(protocol.targetCycles).toBe(3);
    });

    it('falls back to cyclic-sigh when given unknown id', () => {
        const protocol = getProtocol('unknown-id' as ProtocolId);
        expect(protocol.id).toBe('cyclic-sigh');
    });

    it('calculates cycle and total durations correctly for cyclic sigh', () => {
        const protocol = getProtocol('cyclic-sigh');
        const cycleDuration = calculateCycleDuration(protocol);
        // 3.5s + 1.0s + 6.0s = 10.5s
        expect(cycleDuration).toBeCloseTo(10.5);

        const totalDuration = calculateTotalProtocolDuration(protocol);
        // 10.5 * 3 cycles = 31.5s
        expect(totalDuration).toBeCloseTo(31.5);
    });

    it('calculates cycle and total durations correctly for box breathing', () => {
        const protocol = getProtocol('box-breathing');
        const cycleDuration = calculateCycleDuration(protocol);
        // 4 + 4 + 4 + 4 = 16s
        expect(cycleDuration).toBe(16);

        const totalDuration = calculateTotalProtocolDuration(protocol);
        // 16 * 3 cycles = 48s
        expect(totalDuration).toBe(48);
    });

    it('calculates cycle duration correctly for 20-20-20 ocular reset', () => {
        const protocol = getProtocol('ocular-reset');
        expect(calculateCycleDuration(protocol)).toBe(20);
        expect(calculateTotalProtocolDuration(protocol)).toBe(20);
    });
});
