"use client"

import { useAuth } from "@/lib/auth-context"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RecentSubmissions } from "@/components/dashboard/recent-submissions"
import { AdminAnalytics } from "@/components/dashboard/admin-analytics"
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
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 pb-2">
        <div className="space-y-2 md:space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter text-foreground selection:bg-primary/30">
              Bienvenido, {firstName}
            </h1>
            <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 font-black text-[10px] uppercase tracking-widest rounded-lg w-fit">
              {user.role}
            </Badge>
          </div>
          <p className="text-base md:text-lg text-muted-foreground font-medium max-w-2xl leading-relaxed">
            {isAdmin ? "Panel de control centralizado para la gestión del conocimiento global de la UNIS." :
              isDocente ? "Evalúa la calidad académica y consulta los hallazgos más recientes de tu unidad." :
                "Impulsa tu formación explorando el repositorio o documentando tus nuevos hallazgos."}
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <StatsCards />

      {(isAdmin || isDocente) && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">Análisis de la Plataforma</h2>
          <AdminAnalytics />
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 md:gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-6 md:space-y-8">
          <RecentSubmissions />
        </div>
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          <QuickActions />

          {(isAdmin || isDocente) && (
            <div className="p-4 md:p-6 rounded-2xl md:rounded-3xl bg-secondary/50 border border-secondary/20 shadow-inner">
              <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Pendientes de Revisión
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
                Tienes artículos esperando tu validación académica.
              </p>
              <Button asChild className="w-full font-bold text-sm md:text-base py-2 md:py-3">
                <Link href="/dashboard/review">Ir al Panel de Revisión</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
