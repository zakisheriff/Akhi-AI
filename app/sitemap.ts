import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://akhi.theoneatom.com';
    const currentDate = new Date().toISOString();

    return [
        // Main App - High Priority
        {
            url: `${baseUrl}/`,
            lastModified: currentDate,
            changeFrequency: 'daily',
            priority: 1.0,
        },
        // Core Feature Pages
        {
            url: `${baseUrl}/about/`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/features/`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        // Legal Pages
        {
            url: `${baseUrl}/privacy/`,
            lastModified: currentDate,
            changeFrequency: 'yearly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/terms/`,
            lastModified: currentDate,
            changeFrequency: 'yearly',
            priority: 0.6,
        },
    ];
}
