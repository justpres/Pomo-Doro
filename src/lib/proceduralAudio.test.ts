import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    PROCEDURAL_SOUNDS,
    getProceduralSound,
    isProceduralStation,
    proceduralAudio,
} from './proceduralAudio';

describe('proceduralAudio metadata', () => {
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

describe('proceduralAudio engine', () => {
    let mockContext: any;
    let mockGain: any;
    let mockBufferSource: any;
    let mockOscillator: any;
    let mockFilter: any;
    let mockMerger: any;

    beforeEach(() => {
        vi.useFakeTimers();

        mockGain = {
            gain: {
                value: 1,
                setValueAtTime: vi.fn(),
                linearRampToValueAtTime: vi.fn(),
            },
            connect: vi.fn(),
            disconnect: vi.fn(),
        };

        mockBufferSource = {
            buffer: null,
            loop: false,
            connect: vi.fn(),
            disconnect: vi.fn(),
            start: vi.fn(),
            stop: vi.fn(),
        };

        mockOscillator = {
            type: 'sine',
            frequency: {
                setValueAtTime: vi.fn(),
            },
            connect: vi.fn(),
            disconnect: vi.fn(),
            start: vi.fn(),
            stop: vi.fn(),
        };

        mockFilter = {
            type: 'lowpass',
            frequency: {
                setValueAtTime: vi.fn(),
            },
            connect: vi.fn(),
            disconnect: vi.fn(),
        };

        mockMerger = {
            connect: vi.fn(),
            disconnect: vi.fn(),
        };

        const channelData = new Float32Array(48000 * 6);
        const mockAudioBuffer = {
            duration: 6,
            sampleRate: 48000,
            numberOfChannels: 2,
            getChannelData: vi.fn(() => channelData),
        };

        mockContext = {
            state: 'running',
            sampleRate: 48000,
            currentTime: 10,
            destination: {},
            createGain: vi.fn(() => ({ ...mockGain })),
            createBufferSource: vi.fn(() => ({ ...mockBufferSource })),
            createOscillator: vi.fn(() => ({ ...mockOscillator })),
            createBiquadFilter: vi.fn(() => ({ ...mockFilter })),
            createChannelMerger: vi.fn(() => ({ ...mockMerger })),
            createBuffer: vi.fn(() => mockAudioBuffer),
            resume: vi.fn().mockResolvedValue(undefined),
        };

        (window as any).AudioContext = vi.fn(() => mockContext);
    });

    afterEach(() => {
        proceduralAudio.stop(true);
        vi.useRealTimers();
    });

    it('plays brown noise without self-destructing after 70ms', async () => {
        await proceduralAudio.play('brown-noise', 0.6);
        expect(proceduralAudio.getCurrentSoundId()).toBe('brown-noise');

        // Advance timers past old buggy 70ms window
        vi.advanceTimersByTime(200);

        // Sound must still be active!
        expect(proceduralAudio.getCurrentSoundId()).toBe('brown-noise');
    });

    it('plays pink noise without self-destructing', async () => {
        await proceduralAudio.play('pink-noise', 0.5);
        expect(proceduralAudio.getCurrentSoundId()).toBe('pink-noise');

        vi.advanceTimersByTime(200);
        expect(proceduralAudio.getCurrentSoundId()).toBe('pink-noise');
    });

    it('plays 40Hz gamma entrainment without self-destructing', async () => {
        await proceduralAudio.play('gamma-40hz', 0.5);
        expect(proceduralAudio.getCurrentSoundId()).toBe('gamma-40hz');

        vi.advanceTimersByTime(200);
        expect(proceduralAudio.getCurrentSoundId()).toBe('gamma-40hz');
    });

    it('smoothly stops playback and clears currentSoundId', async () => {
        await proceduralAudio.play('brown-noise', 0.5);
        expect(proceduralAudio.getCurrentSoundId()).toBe('brown-noise');

        proceduralAudio.stop();
        expect(proceduralAudio.getCurrentSoundId()).toBeNull();
    });

    it('switches between procedural sounds cleanly', async () => {
        await proceduralAudio.play('brown-noise', 0.5);
        expect(proceduralAudio.getCurrentSoundId()).toBe('brown-noise');

        await proceduralAudio.play('pink-noise', 0.5);
        expect(proceduralAudio.getCurrentSoundId()).toBe('pink-noise');

        await proceduralAudio.play('gamma-40hz', 0.5);
        expect(proceduralAudio.getCurrentSoundId()).toBe('gamma-40hz');
    });
});
