// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    if (typeof window === 'undefined') {
        console.warn('⚠️ Supabase credentials missing. Please check your .env.local file.')
    }
}

// Configuración optimizada de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'supabase-auth',
        flowType: 'pkce',
    },
    global: {
        headers: {
            'x-client-info': 'supabase-js-web',
        },
    },
    db: {
        schema: 'public',
    },
    realtime: {
        params: {
            eventsPerSecond: 10,
        },
    },
})

// Helper function para retry automático en consultas con timeout
export async function supabaseQuery<T>(
    queryFn: () => PromiseLike<{ data: T | null; error: any; count?: number | null }>,
    retries = 3,
    delay = 500 // 500ms inicial, luego backoff
): Promise<{ data: T | null; error: any; count?: number | null }> {
    let lastError: any = null

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            // Promise.race para forzar un timeout de 8 segundos por intento
            // Esto evita que la aplicación se "congele" esperando respuestas eternas
            const timeoutPromise = new Promise<{ data: T | null; error: any; count?: number | null }>((_, reject) => {
                setTimeout(() => reject(new Error('Query timeout (8s)')), 8000)
            })

            const result = await Promise.race([
                queryFn() as Promise<{ data: T | null; error: any; count?: number | null }>,
                timeoutPromise
            ])

            // Si hay error de red o timeout, reintentar
            if (result.error) {
                const errorMessage = result.error.message || ''
                const isNetworkError =
                    errorMessage.includes('fetch') ||
                    errorMessage.includes('network') ||
                    errorMessage.includes('timeout') ||
                    errorMessage.includes('aborted') ||
                    errorMessage.includes('Failed to fetch')

                if (isNetworkError && attempt < retries) {
                    console.warn(`⚡ Supabase retry ${attempt + 1}/${retries}: ${errorMessage}`)
                    lastError = result.error
                    // Exponential backoff limitado (0.5s, 1s, 2s)
                    const waitTime = Math.min(delay * Math.pow(2, attempt), 3000)
                    await new Promise(resolve => setTimeout(resolve, waitTime))
                    continue
                }

                return result
            }

            return result
        } catch (error: any) {
            lastError = error
            console.warn(`⚡ Supabase exception (attempt ${attempt + 1}):`, error.message)

            if (attempt < retries) {
                const waitTime = Math.min(delay * Math.pow(2, attempt), 3000)
                await new Promise(resolve => setTimeout(resolve, waitTime))
            }
        }
    }

    return {
        data: null,
        error: lastError || new Error('Query failed after retries'),
        count: null
    }
}

// Helper para verificar la conexión
export async function checkSupabaseConnection(): Promise<boolean> {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('id')
            .limit(1)
            .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned (OK)
            console.error('❌ Supabase connection check failed:', error)
            return false
        }

        console.log('✅ Supabase connection OK')
        return true
    } catch (error) {
        console.error('❌ Supabase connection check exception:', error)
        return false
    }
}

