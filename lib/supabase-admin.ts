import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
    if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Missing Admin Keys: Check SUPABASE_SERVICE_ROLE_KEY in .env.local')
    }
}

// Cliente con privilegios de administrador (Service Role)
// IMPORTANTE: Solo usar en el servidor (Server Actions / API Routes)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || 'placeholder', {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})
