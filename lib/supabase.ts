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
        // Custom fetch implementation removed as it can cause issues in some environments
        // Default fetch behavior handles AbortController internally in newer versions
    },
    db: {
        schema: 'public',
    },
    // Realtime configuration updated
    realtime: {
        params: {
            eventsPerSecond: 10,
        },
    },
})
