/**
 * Utilidades para generación de slugs SEO-friendly
 * 
 * Los slugs son URLs amigables que:
 * - Mejoran SEO
 * - Son fáciles de leer
 * - Son permanentes (no cambiar después de publicar)
 */

/**
 * Genera un slug a partir de un título y año
 * 
 * @param title - Título de la investigación
 * @param year - Año de publicación
 * @returns Slug normalizado (ej: "analisis-cambio-climatico-guatemala-2024")
 * 
 * @example
 * generateSlug("Análisis del Cambio Climático en Guatemala", 2024)
 * // Returns: "analisis-del-cambio-climatico-en-guatemala-2024"
 */
export function generateSlug(title: string, year: number): string {
    return title
        .toLowerCase()
        // Remover acentos
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        // Remover caracteres especiales (mantener solo letras, números, espacios y guiones)
        .replace(/[^a-z0-9\s-]/g, '')
        // Remover espacios múltiples
        .trim()
        .replace(/\s+/g, '-')
        // Remover guiones múltiples
        .replace(/-+/g, '-')
        // Truncar a 100 caracteres
        .substring(0, 100)
        // Remover guiones al final
        .replace(/-+$/, '')
        // Agregar año
        + `-${year}`
}

/**
 * Valida si un slug tiene el formato correcto
 * 
 * @param slug - Slug a validar
 * @returns true si el slug es válido
 */
export function isValidSlug(slug: string): boolean {
    // Debe contener solo letras minúsculas, números y guiones
    // Debe terminar con un año (4 dígitos)
    const slugPattern = /^[a-z0-9-]+-\d{4}$/
    return slugPattern.test(slug)
}

/**
 * Extrae el año de un slug
 * 
 * @param slug - Slug del que extraer el año
 * @returns Año extraído o null si no se encuentra
 */
export function extractYearFromSlug(slug: string): number | null {
    const match = slug.match(/-(\d{4})$/)
    return match ? parseInt(match[1], 10) : null
}

/**
 * Genera un slug único agregando un sufijo numérico si es necesario
 * 
 * @param baseSlug - Slug base
 * @param existingSlugs - Array de slugs existentes
 * @returns Slug único
 */
export function makeSlugUnique(baseSlug: string, existingSlugs: string[]): string {
    let slug = baseSlug
    let counter = 1

    while (existingSlugs.includes(slug)) {
        slug = `${baseSlug}-${counter}`
        counter++
    }

    return slug
}
