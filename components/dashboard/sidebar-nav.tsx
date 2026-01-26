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
        "fixed left-0 top-0 z-40 h-screen bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out flex flex-col shadow-[10px_0_40px_rgba(0,0,0,0.1)]",
        collapsed ? "w-16 sm:w-20 md:w-20" : "w-56 sm:w-64 md:w-64",
      )}
    >
      {/* Header */}
      <div className="flex h-14 sm:h-16 md:h-20 items-center justify-between border-b border-white/5 px-3 sm:px-4 md:px-6 gap-2">
        <div className="flex-1 flex items-center justify-center md:justify-start">
          {collapsed ? <UniversityLogo variant="compact" /> : <UniversityLogo variant="light" />}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="text-sidebar-foreground/60 hover:text-white hover:bg-white/5 hidden md:flex h-8 w-8 md:h-10 md:w-10 flex-shrink-0"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 sm:space-y-1 p-2 sm:p-3 md:p-4 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {allNavItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 sm:gap-3 rounded-lg sm:rounded-xl md:rounded-2xl px-2 sm:px-3 md:px-3 py-1.5 sm:py-2 md:py-3 text-[11px] sm:text-[12px] md:text-[13px] font-bold transition-all group relative overflow-hidden whitespace-nowrap",
                isActive
                  ? "bg-primary text-white shadow-lg sm:shadow-xl shadow-primary/20"
                  : "text-sidebar-foreground/60 hover:bg-white/5 hover:text-white",
              )}
            >
              <item.icon className={cn(
                "h-4 sm:h-4 md:h-5 w-4 sm:w-4 md:w-5 shrink-0 transition-all duration-300",
                isActive ? "text-white scale-110" : "text-primary group-hover:scale-110"
              )} />
              {!collapsed && (
                <span className="tracking-tight inline text-ellipsis overflow-hidden flex-1">
                  {item.label}
                </span>
              )}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="p-2 sm:p-3 md:p-4 mt-auto border-t border-white/5 gap-2">
        <div className={cn(
          "flex items-center gap-1.5 sm:gap-2 md:gap-3 rounded-lg sm:rounded-xl md:rounded-2xl p-1.5 sm:p-2 transition-all bg-white/5 ring-1 ring-white/5",
          collapsed ? "justify-center" : "px-2 sm:px-2 md:px-3"
        )}>
          <Avatar className="h-7 sm:h-8 md:h-9 w-7 sm:w-8 md:w-9 shrink-0 ring-2 ring-primary/20">
            <AvatarImage src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
            <AvatarFallback className="bg-primary text-white font-black text-[8px] sm:text-[9px] md:text-xs">
              {user.fullName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0 hidden sm:block">
              <p className="text-[9px] sm:text-[10px] md:text-[11px] font-black text-white truncate leading-tight mb-0.5">
                {user.fullName}
              </p>
              <p className="text-[7px] sm:text-[8px] md:text-[9px] text-white/40 font-black uppercase tracking-widest truncate">
                {user.role}
              </p>
            </div>
          )}
        </div>

        <Button
          onClick={() => logout()}
          variant="ghost"
          className={cn(
            "w-full mt-1.5 sm:mt-2 md:mt-3 flex items-center justify-center md:justify-start gap-1.5 sm:gap-2 md:gap-3 rounded-lg sm:rounded-lg md:rounded-xl px-2 sm:px-2 md:px-3 py-1 sm:py-1.5 md:py-2 text-[9px] sm:text-[10px] md:text-xs font-black uppercase tracking-widest text-destructive/80 hover:bg-destructive/10 hover:text-destructive transition-all h-7 sm:h-8 md:h-9",
            collapsed && "justify-center"
          )}
          title="Cerrar sesión"
        >
          <LogOut className="h-3 sm:h-3.5 md:h-4 w-3 sm:w-3.5 md:w-4 shrink-0" />
          {!collapsed && <span className="inline hidden sm:inline">Salir</span>}
        </Button>
      </div>
    </aside>
  )
}
