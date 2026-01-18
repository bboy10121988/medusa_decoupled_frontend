import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://timsfantasyworld.com'

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/admin/',
                    '/_next/',
                    '/checkout/',
                    '/account/',
                ],
            },
        ],
        sitemap: [
            `${baseUrl}/sitemap.xml`,
            `${baseUrl}/tw/sitemap.xml`,
            `${baseUrl}/jp/sitemap.xml`,
            `${baseUrl}/us/sitemap.xml`,
        ],
    }
}
