// app/robots.ts
/**
 * Robots.txt para control de crawlers
 * 
 * Next.js genera automáticamente el robots.txt en:
 * https://repositorio.unis.edu.gt/robots.txt
 * 
 * Configuración:
 * - Permite indexar páginas públicas
 * - Bloquea dashboard y API
 * - Permite específicamente Google Scholar
 */

import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://repositorio.unis.edu.gt'

    return {
        rules: [
            // Reglas generales para todos los bots
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/dashboard/',
                    '/api/',
                    '/_next/',
                    '/admin/',
                ],
            },
            // Regla específica para Google Scholar
            {
                userAgent: 'Googlebot-Scholar',
                allow: '/research/',
                crawlDelay: 1,
            },
            // Regla específica para Googlebot
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: ['/dashboard/', '/api/'],
            },
            // Regla específica para Bingbot
            {
                userAgent: 'Bingbot',
                allow: '/',
                disallow: ['/dashboard/', '/api/'],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
