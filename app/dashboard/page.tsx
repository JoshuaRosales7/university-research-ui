"use client"

import { useAuth } from "@/lib/auth-context"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RecentSubmissions } from "@/components/dashboard/recent-submissions"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function DashboardPage() {
  const { user } = useAuth()

  if (!user) return null

  const isAdmin = user.role === "admin"
  const isDocente = user.role === "docente"
  const isEstudiante = user.role === "estudiante"

  const firstName = user.firstName || "Usuario"

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black tracking-tighter text-foreground selection:bg-primary/30">
              Bienvenido, {firstName}
            </h1>
            <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 font-black text-[10px] uppercase tracking-widest rounded-lg">
              {user.role}
            </Badge>
          </div>
          <p className="text-muted-foreground text-xl font-medium max-w-2xl leading-relaxed">
            {isAdmin ? "Panel de control centralizado para la gestión del conocimiento global de la UNIS." :
              isDocente ? "Evalúa la calidad académica y consulta los hallazgos más recientes de tu unidad." :
                "Impulsa tu formación explorando el repositorio o documentando tus nuevos hallazgos."}
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <StatsCards />

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-8">
          <RecentSubmissions />
        </div>
        <div className="lg:col-span-2 space-y-8">
          <QuickActions />

          {(isAdmin || isDocente) && (
            <div className="p-6 rounded-3xl bg-secondary/50 border border-secondary/20 shadow-inner">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Pendientes de Revisión
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Tienes artículos esperando tu validación académica.
              </p>
              <Button asChild className="w-full font-bold">
                <Link href="/dashboard/review">Ir al Panel de Revisión</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
