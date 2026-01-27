"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { TopBar } from "@/components/dashboard/top-bar"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  // Don't render dashboard if not authenticated and done loading
  if (!isLoading && !isAuthenticated) {
    return null
  }

  // Show loading skeleton while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden flex">
        {/* Sidebar Skeleton */}
        <div className="hidden md:flex flex-col border-r border-border/40 bg-sidebar w-64 p-4 gap-4">
          <div className="h-10 w-32 bg-white/5 rounded-lg animate-pulse" />
          <div className="flex-1 space-y-2 mt-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 w-full bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
          <div className="h-16 w-full bg-white/5 rounded-lg animate-pulse mt-auto" />
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 flex flex-col min-h-screen">
          <div className="h-20 border-b border-border/40 bg-background/60 px-6 flex items-center justify-between">
            <div className="h-10 w-64 bg-muted/40 rounded-xl animate-pulse" />
            <div className="h-10 w-10 bg-muted/40 rounded-full animate-pulse" />
          </div>
          <div className="p-8 space-y-6">
            <div className="h-32 w-full bg-muted/20 rounded-xl animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 bg-muted/20 rounded-xl animate-pulse" />
              <div className="h-64 bg-muted/20 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Dynamic Background Decorations - Optimized with GPU acceleration */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none transform-gpu will-change-transform" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none transform-gpu will-change-transform" />

      {/* Mobile overlay */}
      {mobileOpen && <div className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden animate-in fade-in transition-all" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar - hidden on mobile, shown on toggle */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 transform-gpu will-change-transform transition-transform duration-300 ease-in-out md:translate-x-0 w-[80%] max-w-[300px] md:w-auto", // FIXED: Better width for mobile
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
        )}
      >
        <SidebarNav collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      </div>

      {/* Main content */}
      <div className={cn("transition-all duration-300 ease-in-out min-h-screen flex flex-col will-change-[margin]", sidebarCollapsed ? "md:ml-20" : "md:ml-64")}>
        <TopBar onMenuClick={() => setMobileOpen(!mobileOpen)} />
        <main className="flex-1 px-4 md:px-6 lg:px-10 py-6 md:py-8 lg:py-10 max-w-[1600px] mx-auto w-full relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {children}
        </main>
      </div>
    </div>
  )
}
