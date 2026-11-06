import { Session } from '@/store/sessionStore';

export interface HourlyProfile {
    hour: number;
    sessionCount: number;
    focusMinutes: number;
    averageQuality: number;
    ratedCount: number;
}

export type ChronotypeType = 'lark' | 'intermediate' | 'owl' | 'uncalibrated';

export interface ChronotypeResult {
    type: ChronotypeType;
    label: string;
    icon: string;
    badge: string;
    scientificBasis: string;
    recommendation: string;
    optimalTasks: string;
}

export interface BiologicalPrimeTime {
    startHour: number;
    endHour: number;
    sessionCount: number;
    averageQuality: number;
    confidence: 'preliminary' | 'established';
}

export function computeHourlyProfile(sessions: Session[]): HourlyProfile[] {
    const hours: HourlyProfile[] = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        sessionCount: 0,
        focusMinutes: 0,
        averageQuality: 0,
        ratedCount: 0,
    }));

    const focusSessions = sessions.filter((s) => s.type === 'focus');
    const qualitySums: number[] = Array(24).fill(0);

    focusSessions.forEach((s) => {
        const d = new Date(s.completedAt);
        const hour = d.getHours();
        if (hour >= 0 && hour < 24) {
            hours[hour].sessionCount += 1;
            hours[hour].focusMinutes += Math.round(s.duration / 60);
            if (s.focusQuality && s.focusQuality > 0) {
                qualitySums[hour] += s.focusQuality;
                hours[hour].ratedCount += 1;
            }
        }
    });

    for (let i = 0; i < 24; i++) {
        if (hours[i].ratedCount > 0) {
            hours[i].averageQuality =
                Math.round((qualitySums[i] / hours[i].ratedCount) * 10) / 10;
        }
    }

    return hours;
}

export function detectChronotype(sessions: Session[]): ChronotypeResult {
    const focusSessions = sessions.filter((s) => s.type === 'focus');

    if (focusSessions.length < 2) {
        return {
            type: 'uncalibrated',
            label: 'Calibrating Rhythm...',
            icon: '🧭',
            badge: 'Gathering Data',
            scientificBasis: '',
            recommendation:
                'Log a few sessions across the day to discover your peak focus hours.',
            optimalTasks: '',
        };
    }

    let morningCount = 0; // 05:00 - 11:59
    let middayCount = 0; // 12:00 - 17:59
    let eveningCount = 0; // 18:00 - 04:59

    focusSessions.forEach((s) => {
        const hour = new Date(s.completedAt).getHours();
        if (hour >= 5 && hour < 12) {
            morningCount += 1;
        } else if (hour >= 12 && hour < 18) {
            middayCount += 1;
        } else {
            eveningCount += 1;
        }
    });

    if (morningCount >= middayCount && morningCount >= eveningCount) {
        return {
            type: 'lark',
            label: 'Morning Lark',
            icon: '🌅',
            badge: 'Early Peak',
            scientificBasis: '',
            recommendation:
                'Your focus peaks before noon. Schedule demanding deep work in the morning.',
            optimalTasks: 'Analytical work, complex coding, writing.',
        };
    }

    if (eveningCount >= morningCount && eveningCount >= middayCount) {
        return {
            type: 'owl',
            label: 'Night Owl',
            icon: '🦉',
            badge: 'Late Peak',
            scientificBasis: '',
            recommendation:
                'Your focus peaks later in the day. Save demanding deep work for afternoon and evening.',
            optimalTasks: 'Creative flow, deep sprints, architecture.',
        };
    }

    return {
        type: 'intermediate',
        label: 'Balanced Rhythm',
        icon: '🦅',
        badge: 'Steady State',
        scientificBasis: '',
        recommendation:
            'Your energy is steady with natural focus peaks mid-morning and late afternoon.',
        optimalTasks: 'Iterative development, balanced execution.',
    };
}

export function findBiologicalPrimeTime(sessions: Session[]): BiologicalPrimeTime | null {
    const hourly = computeHourlyProfile(sessions);
    const candidateHours = hourly.filter((h) => h.sessionCount > 0);

    if (candidateHours.length === 0) return null;

    // Rank hours by combination of session count and focus quality
    let bestHour = candidateHours[0];
    let bestScore = -1;

    candidateHours.forEach((h) => {
        // Quality weight: if rated, give bonus
        const qualityFactor = h.averageQuality > 0 ? h.averageQuality / 5 : 0.8;
        const score = h.sessionCount * 1.5 + qualityFactor * 3;

        if (score > bestScore) {
            bestScore = score;
            bestHour = h;
        }
    });

    const startHour = bestHour.hour;
    const endHour = (startHour + 2) % 24;

    return {
        startHour,
        endHour,
        sessionCount: bestHour.sessionCount,
        averageQuality: bestHour.averageQuality,
        confidence: bestHour.sessionCount >= 4 ? 'established' : 'preliminary',
    };
}
