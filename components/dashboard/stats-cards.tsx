// components/dashboard/stats-cards.tsx
"use client"

import type React from "react"
import { FileText, Clock, CheckCircle, XCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useMyWorkspaceItems, useGlobalInvestigations } from "@/lib/hooks"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ElementType
  colorClass: string
}

function StatCard({ title, value, icon: Icon, colorClass }: StatCardProps) {
  return (
    <Card className="border-0 shadow-sm bg-card/40 backdrop-blur-md ring-1 ring-border/50 hover:shadow-md transition-all hover:ring-border">
      <CardContent className="p-4 md:p-5 flex items-center justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
          <p className="text-2xl md:text-3xl font-black text-foreground truncate">{value}</p>
        </div>
        <div className={cn("h-10 md:h-12 w-10 md:w-12 rounded-lg md:rounded-xl flex items-center justify-center shadow-inner flex-shrink-0", colorClass)}>
          <Icon className="h-5 md:h-6 w-5 md:w-6" />
        </div>
      </CardContent>
    </Card>
  )
}

export function StatsCards() {
  const { user } = useAuth()

  // Conditionally fetch data based on role
  // Students only see their own workspace items stats
  // Admins/Docentes see global stats (or should they?)
  // Actually, usually dashboard stats are personal for students, and global for admins.

  const isAdminOrDocente = user?.role === "admin" || user?.role === "docente"

  const { data: myItems } = useMyWorkspaceItems(user?.id)
  const { data: globalItems } = useGlobalInvestigations(isAdminOrDocente ? user?.role : undefined)

  // Decide which dataset to show
  const items = isAdminOrDocente ? (globalItems || []) : (myItems || [])

  // Safely calculate counts
  const total = items?.length || 0
  const pending = items?.filter(i => i.status === 'en_revision' || i.status === 'pending').length || 0
  const approved = items?.filter(i => i.status === 'aprobado').length || 0
  const rejected = items?.filter(i => i.status === 'rechazado').length || 0

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
      <StatCard
        title={isAdminOrDocente ? "Total Global" : "Mis Envíos"}
        value={total}
        icon={FileText}
        colorClass="bg-primary/10 text-primary"
      />
      <StatCard
        title="Pendientes"
        value={pending}
        icon={Clock}
        colorClass="bg-amber-500/10 text-amber-600"
      />
      <StatCard
        title="Aprobados"
        value={approved}
        icon={CheckCircle}
        colorClass="bg-emerald-500/10 text-emerald-600"
      />
      <StatCard
        title="Rechazados"
        value={rejected}
        icon={XCircle}
        colorClass="bg-destructive/10 text-destructive"
      />
    </div>
  )
}
