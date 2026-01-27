// lib/hooks.ts
"use client"

import useSWR from "swr"
import { supabase } from "./supabase"
import { searchOpenAlex } from "./external-apis"

// ============ Communities ============

export function useCommunities() {
  return useSWR("communities", async () => {
    const { data, error } = await supabase
      .from('communities')
      .select('*')
      .order('name')
    if (error) throw error
    return { communities: data || [] }
  }, {
    revalidateOnFocus: false,
  })
}

export function useCommunity(id: string | null) {
  return useSWR(id ? ["community", id] : null, async () => {
    const { data, error } = await supabase
      .from('communities')
      .select('*')
      .eq('uuid', id)
      .single()
    if (error) throw error
    return data
  }, { revalidateOnFocus: false })
}

export function useCommunityCollections(communityId: string | null) {
  return useSWR(
    communityId ? ["community-collections", communityId] : null,
    async () => {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('community_id', communityId)
        .order('name')
      if (error) throw error
      return data || []
    },
    { revalidateOnFocus: false },
  )
}

// ============ Items (Investigations) ============

export function useItems(page = 0, size = 20) {
  return useSWR(["items", page, size], async () => {
    const { data, error, count } = await supabase
      .from('investigations')
      .select('*', { count: 'exact' })
      .eq('status', 'aprobado')
      .range(page * size, (page + 1) * size - 1)
      .order('created_at', { ascending: false })

    if (error) throw error
    return {
      items: data || [],
      total: count || 0
    }
  }, { revalidateOnFocus: false })
}

export function useItem(id: string | null) {
  return useSWR(id ? ["item", id] : null, async () => {
    const { data, error } = await supabase
      .from('investigations')
      .select('*')
      .eq('id', id)
      .single()
    if (error) {
      console.error('[useItem] Error:', error)
      throw error
    }
    return data
  }, { revalidateOnFocus: false })
}

export function useItemBySlug(slug: string | null) {
  return useSWR(slug ? ["item-slug", slug] : null, async () => {
    const { data, error } = await supabase
      .from('investigations')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'aprobado')
      .single()
    if (error) {
      console.error('[useItemBySlug] Error:', error)
      throw error
    }
    return data
  }, { revalidateOnFocus: false })
}


// ============ Search ============

export function useSearch(
  params: {
    query?: string
    page?: number
    size?: number
    filters?: {
      faculty?: string[]
      career?: string[]
      year?: string[]
      work_type?: string[]
    }
  } | null,
) {
  return useSWR(params ? ["search", JSON.stringify(params)] : null, async () => {
    if (!params) return null
    let query = supabase
      .from('investigations')
      .select('*', { count: 'exact' })
      .eq('status', 'aprobado')

    if (params.query && params.query.trim() !== '') {
      query = query.or(`title.ilike.%${params.query}%,abstract.ilike.%${params.query}%`)
    }

    // Apply filters
    if (params.filters?.faculty?.length) {
      query = query.in('faculty', params.filters.faculty)
    }
    if (params.filters?.career?.length) {
      query = query.in('career', params.filters.career)
    }
    if (params.filters?.year?.length) {
      query = query.in('year', params.filters.year)
    }
    if (params.filters?.work_type?.length) {
      query = query.in('work_type', params.filters.work_type)
    }

    const page = params.page || 0
    const size = params.size || 20

    const { data, error, count } = await query
      .range(page * size, (page + 1) * size - 1)
      .order('created_at', { ascending: false })

    if (error) throw error
    return {
      items: data || [],
      total: count || 0
    }
  }, {
    revalidateOnFocus: false,
  })
}

// ============ My Submissions ============

export function useMyWorkspaceItems(userId: string | undefined) {
  return useSWR(userId ? ["my-workspace-items", userId] : null, async () => {
    const { data, error } = await supabase
      .from('investigations')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }, { revalidateOnFocus: false })
}

// ============ Global Review (For Admins/Docentes) ============

export function useGlobalInvestigations(role: string | undefined) {
  const canSeeAll = role === "admin" || role === "docente"
  return useSWR(canSeeAll ? "global-investigations" : null, async () => {
    const { data, error } = await supabase
      .from('investigations')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[useGlobalInvestigations] Error:', error)
      throw error
    }
    return data || []
  }, { revalidateOnFocus: false })
}

// ============ Comments ============

export function useComments(investigationId: string | null) {
  return useSWR(investigationId ? ["comments", investigationId] : null, async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('investigation_id', investigationId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[useComments] Error:', error)
      throw error
    }
    return data || []
  }, { revalidateOnFocus: false })
}

export function useUserProfile(userId: string | null) {
  return useSWR(userId ? ["profile", userId] : null, async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.debug('[useUserProfile] Profile not found, falling back to user ID')
      return null
    }
    return data
  }, { revalidateOnFocus: false })
}

export async function addComment(investigationId: string, content: string, userId: string) {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      investigation_id: investigationId,
      user_id: userId,
      content
    })
    .select()

  if (error) throw error
  return data
}

export async function updateComment(commentId: string, content: string) {
  const { error } = await supabase
    .from('comments')
    .update({
      content,
      is_edited: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', commentId)

  if (error) throw error
}

export async function deleteComment(commentId: string) {
  const { error } = await supabase
    .from('comments')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', commentId)

  if (error) throw error
}

// ============ External Search ============

export function useOpenAlexSearch(query: string, page = 1) {
  return useSWR(
    ["openalex", query || "default", page],
    () => searchOpenAlex(query, page),
    {
      revalidateOnFocus: false
    }
  )
}
