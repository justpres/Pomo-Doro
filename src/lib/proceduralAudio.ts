export type ProceduralSoundId = 'brown-noise' | 'pink-noise' | 'gamma-40hz';

export interface ProceduralSoundInfo {
    id: ProceduralSoundId;
    name: string;
    subtitle: string;
    description: string;
    scienceBasis: string;
}

export const PROCEDURAL_SOUNDS: ProceduralSoundInfo[] = [
    {
        id: 'brown-noise',
        name: 'Brown Noise',
        subtitle: 'Deep Focus',
        description: 'Velvety, deep low-frequency acoustic wash modeled after Brownian motion.',
        scienceBasis:
            'Stochastic resonance: dampens acoustic transients (speech, doors, notifications) without triggering linguistic processing.',
    },
    {
        id: 'pink-noise',
        name: 'Pink Noise',
        subtitle: 'Steady State',
        description: 'Balanced 1/f spectral noise reminiscent of steady rainfall or ocean spray.',
        scienceBasis:
            'Equal energy per octave: stabilizes sustained attention and reduces subjective cognitive fatigue.',
    },
    {
        id: 'gamma-40hz',
        name: '40Hz Gamma',
        subtitle: 'Cortical Drive',
        description: '40Hz binaural entrainment (200Hz left / 240Hz right) with subtle acoustic floor.',
        scienceBasis:
            'Cortical gamma entrainment: synchronizes working memory circuits for intense problem-solving.',
    },
];

export function isProceduralStation(id: string): id is ProceduralSoundId {
    return PROCEDURAL_SOUNDS.some((s) => s.id === id);
}

export function getProceduralSound(id: string): ProceduralSoundInfo | undefined {
    return PROCEDURAL_SOUNDS.find((s) => s.id === id);
}

class ProceduralAudioEngine {
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private activeSourceNodes: (AudioNode & { stop?: (when?: number) => void })[] = [];
    private currentSoundId: ProceduralSoundId | null = null;
    private stopTimeout: ReturnType<typeof setTimeout> | null = null;
    private cachedBrownBuffer: AudioBuffer | null = null;
    private cachedPinkBuffer: AudioBuffer | null = null;
    private cachedSampleRate = 0;

    public getContext(): AudioContext | null {
        if (typeof window === 'undefined') return null;
        if (!this.ctx) {
            const AudioCtx =
                window.AudioContext ||
                (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        return this.ctx;
    }

    public async resume(): Promise<void> {
        if (typeof window === 'undefined') return;
        const ctx = this.getContext();
        if (ctx && ctx.state === 'suspended') {
            try {
                await ctx.resume();
            } catch {
                // Browser autoplay policy may require direct user gesture
            }
        }
    }

    private createBrownNoiseBuffer(ctx: AudioContext, durationSec = 6): AudioBuffer {
        const sampleRate = ctx.sampleRate;
        const bufferSize = Math.floor(sampleRate * durationSec);
        const buffer = ctx.createBuffer(2, bufferSize, sampleRate);

        for (let channel = 0; channel < 2; channel++) {
            const output = buffer.getChannelData(channel);
            let lastOut = 0.0;
            // Warm-up filter to avoid initial DC transient
            for (let i = 0; i < 4000; i++) {
                const white = Math.random() * 2 - 1;
                lastOut = (lastOut + 0.02 * white) / 1.02;
            }

            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                lastOut = (lastOut + 0.02 * white) / 1.02;
                output[i] = lastOut * 3.5; // Gain compensation
            }

            // Seamless crossfade across the loop boundary (last 0.5s into first 0.5s)
            const fadeLength = Math.min(Math.floor(sampleRate * 0.5), Math.floor(bufferSize / 4));
            for (let i = 0; i < fadeLength; i++) {
                const alpha = i / fadeLength;
                const startSample = output[i];
                const endSample = output[bufferSize - fadeLength + i];
                output[i] = startSample * alpha + endSample * (1 - alpha);
            }
        }
        return buffer;
    }

    private createPinkNoiseBuffer(ctx: AudioContext, durationSec = 6): AudioBuffer {
        const sampleRate = ctx.sampleRate;
        const bufferSize = Math.floor(sampleRate * durationSec);
        const buffer = ctx.createBuffer(2, bufferSize, sampleRate);

        for (let channel = 0; channel < 2; channel++) {
            const output = buffer.getChannelData(channel);
            let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
            // Warm-up filter to stabilize coefficients
            for (let i = 0; i < 4000; i++) {
                const white = Math.random() * 2 - 1;
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.96900 * b2 + white * 0.1538520;
                b3 = 0.86650 * b3 + white * 0.3104856;
                b4 = 0.55000 * b4 + white * 0.5329522;
                b5 = -0.7616 * b5 - white * 0.0168980;
                b6 = white * 0.115926;
            }

            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.96900 * b2 + white * 0.1538520;
                b3 = 0.86650 * b3 + white * 0.3104856;
                b4 = 0.55000 * b4 + white * 0.5329522;
                b5 = -0.7616 * b5 - white * 0.0168980;
                const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
                b6 = white * 0.115926;
                output[i] = pink * 0.11;
            }

            // Seamless crossfade across the loop boundary
            const fadeLength = Math.min(Math.floor(sampleRate * 0.5), Math.floor(bufferSize / 4));
            for (let i = 0; i < fadeLength; i++) {
                const alpha = i / fadeLength;
                const startSample = output[i];
                const endSample = output[bufferSize - fadeLength + i];
                output[i] = startSample * alpha + endSample * (1 - alpha);
            }
        }
        return buffer;
    }

