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
  ShieldAlert,
  Users,
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

const commonItems = [
  { href: "/dashboard", icon: Home, label: "Inicio" },
  { href: "/dashboard/explore", icon: Search, label: "Explorar" },
]

const submissionItems = [
  { href: "/dashboard/upload", icon: Upload, label: "Subir Investigación" },
  { href: "/dashboard/my-submissions", icon: FileText, label: "Mis Envíos" },
]

const reviewerItems = [
  { href: "/dashboard/review", icon: ClipboardCheck, label: "Panel de Revisión" },
]

const adminItems = [
  { href: "/dashboard/admin/users", icon: Users, label: "Gestión de Usuarios" },
]

export function SidebarNav({ collapsed, onToggle }: SidebarNavProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  if (!user) return null

  const isAdmin = user.role === "admin"
  const isDocente = user.role === "docente"
  const isEstudiante = user.role === "estudiante"

  const allNavItems = [
    ...commonItems,
    ...(isEstudiante || isDocente || isAdmin ? submissionItems : []),
    ...(isDocente || isAdmin ? reviewerItems : []),
    ...(isAdmin ? adminItems : [])
  ]

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar text-sidebar-foreground transition-all duration-300 flex flex-col shadow-[10px_0_40px_rgba(0,0,0,0.1)]",
        collapsed ? "w-20" : "w-64",
      )}
    >
      {/* Header */}
      <div className="flex h-20 items-center justify-between border-b border-white/5 px-6">
        {collapsed ? <UniversityLogo variant="compact" /> : <UniversityLogo variant="light" />}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="text-sidebar-foreground/60 hover:text-white hover:bg-white/5 hidden md:flex"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto custom-scrollbar">
        {allNavItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-3 text-[13px] font-bold transition-all group relative overflow-hidden",
                isActive
                  ? "bg-primary text-white shadow-xl shadow-primary/20"
                  : "text-sidebar-foreground/60 hover:bg-white/5 hover:text-white",
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 shrink-0 transition-all duration-300",
                isActive ? "text-white scale-110" : "text-primary group-hover:scale-110"
              )} />
              {!collapsed && <span className="tracking-tight">{item.label}</span>}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 mt-auto border-t border-white/5">
        <div className={cn(
          "flex items-center gap-3 rounded-2xl p-2 transition-all bg-white/5 ring-1 ring-white/5",
          collapsed ? "justify-center" : "px-3"
        )}>
          <Avatar className="h-9 w-9 shrink-0 ring-2 ring-primary/20">
            <AvatarImage src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
            <AvatarFallback className="bg-primary text-white font-black text-xs">
              {user.fullName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-black text-white truncate leading-none mb-1">{user.fullName}</p>
              <p className="text-[9px] text-white/40 font-black uppercase tracking-widest">{user.role}</p>
            </div>
          )}
        </div>

        <Button
          onClick={() => logout()}
          variant="ghost"
          className={cn(
            "w-full mt-3 flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-black uppercase tracking-widest text-destructive/80 hover:bg-destructive/10 hover:text-destructive transition-all",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Salir</span>}
        </Button>
      </div>
    </aside>
  )
}
