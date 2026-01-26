import Link from "next/link"
import { FileText, Download, User, Calendar, Tag } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Research, ResearchStatus } from "@/lib/types"

const statusConfig: Record<
  ResearchStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  borrador: { label: "Borrador", variant: "outline" },
  en_revision: { label: "En Revisión", variant: "secondary" },
  aprobado: { label: "Aprobado", variant: "default" },
  rechazado: { label: "Rechazado", variant: "destructive" },
}

interface ResearchCardProps {
  research: Research
  showStatus?: boolean
}

export function ResearchCard({ research, showStatus = false }: ResearchCardProps) {
  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex gap-4">
          <div className="hidden sm:flex shrink-0">
            <div className="rounded-lg bg-primary/10 p-3">
              <FileText className="h-6 w-6 text-primary" />
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <Link
                href={`/dashboard/research/${research.id}`}
                className="text-lg font-semibold leading-tight hover:text-primary transition-colors line-clamp-2"
              >
                {research.title}
              </Link>
              {showStatus && (
                <Badge variant={statusConfig[research.status].variant} className="shrink-0">
                  {statusConfig[research.status].label}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                {research.authors.slice(0, 2).join(", ")}
                {research.authors.length > 2 && ` +${research.authors.length - 2}`}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {research.year}
              </span>
              <span className="flex items-center gap-1">
                <Tag className="h-3.5 w-3.5" />
                {research.faculty}
              </span>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2">{research.abstract}</p>

            <div className="flex flex-wrap items-center gap-2">
              {research.keywords.slice(0, 4).map((keyword) => (
                <Badge key={keyword} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
              {research.keywords.length > 4 && (
                <span className="text-xs text-muted-foreground">+{research.keywords.length - 4} más</span>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/research/${research.id}`}>Ver detalles</Link>
              </Button>
              {research.status === "aprobado" && (
                <Button variant="ghost" size="sm" className="gap-1">
                  <Download className="h-4 w-4" />
                  Descargar PDF
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
