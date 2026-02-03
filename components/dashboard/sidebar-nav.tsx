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
  const isPublicador = user.role === "publicador"
  // const isUsuario = user.role === "usuario" // Not used for now

  // Logic:
  // Admin -> All menus
  // Publicador -> Submissions, Reviews
  // Usuario -> Common (Inicio, Explore) [already included] + NOTHING else

  const allNavItems = [
    ...commonItems,
    ...(isPublicador || isAdmin ? submissionItems : []),
    ...(isPublicador || isAdmin ? reviewerItems : []),
    ...(isAdmin ? adminItems : [])
  ]

  return (
    <aside
      className={cn(
        "h-full bg-sidebar text-sidebar-foreground transition-all duration-200 ease-in-out flex flex-col shadow-xl",
        // Desktop width is controlled here, Mobile width fills the container (provided by layout)
        collapsed ? "md:w-20" : "md:w-64",
        "w-full"
      )}
    >
      {/* Header */}
      < div className="flex h-16 md:h-20 items-center justify-between border-b border-white/5 px-4 md:px-6 gap-2 shrink-0" >
        <div className="flex-1 flex items-center justify-start overflow-hidden">
          {collapsed ? (
            <div className="hidden md:block">
              <UniversityLogo variant="compact" />
            </div>
          ) : (
            <UniversityLogo variant="light" />
          )}
          {/* Always show full logo on mobile since we have width */}
          <div className="md:hidden">
            <UniversityLogo variant="light" />
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="text-sidebar-foreground/60 hover:text-white hover:bg-white/5 hidden md:flex h-8 w-8 md:h-10 md:w-10 flex-shrink-0"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div >

      {/* Navigation */}
      < nav className="flex-1 space-y-1 p-3 md:p-4 overflow-y-auto overflow-x-hidden custom-scrollbar" >
        {
          allNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl md:rounded-2xl px-3 py-3 md:py-3 text-sm md:text-[13px] font-bold transition-all group relative overflow-hidden whitespace-nowrap",
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-sidebar-foreground/60 hover:bg-white/5 hover:text-white",
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5 md:h-5 md:w-5 shrink-0 transition-all duration-300",
                  isActive ? "text-white scale-110" : "text-primary group-hover:scale-110"
                )} />
                {(
                  <span className={cn(
                    "tracking-tight inline text-ellipsis overflow-hidden flex-1",
                    collapsed ? "md:hidden" : ""
                  )}>
                    {item.label}
                  </span>
                )}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full" />
                )}
              </Link>
            )
          })
        }
      </nav >

      {/* User Section */}
      < div className="p-3 md:p-4 mt-auto border-t border-white/5 gap-2 shrink-0" >
        <div className={cn(
          "flex items-center gap-3 rounded-xl md:rounded-2xl p-2 md:p-2 transition-all bg-white/5 ring-1 ring-white/5",
          collapsed ? "md:justify-center" : "md:px-3"
        )}>
          <Avatar className="h-9 w-9 md:h-9 md:w-9 shrink-0 ring-2 ring-primary/20">
            <AvatarImage src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
            <AvatarFallback className="bg-primary text-white font-black text-xs">
              {user.fullName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className={cn("flex-1 min-w-0", collapsed ? "md:hidden" : "block")}>
            <p className="text-sm md:text-[11px] font-black text-white truncate leading-tight mb-0.5">
              {user.fullName}
            </p>
            <p className="text-xs md:text-[9px] text-white/40 font-black uppercase tracking-widest truncate">
              {user.role}
            </p>
          </div>
        </div>

        <Button
          onClick={() => logout()}
          variant="ghost"
          className={cn(
            "w-full mt-3 flex items-center justify-start gap-3 rounded-xl px-3 py-2 text-xs font-black uppercase tracking-widest text-destructive/80 hover:bg-destructive/10 hover:text-destructive transition-all h-9 md:h-9",
            collapsed && "md:justify-center"
          )}
          title="Cerrar sesión"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span className={cn(collapsed ? "md:hidden" : "inline")}>Salir</span>
        </Button>
      </div >
    </aside >
  )
}
