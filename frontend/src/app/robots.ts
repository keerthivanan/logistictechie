import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/dashboard/', '/admin/', '/profile/', '/settings/', '/booking/', '/api/'],
            },
        ],
        sitemap: 'https://cargolink.sa/sitemap.xml',
        host: 'https://cargolink.sa',
    }
}
