// app/sitemap.ts
/**
 * Sitemap automático para SEO
 * 
 * Next.js genera automáticamente el sitemap.xml en:
 * https://repositorio.unis.edu.gt/sitemap.xml
 * 
 * Incluye todas las investigaciones aprobadas para indexación
 */

import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://repositorio.unis.edu.gt'

    // Obtener todas las investigaciones aprobadas
    const { data: investigations } = await supabase
        .from('investigations')
        .select('slug, updated_at, created_at')
        .eq('status', 'aprobado')
        .order('updated_at', { ascending: false })

    // Páginas estáticas
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/login`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/register`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
    ]

    // Páginas de investigaciones
    const investigationPages: MetadataRoute.Sitemap = (investigations || []).map((inv) => ({
        url: `${baseUrl}/research/${inv.slug}`,
        lastModified: new Date(inv.updated_at || inv.created_at),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
    }))

    return [...staticPages, ...investigationPages]
}
