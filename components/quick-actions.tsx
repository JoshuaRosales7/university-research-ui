import Link from "next/link"
import { Upload, Search, FileText, BookOpen } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const actions = [
  {
    icon: Upload,
    label: "Subir Investigación",
    description: "Envía un nuevo trabajo",
    href: "/dashboard/upload",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Search,
    label: "Explorar Repositorio",
    description: "Busca investigaciones",
    href: "/dashboard/explore",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: FileText,
    label: "Mis Envíos",
    description: "Ver tu historial",
    href: "/dashboard/my-submissions",
    color: "bg-success/20 text-success",
  },
  {
    icon: BookOpen,
    label: "Guía de Usuario",
    description: "Aprende a usar la plataforma",
    href: "#",
    color: "bg-warning/20 text-warning",
  },
]

export function QuickActions() {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Acciones Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {actions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className={`rounded-lg p-2.5 ${action.color}`}>
                <action.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">{action.label}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
