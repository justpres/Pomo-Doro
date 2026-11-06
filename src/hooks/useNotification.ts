'use client';

import { useCallback, useSyncExternalStore } from 'react';

const listeners = new Set<() => void>();

function notifyChange() {
    listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

function getPermissionSnapshot(): NotificationPermission {
    if (typeof window !== 'undefined' && 'Notification' in window) {
        return Notification.permission;
    }
    return 'default';
}

function getServerSnapshot(): NotificationPermission {
    return 'default';
}

export function useNotification() {
    const permission = useSyncExternalStore(
        subscribe,
        getPermissionSnapshot,
        getServerSnapshot
    );

    const requestPermission = useCallback(async () => {
        if (typeof window === 'undefined' || !('Notification' in window)) {
            return false;
        }

        if (Notification.permission === 'granted') {
            notifyChange();
            return true;
        }

        if (Notification.permission !== 'denied') {
            const result = await Notification.requestPermission();
            notifyChange();
            return result === 'granted';
        }

        return false;
    }, []);

    const sendNotification = useCallback((title: string, body: string) => {
        if (typeof window === 'undefined' || !('Notification' in window)) {
            return;
        }

        if (Notification.permission === 'granted') {
            try {
                const notification = new Notification(title, {
                    body,
                    icon: '/favicon.ico',
                });
                // Auto-close after 8 seconds
                setTimeout(() => notification.close(), 8000);
            } catch (error) {
                console.error('Notification error:', error);
            }
        }
    }, []);

    const isSupported = typeof window !== 'undefined' && 'Notification' in window;
    const isGranted = permission === 'granted';

    return { permission, requestPermission, sendNotification, isSupported, isGranted };
}
