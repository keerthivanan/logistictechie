import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const base = 'https://cargolink.sa'
    const now = new Date()

    return [
        { url: base,                        lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
        { url: `${base}/search`,            lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
        { url: `${base}/marketplace`,       lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
        { url: `${base}/about`,             lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
        { url: `${base}/contact-us`,        lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
        { url: `${base}/forwarders`,        lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
        { url: `${base}/tracking`,          lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
        { url: `${base}/login`,             lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
        { url: `${base}/signup`,            lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    ]
}
