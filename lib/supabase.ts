// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    if (typeof window === 'undefined') {
        console.warn('Supabase credentials missing. Please check your .env.local file.')
    }
}

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
        fetch: (url, options = {}) => {
            // Create a new AbortController for each request to avoid signal reuse issues
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

            return fetch(url, {
                ...options,
                signal: controller.signal,
                keepalive: false, // Disable keepalive to prevent connection issues
            }).finally(() => clearTimeout(timeoutId))
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
