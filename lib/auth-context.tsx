// lib/auth-context.tsx

"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react"
import { supabase } from "./supabase"
import type { AppUser, Profile } from "./types"

interface AuthContextType {
  user: AppUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (data: { email: string; password: string; firstName: string; lastName: string; role: "admin" | "docente" | "estudiante" }) => Promise<{ success: boolean; error?: string }>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  // Use a ref for cache to avoid dependency issues in useCallback
  const profileCache = useRef(new Map<string, Profile>())

  // Memoize fetching profile to avoid unnecessary re-renders or recreated functions
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    // Check cache first
    if (profileCache.current.has(userId)) {
      return profileCache.current.get(userId)!
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        if (error.message !== 'AbortError' && !error.message.includes('aborted')) {
          console.error("[Auth] Error fetching profile:", error.message)
        }
        return null
      }

      if (data) {
        profileCache.current.set(userId, data as Profile)
        return data as Profile
      }
      return null
    } catch (error: any) {
      if (error.name !== 'AbortError' && !error.message?.includes('aborted')) {
        console.error("[Auth] Unexpected error fetching profile:", error)
      }
      return null
    }
  }, [])

  const convertToAppUser = useCallback((supabaseUser: any, profile: Profile | null): AppUser | null => {
    if (!supabaseUser) return null

    // Prioritize profile data, fallback to metadata
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || "",
      firstName: profile?.first_name || supabaseUser.user_metadata?.first_name || "",
      lastName: profile?.last_name || supabaseUser.user_metadata?.last_name || "",
      fullName: profile?.full_name || supabaseUser.user_metadata?.full_name || "",
      role: profile?.role || (supabaseUser.user_metadata?.role as any) || "estudiante",
      avatarUrl: profile?.avatar_url || supabaseUser.user_metadata?.avatar_url || "",
    }
  }, [])

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        // 1. Get initial session
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) throw error

        if (session?.user && mounted) {
          // Fetch profile in parallel if needed, but here we wait to ensure consistent state
          const profile = await fetchProfile(session.user.id)
          if (mounted) {
            setUser(convertToAppUser(session.user, profile))
          }
        }
      } catch (error: any) {
        if (mounted && error.message !== 'AbortError' && !error.message?.includes('aborted')) {
          console.error("[Auth] Error initializing auth:", error)
        }
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    initializeAuth()

    // 2. Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      console.log("[Auth] Auth state change:", event)

      if (event === 'SIGNED_OUT') {
        setUser(null)
        setIsLoading(false)
        profileCache.current.clear() // Clear cache on logout
      } else if (session?.user) {
        // For SIGNED_IN, TOKEN_REFRESHED, etc.
        const profile = await fetchProfile(session.user.id)
        if (mounted) {
          setUser(convertToAppUser(session.user, profile))
          setIsLoading(false)
        }
      } else {
        // Fallback for cases with no session (should match SIGNED_OUT usually)
        if (mounted) {
          setUser(null)
          setIsLoading(false)
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchProfile, convertToAppUser])

  // ... (keep login, register, logout, etc. methods mostly same, but ensure they don't break)
  // Note: we need to update the methods to use the ref based cache and consistent logic if they rely on state.
  // But they mostly call supabase directly.

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("[Auth] Login error:", error.message)
        return { success: false, error: error.message }
      }

      // State update happens in onAuthStateChange
      return { success: true }
    } catch (error: any) {
      console.error("[Auth] Login unexpected error:", error)
      return { success: false, error: "An unexpected error occurred" }
    } finally {
      // Loading state might be handled by onAuthStateChange, but strictly safe to set here too 
      // if we want immediate feedback, though onAuthStateChange is reliable.
      // We'll leave it to onAuthStateChange to set isLoading(false) to avoid race/flicker
    }
  }

  const register = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: "admin" | "docente" | "estudiante"
  }): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            full_name: `${data.firstName} ${data.lastName}`,
            role: data.role,
          }
        }
      })

      if (error) {
        return { success: false, error: error.message }
      }

      // If auto-confirm is enabled, onAuthStateChange will catch the login
      return { success: true }
    } catch (error: any) {
      return { success: false, error: "An unexpected error occurred" }
    } finally {
      setIsLoading(false)
    }
  }

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      console.error("Reset password error:", error)
      return { success: false, error: "An unexpected error occurred" }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await supabase.auth.signOut()
      // State update handled by onAuthStateChange (SIGNED_OUT)
    } catch (error) {
      console.error("[Auth] Logout error:", error)
      setIsLoading(false) // Force stop loading if error
    }
  }

  const checkAuth = async () => {
    // Manually trigger a check if needed, though listeners usually handle it
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const profile = await fetchProfile(session.user.id)
      setUser(convertToAppUser(session.user, profile))
    }
  }

  const refreshUser = async () => {
    const { data: { user: supabaseUser } } = await supabase.auth.getUser()
    if (supabaseUser) {
      // Force refresh profile bypassing cache?
      profileCache.current.delete(supabaseUser.id)
      const profile = await fetchProfile(supabaseUser.id)
      setUser(convertToAppUser(supabaseUser, profile))
    }
  }

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    resetPassword,
    logout,
    checkAuth,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function useRequireAuth(allowedRoles?: string[]) {
  const { user, isLoading, isAuthenticated } = useAuth()

  const hasPermission = !allowedRoles || (user && allowedRoles.includes(user.role))

  return {
    user,
    isLoading,
    isAuthenticated,
    hasPermission
  }
}