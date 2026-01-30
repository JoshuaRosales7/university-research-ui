/**
 * Componente para generar metadata académica (Google Scholar, Dublin Core, etc.)
 * 
 * Este componente debe usarse en páginas públicas de investigaciones
 * para asegurar la correcta indexación en motores académicos.
 */

import { Metadata } from 'next'

export interface Investigation {
    id: string
    title: string
    abstract: string
    authors: string[] | string
    year: number
    slug: string
    file_url?: string
    keywords?: string[]
    language?: string
    faculty?: string
    career?: string
    advisor?: string
    work_type?: string
    created_at: string
    updated_at: string
    views_count?: number
    downloads_count?: number
    reviewed_at?: string
    status?: string
}

interface AcademicMetadataProps {
    investigation: Investigation
    baseUrl?: string
}

/**
 * Genera metadata completa para SEO académico
 * 
 * Incluye:
 * - Google Scholar (citation_*)
 * - Dublin Core (DC.*)
 * - Open Graph (og:*)
 * - Twitter Cards
 * - JSON-LD Structured Data
 */
export function generateAcademicMetadata(
    investigation: Investigation,
    baseUrl: string = 'https://unisrepo.netlify.app'
): Metadata {
    const authors = Array.isArray(investigation.authors)
        ? investigation.authors
        : [investigation.authors]

    const pageUrl = `${baseUrl}/research/${investigation.slug}`
    const pdfUrl = investigation.file_url || ''
    const keywords = investigation.keywords?.join(', ') || ''

    return {
        title: `${investigation.title} | Repositorio UNIS`,
        description: investigation.abstract.substring(0, 160),

        // Open Graph
        openGraph: {
            title: investigation.title,
            description: investigation.abstract,
            type: 'article',
            url: pageUrl,
            siteName: 'Repositorio Institucional UNIS',
            locale: 'es_GT',
            publishedTime: investigation.created_at,
            modifiedTime: investigation.updated_at,
            authors: authors,
            tags: investigation.keywords,
        },

        // Twitter Card
        twitter: {
            card: 'summary_large_image',
            title: investigation.title,
            description: investigation.abstract.substring(0, 200),
        },

        // Canonical URL
        alternates: {
            canonical: pageUrl,
        },

        // Robots
        robots: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
        },

        // Metadata adicional
        other: {
            // Dublin Core
            'DC.title': investigation.title,
            'DC.creator': authors.join('; '),
            'DC.date': investigation.year.toString(),
            'DC.identifier': pageUrl,
            'DC.description': investigation.abstract,
            'DC.language': investigation.language || 'es',
            'DC.type': 'Text',
            'DC.format': 'application/pdf',

            // Google Scholar
            'citation_title': investigation.title,
            'citation_publication_date': `${investigation.year}/01/01`,
            'citation_pdf_url': pdfUrl,
            'citation_abstract_html_url': pageUrl,
            'citation_language': investigation.language || 'es',
            'citation_keywords': keywords,

            // Agregar autores individualmente (Google Scholar requiere meta tags separados)
            ...authors.reduce((acc, author, index) => ({
                ...acc,
                [`citation_author_${index}`]: author,
            }), {}),

            // Metadata institucional
            'citation_dissertation_institution': 'Universidad del Istmo (UNIS)',
            'citation_technical_report_institution': 'Universidad del Istmo (UNIS)',
        },
    }
}

/**
 * Genera JSON-LD para structured data
 * 
 * Esto ayuda a Google y otros motores a entender mejor el contenido
 */
export function generateScholarlyArticleJsonLd(investigation: Investigation, baseUrl: string = 'https://unisrepo.netlify.app') {
    const authors = Array.isArray(investigation.authors)
        ? investigation.authors
        : [investigation.authors]

    return {
        '@context': 'https://schema.org',
        '@type': 'ScholarlyArticle',
        headline: investigation.title,
        abstract: investigation.abstract,
        author: authors.map(name => ({
            '@type': 'Person',
            name: name,
        })),
        datePublished: `${investigation.year}-01-01`,
        dateCreated: investigation.created_at,
        dateModified: investigation.updated_at,
        inLanguage: investigation.language || 'es',
        keywords: investigation.keywords?.join(', '),
        publisher: {
            '@type': 'EducationalOrganization',
            name: 'Universidad del Istmo',
            url: 'https://www.unis.edu.gt',
        },
        isAccessibleForFree: true,
        license: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
        url: `${baseUrl}/research/${investigation.slug}`,
        ...(investigation.file_url && {
            encoding: {
                '@type': 'MediaObject',
                contentUrl: investigation.file_url,
                encodingFormat: 'application/pdf',
            },
        }),
    }
}
