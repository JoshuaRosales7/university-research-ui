// components/dashboard/top-bar.tsx
"use client"

import { Search, Menu, ShieldCheck, LogOut, User as UserIcon, Settings } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { NotificationBell } from "@/components/notifications/notification-bell"

interface TopBarProps {
  onMenuClick: () => void
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <header className="sticky top-0 z-30 flex h-16 md:h-20 items-center justify-between gap-2 md:gap-4 border-b border-border/40 bg-background/60 backdrop-blur-xl px-3 sm:px-4 md:px-6 lg:px-10 shadow-sm">
      <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
        <Button variant="ghost" size="icon" className="md:hidden text-foreground hover:bg-muted h-10 w-10" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search */}
        <div className="flex-1 max-w-2xl hidden md:block group">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              type="search"
              placeholder="Explorar el repositorio..."
              className="pl-12 h-11 bg-muted/50 border-border/40 focus:bg-background focus:ring-primary/20 transition-all rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/70"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Notifications */}
        <NotificationBell />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 md:gap-3 h-10 md:h-12 pl-1 md:pl-2 pr-2 md:pr-4 rounded-xl md:rounded-2xl hover:bg-muted border border-border/40 bg-muted/30 transition-all group">
              <Avatar className="h-7 md:h-8 w-7 md:w-8 ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all flex-shrink-0">
                <AvatarImage src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xs md:text-sm">
                  {user.fullName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-left hidden sm:flex">
                <span className="text-xs md:text-sm font-bold leading-none text-foreground">{user.firstName}</span>
                <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground/80">{user.role}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 md:w-64 p-2 bg-popover/95 backdrop-blur-xl border-border/40 shadow-3xl rounded-xl md:rounded-2xl">
            <DropdownMenuLabel className="p-3 md:p-4 pt-2">
              <div className="flex flex-col gap-1">
                <p className="font-extrabold text-base md:text-lg leading-tight text-foreground">{user.fullName}</p>
                <p className="text-[10px] text-muted-foreground font-mono truncate uppercase tracking-widest">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/10" />
            <DropdownMenuItem asChild className="rounded-lg md:rounded-xl p-2 md:p-3 cursor-pointer focus:bg-primary/5">
              <Link href="/dashboard/profile" className="flex items-center gap-3 font-bold text-xs md:text-sm text-foreground/80">
                <UserIcon className="h-4 w-4 text-primary" /> Mi Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-lg md:rounded-xl p-2 md:p-3 cursor-pointer focus:bg-primary/5">
              <Link href="/dashboard/my-submissions" className="flex items-center gap-3 font-bold text-xs md:text-sm text-foreground/80">
                <ShieldCheck className="h-4 w-4 text-primary" /> Mis Envíos
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg md:rounded-xl p-2 md:p-3 cursor-pointer focus:bg-primary/5">
              <div className="flex items-center gap-3 font-bold text-xs md:text-sm text-foreground/80">
                <Settings className="h-4 w-4 text-primary" /> Preferencias
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/10" />
            <DropdownMenuItem
              onClick={() => logout()}
              className="rounded-lg md:rounded-xl p-2 md:p-3 cursor-pointer text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
            >
              <div className="flex items-center gap-3 font-bold text-xs md:text-sm">
                <LogOut className="h-4 w-4" /> Cerrar Sesión
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
