import type { MetadataRoute } from 'next';

const siteUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : 'https://pomodofocus.vercel.app');

export default function sitemap(): MetadataRoute.Sitemap {
    const routes = ['', '/tasks', '/presets', '/stats', '/settings'];
    const lastModified = new Date();

    return routes.map((route) => ({
        url: `${siteUrl}${route}`,
        lastModified,
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
    }));
}
