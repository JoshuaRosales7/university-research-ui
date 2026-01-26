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

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Dynamic Background Decorations */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />

      {/* Mobile overlay */}
      {mobileOpen && <div className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden animate-in fade-in transition-all" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar - hidden on mobile, shown on toggle */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 transform transition-all duration-500 ease-in-out md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <SidebarNav collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      </div>

      {/* Main content */}
      <div className={cn("transition-all duration-500 ease-in-out min-h-screen flex flex-col", sidebarCollapsed ? "md:ml-20" : "md:ml-64")}>
        <TopBar onMenuClick={() => setMobileOpen(!mobileOpen)} />
        <main className="flex-1 px-4 md:px-6 lg:px-10 py-6 md:py-8 lg:py-10 max-w-[1600px] mx-auto w-full relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
          {children}
        </main>
      </div>
    </div>
  )
}
