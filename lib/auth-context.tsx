// lib/auth-context.tsx

"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { supabase } from "./supabase"
import type { AppUser, Profile } from "./types"

interface AuthContextType {
  user: AppUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (data: { email: string; password: string; firstName: string; lastName: string; role: "admin" | "docente" | "estudiante" }) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const profileCache = useState(new Map<string, Profile>())[0]

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    // Check cache first
    if (profileCache.has(userId)) {
      return profileCache.get(userId)!
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        // Only log non-abort errors
        if (error.message !== 'AbortError' && !error.message.includes('aborted')) {
          console.error("[Auth] Error fetching profile:", error.message)
        }
        return null
      }

      if (data) {
        profileCache.set(userId, data as Profile)
      }
      return data as Profile
    } catch (error: any) {
      // Ignore abort errors - they're normal during React strict mode
      if (error.name !== 'AbortError' && !error.message?.includes('aborted')) {
        console.error("[Auth] Unexpected error fetching profile:", error)
      }
      return null
    }
  }, [profileCache])

  const convertToAppUser = useCallback((supabaseUser: any, profile: Profile | null): AppUser | null => {
    if (!supabaseUser) return null

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
    // Create an AbortController for this effect lifecycle
    const abortController = new AbortController()
    let isActive = true

    const initAuth = async () => {
      if (!isActive) return

      setIsLoading(true)
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (!isActive) return // Component unmounted

        if (error) {
          // Only log non-abort errors
          if (error.message !== 'AbortError' && !error.message.includes('aborted')) {
            console.error("[Auth] Session restoration error:", error)
          }
          setUser(null)
          setIsLoading(false)
          return
        }

        if (session?.user) {
          const profile = await fetchProfile(session.user.id)
          if (!isActive) return // Component unmounted during fetch

          const appUser = convertToAppUser(session.user, profile)
          setUser(appUser)
        } else {
          setUser(null)
        }
      } catch (error: any) {
        if (!isActive) return

        // Ignore abort errors - they're normal during React strict mode
        if (error.name !== 'AbortError' && !error.message?.includes('aborted')) {
          console.error("[Auth] Session restoration error:", error)
        }
        setUser(null)
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isActive) return

      console.log("[Auth] Auth state change:", event)
      if (session?.user) {
        const profile = await fetchProfile(session.user.id)
        if (!isActive) return

        const appUser = convertToAppUser(session.user, profile)
        setUser(appUser)
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    return () => {
      isActive = false
      abortController.abort() // Clean abort on unmount
      subscription.unsubscribe()
    }
  }, [fetchProfile, convertToAppUser])

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

      const profile = await fetchProfile(data.user.id)
      const appUser = convertToAppUser(data.user, profile)
      setUser(appUser)

      return { success: true }
    } catch (error) {
      console.error("[Auth] Login unexpected error:", error)
      return { success: false, error: "An unexpected error occurred" }
    } finally {
      setIsLoading(false)
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
      console.log("[Auth] Attempting sign up for:", data.email)
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
        console.error("[Auth] Sign up error:", error.message)
        return { success: false, error: error.message }
      }

      if (authData.user) {
        console.log("[Auth] User created successfully:", authData.user.id)
        const appUser = convertToAppUser(authData.user, null)
        setUser(appUser)
      }

      return { success: true }
    } catch (error) {
      console.error("[Auth] Registration unexpected error:", error)
      return { success: false, error: "An unexpected error occurred" }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await supabase.auth.signOut()
      setUser(null)
    } catch (error) {
      console.error("[Auth] Logout error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const profile = await fetchProfile(session.user.id)
        const appUser = convertToAppUser(session.user, profile)
        setUser(appUser)
      } else {
        setUser(null)
      }
    } catch (error: any) {
      if (error.name !== 'AbortError' && !error.message?.includes('aborted')) {
        console.error("[Auth] Check auth error:", error)
      }
      setUser(null)
    }
  }

  const refreshUser = async () => {
    const { data: { user: supabaseUser } } = await supabase.auth.getUser()
    if (supabaseUser) {
      const profile = await fetchProfile(supabaseUser.id)
      const appUser = convertToAppUser(supabaseUser, profile)
      setUser(appUser)
    }
  }

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
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