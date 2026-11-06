import { BreathPhase } from './breathProtocols';

class BreathAudioSynthesizer {
    private ctx: AudioContext | null = null;
    private isMuted: boolean = false;

    private getContext(): AudioContext | null {
        if (typeof window === 'undefined') return null;
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
        return this.ctx;
    }

    public setMuted(muted: boolean) {
        this.isMuted = muted;
    }

    public playPhaseCue(phase: BreathPhase) {
        if (this.isMuted) return;
        const ctx = this.getContext();
        if (!ctx) return;

        try {
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.connect(gain);
            gain.connect(ctx.destination);

            if (phase === 'inhale') {
                // Gentle rising harmonic tone
                osc.frequency.setValueAtTime(360, now);
                osc.frequency.exponentialRampToValueAtTime(460, now + 0.35);
                gain.gain.setValueAtTime(0.001, now);
                gain.gain.linearRampToValueAtTime(0.06, now + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
                osc.start(now);
                osc.stop(now + 0.42);
            } else if (phase === 'topup') {
                // Crisp, light secondary top-up cue
                osc.frequency.setValueAtTime(520, now);
                osc.frequency.exponentialRampToValueAtTime(600, now + 0.2);
                gain.gain.setValueAtTime(0.001, now);
                gain.gain.linearRampToValueAtTime(0.07, now + 0.03);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
                osc.start(now);
                osc.stop(now + 0.26);
            } else if (phase === 'exhale') {
                // Calming descending tone
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.exponentialRampToValueAtTime(290, now + 0.5);
                gain.gain.setValueAtTime(0.001, now);
                gain.gain.linearRampToValueAtTime(0.05, now + 0.06);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
                osc.start(now);
                osc.stop(now + 0.58);
            } else if (phase === 'hold') {
                // Soft stable meditation bell pulse
                osc.frequency.setValueAtTime(392, now);
                gain.gain.setValueAtTime(0.001, now);
                gain.gain.linearRampToValueAtTime(0.035, now + 0.04);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
                osc.start(now);
                osc.stop(now + 0.38);
            } else if (phase === 'gaze') {
                // Soft oceanic frequency shift
                osc.frequency.setValueAtTime(320, now);
                osc.frequency.linearRampToValueAtTime(340, now + 0.3);
                gain.gain.setValueAtTime(0.001, now);
                gain.gain.linearRampToValueAtTime(0.04, now + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
                osc.start(now);
                osc.stop(now + 0.42);
            }
        } catch {
            // Audio context may be blocked by autoplay policies
        }
    }

    public playCompletionChime() {
        if (this.isMuted) return;
        const ctx = this.getContext();
        if (!ctx) return;

        try {
            const now = ctx.currentTime;
            // Calming 3-note chord: C5 (523.25), E5 (659.25), G5 (783.99)
            const frequencies = [523.25, 659.25, 783.99];

            frequencies.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                const start = now + idx * 0.12;

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, start);

                gain.gain.setValueAtTime(0.001, start);
                gain.gain.linearRampToValueAtTime(0.045, start + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.9);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(start);
                osc.stop(start + 0.95);
            });
        } catch {
            // Ignore audio errors
        }
    }
}

export const breathAudio = new BreathAudioSynthesizer();
