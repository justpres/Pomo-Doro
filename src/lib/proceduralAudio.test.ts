import { describe, it, expect } from 'vitest';
import {
    PROCEDURAL_SOUNDS,
    getProceduralSound,
    isProceduralStation,
} from './proceduralAudio';

describe('proceduralAudio', () => {
    it('defines the 3 core neuro-acoustic soundscapes', () => {
        expect(PROCEDURAL_SOUNDS).toHaveLength(3);
        const ids = PROCEDURAL_SOUNDS.map((s) => s.id);
        expect(ids).toContain('brown-noise');
        expect(ids).toContain('pink-noise');
        expect(ids).toContain('gamma-40hz');
    });

    it('detects procedural station ids correctly', () => {
        expect(isProceduralStation('brown-noise')).toBe(true);
        expect(isProceduralStation('pink-noise')).toBe(true);
        expect(isProceduralStation('gamma-40hz')).toBe(true);
        expect(isProceduralStation('lofi-radio')).toBe(false);
        expect(isProceduralStation('chillhop')).toBe(false);
    });

    it('returns the sound metadata by id', () => {
        const brown = getProceduralSound('brown-noise');
        expect(brown?.name).toBe('Brown Noise');
        expect(brown?.subtitle).toBe('Deep Focus');
        expect(brown?.scienceBasis).toContain('Stochastic resonance');

        const gamma = getProceduralSound('gamma-40hz');
        expect(gamma?.name).toBe('40Hz Gamma');
        expect(gamma?.subtitle).toBe('Cortical Drive');
    });
});
