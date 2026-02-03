'use server'

import { supabaseAdmin } from "@/lib/supabase-admin"

export async function getAdminUsersList() {
    try {
        // 1. Get Auth Users (emails) - Limit 1000 for this view
        const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers({
            perPage: 1000
        })

        if (authError) {
            console.error("Auth Fetch Error:", authError)
            throw new Error("Error fetching auth users")
        }

        // 2. Get Profiles (roles, permissions)
        const { data: profiles, error: profilesError } = await supabaseAdmin
            .from('profiles')
            .select('*')

        if (profilesError) {
            console.error("Profile Fetch Error:", profilesError)
            throw new Error("Error fetching profiles")
        }

        // 3. Get document counts (for stats)
        const { data: investigations } = await supabaseAdmin
            .from('investigations')
            .select('owner_id')

        const counts: Record<string, number> = {}
        investigations?.forEach((inv: any) => {
            counts[inv.owner_id] = (counts[inv.owner_id] || 0) + 1
        })

        // 4. Merge Data
        // We iterate over profiles because that's our source of truth for "active app users"
        const mergedUsers = profiles.map((profile: any) => {
            const authUser = authUsers.find(u => u.id === profile.id)
            return {
                id: profile.id,
                full_name: profile.full_name,
                role: profile.role,
                can_upload: profile.can_upload,
                updated_at: profile.updated_at,
                // Data from Auth
                email: authUser?.email || 'Email no disponible (External Auth)',
                last_sign_in_at: authUser?.last_sign_in_at,
                // Counts
                investigation_count: counts[profile.id] || 0
            }
        })

        // Sort: Admins first, then by date
        return mergedUsers.sort((a, b) => {
            if (a.role === 'admin' && b.role !== 'admin') return -1
            if (a.role !== 'admin' && b.role === 'admin') return 1
            return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        })

    } catch (error) {
        console.error("Server Action Error:", error)
        return []
    }
}
