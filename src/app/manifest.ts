import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'PomodoFocus — Minimalist Pomodoro Timer',
        short_name: 'PomodoFocus',
        description:
            'A beautifully designed, minimalist Pomodoro timer featuring ambient lofi radio, dynamic island controls, and deep work presets.',
        start_url: '/',
        display: 'standalone',
        background_color: '#FAF9F6',
        theme_color: '#FF6363',
        orientation: 'portrait',
        icons: [
            {
                src: '/pomodoro.ico?v=2',
                sizes: 'any',
                type: 'image/x-icon',
            },
        ],
        categories: ['productivity', 'utilities', 'lifestyle'],
    };
}
