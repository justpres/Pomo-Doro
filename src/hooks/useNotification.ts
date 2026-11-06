'use client';

import { useCallback, useEffect, useRef } from 'react';

export function useNotification() {
    const permissionRef = useRef<NotificationPermission>('default');

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            permissionRef.current = Notification.permission;
        }
    }, []);

    const requestPermission = useCallback(async () => {
        if (typeof window === 'undefined' || !('Notification' in window)) {
            return false;
        }

        if (Notification.permission === 'granted') {
            permissionRef.current = 'granted';
            return true;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            permissionRef.current = permission;
            return permission === 'granted';
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
    const isGranted = permissionRef.current === 'granted';

    return { requestPermission, sendNotification, isSupported, isGranted };
}
