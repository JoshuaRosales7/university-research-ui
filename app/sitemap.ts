// app/sitemap.ts
/**
 * Sitemap automático para SEO
 * 
 * Next.js genera automáticamente el sitemap.xml en:
 * https://unisrepo.netlify.app/sitemap.xml
 * 
 * Incluye todas las investigaciones aprobadas para indexación
 * y páginas públicas importantes del repositorio UNIS
 */

import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export const revalidate = 3600 // Revalidar cada hora

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://unisrepo.netlify.app'
    const currentDate = new Date()

    // Páginas estáticas principales
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: currentDate,
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/login`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.3, // Reducida - no es contenido principal
        },
        {
            url: `${baseUrl}/register`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.3, // Reducida - no es contenido principal
        },
    ]

    try {
        // Obtener todas las investigaciones aprobadas con manejo de errores
        const { data: investigations, error } = await supabase
            .from('investigations')
            .select('slug, created_at, title')
            .eq('status', 'aprobado')
            .not('slug', 'is', null) // Solo investigaciones con slug
            .order('created_at', { ascending: false })
            .limit(1000) // Límite de seguridad

        if (error) {
            console.error('[Sitemap] Error fetching investigations:', error)
            // Retornar solo páginas estáticas si hay error
            return staticPages
        }

        // Páginas de investigaciones individuales
        const investigationPages: MetadataRoute.Sitemap = (investigations || [])
            .filter(inv => inv.slug) // Doble verificación de slug
            .map((inv) => ({
                url: `${baseUrl}/research/${inv.slug}`,
                lastModified: new Date(inv.created_at),
                changeFrequency: 'weekly' as const, // Las investigaciones se actualizan ocasionalmente
                priority: 0.8, // Alta prioridad - contenido principal
            }))

        console.log(`[Sitemap] Generated ${investigationPages.length} investigation pages`)

        return [...staticPages, ...investigationPages]
    } catch (error) {
        console.error('[Sitemap] Unexpected error:', error)
        // Fallback: retornar solo páginas estáticas
        return staticPages
    }
}
