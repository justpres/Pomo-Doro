import type { MetadataRoute } from 'next';

const siteUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : 'https://pomodofocus.vercel.app');

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
            },
            // Explicitly allow AI Answer Engines (GEO & AEO optimization)
            {
                userAgent: [
                    'GPTBot',
                    'ChatGPT-User',
                    'PerplexityBot',
                    'ClaudeBot',
                    'Google-Extended',
                    'Applebot-Extended',
                    'CCBot',
                ],
                allow: ['/', '/llms.txt', '/llms-full.txt'],
            },
        ],
        sitemap: `${siteUrl}/sitemap.xml`,
    };
}
