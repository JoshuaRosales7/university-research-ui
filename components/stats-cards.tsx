import type React from "react"
import { FileText, Clock, CheckCircle, XCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface StatCardProps {
  title: string
  value: string | number
  description: string
  icon: React.ReactNode
  trend?: {
    value: number
    positive: boolean
  }
}

function StatCard({ title, value, description, icon }: StatCardProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <div className="rounded-lg bg-primary/10 p-3">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

export function StatsCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total de Envíos"
        value={12}
        description="Todas tus investigaciones"
        icon={<FileText className="h-5 w-5 text-primary" />}
      />
      <StatCard
        title="En Revisión"
        value={3}
        description="Pendientes de aprobación"
        icon={<Clock className="h-5 w-5 text-warning" />}
      />
      <StatCard
        title="Aprobados"
        value={8}
        description="Publicados en el repositorio"
        icon={<CheckCircle className="h-5 w-5 text-success" />}
      />
      <StatCard
        title="Rechazados"
        value={1}
        description="Requieren correcciones"
        icon={<XCircle className="h-5 w-5 text-destructive" />}
      />
    </div>
  )
}
