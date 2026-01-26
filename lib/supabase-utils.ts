// lib/supabase-utils.ts

/**
 * Utility functions for handling Supabase errors and operations
 */

/**
 * Check if an error is an AbortError
 */
export function isAbortError(error: any): boolean {
    if (!error) return false

    return (
        error.name === 'AbortError' ||
        error.message?.includes('aborted') ||
        error.message?.includes('AbortError')
    )
}

/**
 * Retry a Supabase operation with exponential backoff
 * @param operation - The async operation to retry
 * @param maxAttempts - Maximum number of retry attempts (default: 3)
 * @param baseDelay - Base delay in milliseconds (default: 1000)
 * @param onRetry - Optional callback called before each retry
 */
export async function retryOperation<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    baseDelay: number = 1000,
    onRetry?: (attempt: number, error: any) => void
): Promise<T> {
    let lastError: any = null

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            return await operation()
        } catch (error: any) {
            lastError = error

            // If it's not an abort error or we've exhausted retries, throw immediately
            if (!isAbortError(error) || attempt >= maxAttempts - 1) {
                throw error
            }

            // Calculate exponential backoff delay
            const delay = baseDelay * Math.pow(2, attempt)

            // Call retry callback if provided
            if (onRetry) {
                onRetry(attempt + 1, error)
            }

            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, delay))
        }
    }

    throw lastError
}

/**
 * Get a user-friendly error message from a Supabase error
 */
export function getErrorMessage(error: any): string {
    if (!error) return 'Error desconocido'

    if (isAbortError(error)) {
        return 'Error de conexión. Por favor, intenta nuevamente.'
    }

    // Handle Supabase-specific errors
    if (error.code) {
        switch (error.code) {
            case '23505':
                return 'Este registro ya existe'
            case '23503':
                return 'Referencia inválida'
            case '42501':
                return 'No tienes permisos para realizar esta acción'
            case 'PGRST116':
                return 'No se encontró el recurso solicitado'
            default:
                return error.message || 'Error en la operación'
        }
    }

    return error.message || 'Error desconocido'
}

/**
 * Log an error only if it's not an AbortError
 * Useful for filtering out noise in development
 */
export function logError(context: string, error: any): void {
    if (!isAbortError(error)) {
        console.error(`[${context}]`, error)
    }
}
