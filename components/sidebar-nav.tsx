"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Upload,
  FileText,
  Search,
  ClipboardCheck,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UniversityLogo } from "@/components/university-logo"
import { useAuth } from "@/lib/auth-context"

interface SidebarNavProps {
  collapsed: boolean
  onToggle: () => void
}

const navItems = [
  { href: "/dashboard", icon: Home, label: "Inicio" },
  { href: "/dashboard/explore", icon: Search, label: "Explorar" },
]

const publisherItems = [
  { href: "/dashboard/upload", icon: Upload, label: "Subir Investigación" },
  { href: "/dashboard/my-submissions", icon: FileText, label: "Mis Envíos" },
]

const reviewItems = [{ href: "/dashboard/review", icon: ClipboardCheck, label: "Panel de Revisión" }]

const adminItems = [{ href: "/dashboard/admin", icon: Settings, label: "Administración" }]

export function SidebarNav({ collapsed, onToggle }: SidebarNavProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  // Roles
  const isAdmin = user?.role === "admin"
  const isPublicador = user?.role === "publicador" || isAdmin
  const isUsuario = user?.role === "usuario"

  // Merge items
  const allNavItems = [
    ...navItems,
    ...(isPublicador ? publisherItems : []),
    ...(isPublicador ? reviewItems : []),
    ...(isAdmin ? adminItems : [])
  ]

  // Debug logs
  console.log("SidebarNav - User:", user)
  console.log("SidebarNav - Role:", user?.role)
  console.log("SidebarNav - isPublicador:", isPublicador)

  const handleLogout = async () => {
    await logout()
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar text-sidebar-foreground transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        {collapsed ? <UniversityLogo variant="compact" /> : <UniversityLogo variant="light" />}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="text-sidebar-foreground hover:bg-sidebar-accent hidden md:flex"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        {allNavItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-sidebar-border p-3">
        <Link
          href="/dashboard/profile"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-sidebar-accent",
            pathname === "/dashboard/profile" && "bg-sidebar-accent",
          )}
        >
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src="/diverse-avatars.png" />
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
              {user?.fullName
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2) || "U"}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-sidebar-foreground">{user?.fullName || "Usuario"}</p>
              <p className="text-xs text-sidebar-foreground/60 capitalize">
                {user?.role || "usuario"}
                <span className="text-[10px] text-red-500 ml-2 font-bold bg-white/10 px-1 rounded">
                  D: {user?.role}
                </span>
              </p>
            </div>
          )}
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground mt-1"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  )
}