    private getBrownNoiseBuffer(ctx: AudioContext): AudioBuffer {
        if (!this.cachedBrownBuffer || this.cachedSampleRate !== ctx.sampleRate) {
            this.cachedBrownBuffer = this.createBrownNoiseBuffer(ctx, 6);
            this.cachedSampleRate = ctx.sampleRate;
        }
        return this.cachedBrownBuffer;
    }

    private getPinkNoiseBuffer(ctx: AudioContext): AudioBuffer {
        if (!this.cachedPinkBuffer || this.cachedSampleRate !== ctx.sampleRate) {
            this.cachedPinkBuffer = this.createPinkNoiseBuffer(ctx, 6);
            this.cachedSampleRate = ctx.sampleRate;
        }
        return this.cachedPinkBuffer;
    }

    public async play(soundId: ProceduralSoundId, volume = 0.5) {
        const ctx = this.getContext();
        if (!ctx) return;

        // Ensure context is running if possible
        if (ctx.state === 'suspended') {
            try {
                await ctx.resume();
            } catch {
                // Autoplay may need user gesture
            }
        }

        // If this exact sound is already actively playing, smoothly update volume without restarting
        if (this.currentSoundId === soundId && this.activeSourceNodes.length > 0 && this.masterGain) {
            this.setVolume(volume);
            return;
        }

        // Stop any old nodes immediately before initializing the new soundscape
        this.stop(true);
        this.currentSoundId = soundId;

        const targetVol = Math.max(0.0001, volume);
        const master = ctx.createGain();
        const now = ctx.currentTime;
        master.gain.setValueAtTime(0.0001, now);
        master.gain.linearRampToValueAtTime(targetVol, now + 0.08);
        master.connect(ctx.destination);
        this.masterGain = master;

        if (soundId === 'brown-noise') {
            const buffer = this.getBrownNoiseBuffer(ctx);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.loop = true;

            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(450, now);

            source.connect(filter);
            filter.connect(master);
            source.start();
            this.activeSourceNodes.push(source);
        } else if (soundId === 'pink-noise') {
            const buffer = this.getPinkNoiseBuffer(ctx);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.loop = true;

            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1400, now);

            source.connect(filter);
            filter.connect(master);
            source.start();
            this.activeSourceNodes.push(source);
        } else if (soundId === 'gamma-40hz') {
            // Stereo Merger for pure binaural 40Hz beat
            const merger = ctx.createChannelMerger(2);

            // Left ear: 200 Hz
            const oscL = ctx.createOscillator();
            oscL.type = 'sine';
            oscL.frequency.setValueAtTime(200, now);
            oscL.connect(merger, 0, 0);

            // Right ear: 240 Hz (240 - 200 = 40Hz binaural pulse)
            const oscR = ctx.createOscillator();
            oscR.type = 'sine';
            oscR.frequency.setValueAtTime(240, now);
            oscR.connect(merger, 0, 1);

            const toneGain = ctx.createGain();
            toneGain.gain.setValueAtTime(0.18, now);
            merger.connect(toneGain);
            toneGain.connect(master);

            // Subtle gentle pink noise bed underneath to prevent auditory fatigue
            const pinkBuffer = this.getPinkNoiseBuffer(ctx);
            const pinkSource = ctx.createBufferSource();
            pinkSource.buffer = pinkBuffer;
            pinkSource.loop = true;

            const pinkFilter = ctx.createBiquadFilter();
            pinkFilter.type = 'lowpass';
            pinkFilter.frequency.setValueAtTime(500, now);

            const pinkGain = ctx.createGain();
            pinkGain.gain.setValueAtTime(0.08, now);

            pinkSource.connect(pinkFilter);
            pinkFilter.connect(pinkGain);
            pinkGain.connect(master);

            oscL.start();
            oscR.start();
            pinkSource.start();

            this.activeSourceNodes.push(oscL, oscR, pinkSource);
        }
    }

    public setVolume(volume: number) {
        if (!this.masterGain || !this.ctx) return;
        const targetVol = Math.max(0.0001, volume);
        try {
            const now = this.ctx.currentTime;
            this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
            this.masterGain.gain.linearRampToValueAtTime(targetVol, now + 0.05);
        } catch {
            this.masterGain.gain.value = targetVol;
        }
    }

    public stop(immediate = false) {
        if (this.stopTimeout) {
            clearTimeout(this.stopTimeout);
            this.stopTimeout = null;
        }

        const nodesToStop = this.activeSourceNodes;
        const gainToFade = this.masterGain;
        this.activeSourceNodes = [];
        this.masterGain = null;
        this.currentSoundId = null;

        if (nodesToStop.length === 0 && !gainToFade) return;

        if (immediate || !gainToFade || !this.ctx || this.ctx.state !== 'running') {
            nodesToStop.forEach((node) => {
                try {
                    node.stop?.();
                    node.disconnect();
                } catch {
                    // Ignore already stopped nodes
                }
            });
            if (gainToFade) {
                try {
                    gainToFade.disconnect();
                } catch {
                    // Ignore
                }
            }
            return;
        }

        try {
            const now = this.ctx.currentTime;
            gainToFade.gain.setValueAtTime(gainToFade.gain.value, now);
            gainToFade.gain.linearRampToValueAtTime(0.0001, now + 0.05);
        } catch {
            // Ignore ramp errors
        }

        this.stopTimeout = setTimeout(() => {
            nodesToStop.forEach((node) => {
                try {
                    node.stop?.();
                    node.disconnect();
                } catch {
                    // Ignore already stopped nodes
                }
            });
            if (gainToFade) {
                try {
                    gainToFade.disconnect();
                } catch {
                    // Ignore
                }
            }
            this.stopTimeout = null;
        }, 60);
    }

    public getCurrentSoundId(): ProceduralSoundId | null {
        return this.currentSoundId;
    }
}

export const proceduralAudio = new ProceduralAudioEngine();
