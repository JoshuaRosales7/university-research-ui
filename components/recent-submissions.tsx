import Link from "next/link"
import { FileText, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { mockResearches } from "@/lib/mock-data"
import type { ResearchStatus } from "@/lib/types"

const statusConfig: Record<
  ResearchStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  borrador: { label: "Borrador", variant: "outline" },
  en_revision: { label: "En Revisión", variant: "secondary" },
  aprobado: { label: "Aprobado", variant: "default" },
  rechazado: { label: "Rechazado", variant: "destructive" },
}

export function RecentSubmissions() {
  const recentItems = mockResearches.slice(0, 5)

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Envíos Recientes</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/my-submissions" className="gap-1">
            Ver todos <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentItems.map((item) => (
          <Link
            key={item.id}
            href={`/dashboard/research/${item.id}`}
            className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="rounded-lg bg-primary/10 p-2.5 shrink-0">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-sm font-medium leading-tight line-clamp-1">{item.title}</p>
              <p className="text-xs text-muted-foreground">
                {item.faculty} • {item.year}
              </p>
            </div>
            <Badge variant={statusConfig[item.status].variant} className="shrink-0">
              {statusConfig[item.status].label}
            </Badge>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
