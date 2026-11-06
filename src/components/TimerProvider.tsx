'use client';

import { useTimer } from '@/hooks/useTimer';

/**
 * Global Timer Provider
 * 
 * This component runs the timer logic globally so the countdown
 * continues when the user navigates to other pages.
 * It doesn't render any visible UI.
 */
export function TimerProvider() {
    // Run the timer hook globally
    useTimer();

    return null;
}
