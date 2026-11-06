export type BreathPhase = 'inhale' | 'topup' | 'hold' | 'exhale' | 'gaze';

export type ProtocolId = 'cyclic-sigh' | 'box-breathing' | 'relax-478' | 'ocular-reset';

export interface BreathStep {
    phase: BreathPhase;
    label: string;
    instruction: string;
    duration: number; // in seconds
    scale: number; // orb visual scale target
}

export interface BreathProtocol {
    id: ProtocolId;
    name: string;
    badge: string;
    source: string;
    scienceRationale: string;
    tip: string;
    targetCycles: number;
    steps: BreathStep[];
}

export const BREATH_PROTOCOLS: BreathProtocol[] = [
    {
        id: 'cyclic-sigh',
        name: 'Cyclic Sigh',
        badge: 'Stanford Protocol',
        source: 'Balban, Spiegel, Huberman (Cell Reports Medicine, 2023)',
        scienceRationale:
            'Two sharp nasal inhales reinflate collapsed alveoli in the lungs, followed by an extended mouth exhalation that maximally offloads CO2 and stimulates the parasympathetic vagal brake.',
        tip: 'Two deep inhales through your nose, then a slow, relaxed exhale.',
        targetCycles: 3,
        steps: [
            {
                phase: 'inhale',
                label: 'Inhale',
                instruction: 'Breathe in deeply through your nose',
                duration: 3.5,
                scale: 1.35,
            },
            {
                phase: 'topup',
                label: 'Top-up Inhale',
                instruction: 'Sniff in a second breath to fill your lungs',
                duration: 1.0,
                scale: 1.5,
            },
            {
                phase: 'exhale',
                label: 'Exhale',
                instruction: 'Release all air slowly through your mouth',
                duration: 6.0,
                scale: 1.0,
            },
        ],
    },
    {
        id: 'box-breathing',
        name: 'Box Breathing',
        badge: 'Autonomic Balance',
        source: 'Navy SEAL Tactical Resiliency & Heart Rate Variability Protocol',
        scienceRationale:
            'Equal-ratio respiration balances carbon dioxide-oxygen exchange, steadying the central nervous system after high-cognitive load.',
        tip: 'Inhale, hold, exhale, hold for 4 seconds each to steady your focus.',
        targetCycles: 3,
        steps: [
            {
                phase: 'inhale',
                label: 'Inhale',
                instruction: 'Fill chest and abdomen through your nose',
                duration: 4.0,
                scale: 1.4,
            },
            {
                phase: 'hold',
                label: 'Hold',
                instruction: 'Pause gently with full lungs',
                duration: 4.0,
                scale: 1.4,
            },
            {
                phase: 'exhale',
                label: 'Exhale',
                instruction: 'Empty lungs smoothly through mouth or nose',
                duration: 4.0,
                scale: 1.0,
            },
            {
                phase: 'hold',
                label: 'Hold',
                instruction: 'Rest comfortably before next breath',
                duration: 4.0,
                scale: 1.0,
            },
        ],
    },
    {
        id: 'relax-478',
        name: '4-7-8 Relax',
        badge: 'Deep Calm',
        source: 'Dr. Andrew Weil & Integrative Medicine Research',
        scienceRationale:
            'A 7-second oxygen saturation hold followed by an 8-second slow exhalation acts as a natural tranquilizer for the nervous system.',
        tip: 'Inhale 4s, hold gently 7s, exhale 8s to calm your nervous system.',
        targetCycles: 2,
        steps: [
            {
                phase: 'inhale',
                label: 'Inhale',
                instruction: 'Breathe in quietly through the nose',
                duration: 4.0,
                scale: 1.4,
            },
            {
                phase: 'hold',
                label: 'Hold',
                instruction: 'Hold breath gently without straining',
                duration: 7.0,
                scale: 1.4,
            },
            {
                phase: 'exhale',
                label: 'Exhale',
                instruction: 'Exhale completely with a soft whoosh',
                duration: 8.0,
                scale: 1.0,
            },
        ],
    },
    {
        id: 'ocular-reset',
        name: 'Visual Reset',
        badge: 'Ophthalmic Ergonomics',
        source: 'American Academy of Ophthalmology (AAO)',
        scienceRationale:
            'Shifting focal distance from near screens (under 2 ft) to infinity (20+ ft) releases the ciliary muscle from prolonged accommodation spasm, preventing asthenopia and headaches.',
        tip: 'Look at an object 20+ feet away to release eye muscle strain.',
        targetCycles: 1,
        steps: [
            {
                phase: 'gaze',
                label: 'Look into Distance',
                instruction: 'Gaze 20+ feet away to relax eye muscles',
                duration: 20.0,
                scale: 1.25,
            },
        ],
    },
];

export function getProtocol(id: ProtocolId): BreathProtocol {
    return BREATH_PROTOCOLS.find((p) => p.id === id) || BREATH_PROTOCOLS[0];
}

export function calculateCycleDuration(protocol: BreathProtocol): number {
    return protocol.steps.reduce((sum, step) => sum + step.duration, 0);
}

export function calculateTotalProtocolDuration(protocol: BreathProtocol): number {
    return calculateCycleDuration(protocol) * protocol.targetCycles;
}
