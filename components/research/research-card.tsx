// components/research/research-card.tsx
"use client"

import Link from "next/link"
import { FileText, Download, User, Calendar, Tag, ArrowRight, ExternalLink } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const statusConfig: any = {
  borrador: { label: "Borrador", variant: "outline", class: "bg-muted/50" },
  en_revision: { label: "En Revisión", variant: "secondary", class: "bg-amber-500/10 text-amber-700 border-amber-200" },
  aprobado: { label: "Aprobado", variant: "default", class: "bg-green-500/10 text-green-700 border-green-200" },
  rechazado: { label: "Rechazado", variant: "destructive", class: "bg-destructive/10 text-destructive border-destructive/20" },
}

interface ResearchCardProps {
  research: any
  showStatus?: boolean
}

export function ResearchCard({ research, showStatus = false }: ResearchCardProps) {
  const status = statusConfig[research.status] || statusConfig.en_revision

  return (
    <Card className="border-0 shadow-lg ring-1 ring-border/50 hover:ring-primary/40 transition-all group overflow-hidden bg-background">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row gap-0">
          <div className="hidden sm:flex shrink-0 w-24 bg-muted/20 items-center justify-center border-r group-hover:bg-primary/5 transition-colors">
            <div className="rounded-xl bg-background shadow-sm p-3 group-hover:scale-110 transition-transform">
              <FileText className="h-8 w-8 text-primary shadow-sm" />
            </div>
          </div>

          <div className="flex-1 min-w-0 p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <Link
                  href={`/dashboard/research/${research.id}`}
                  className="text-xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2 underline-offset-4 decoration-primary/30 hover:underline"
                >
                  {research.title}
                </Link>
                {research.collection_id && (
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mr-auto bg-muted px-2 py-0.5 rounded w-fit">
                    ID: {research.id.substring(0, 8)}
                  </p>
                )}
              </div>

              {showStatus && (
                <Badge variant={status.variant} className={`shrink-0 h-7 ${status.class} font-bold shadow-sm`}>
                  {status.label}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] font-medium text-muted-foreground">
              <span className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                {Array.isArray(research.authors) ? (
                  <>
                    {research.authors.slice(0, 2).join(", ")}
                    {research.authors.length > 2 && <span className="text-[10px] opacity-70"> +{research.authors.length - 2}</span>}
                  </>
                ) : (
                  research.authors || "Autor desconocido"
                )}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                {research.year}
              </span>
              {(research.community_id || research.faculty) && (
                <span className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" />
                  {research.faculty || "Departamento Académico"}
                </span>
              )}
            </div>

            <p className="text-sm text-muted-foreground/80 leading-relaxed line-clamp-2 border-l-2 pl-4 italic bg-muted/5 py-1">
              {research.abstract}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              {Array.isArray(research.keywords) && research.keywords.slice(0, 5).map((keyword: string) => (
                <Badge key={keyword} variant="outline" className="text-[10px] uppercase font-bold tracking-tighter bg-background hover:bg-muted transition-colors">
                  {keyword}
                </Badge>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-dashed">
              <Button variant="default" size="sm" asChild className="font-bold gap-2 shadow-md">
                <Link href={`/dashboard/research/${research.id}`}>
                  Abrir Detalles <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              {research.file_url && (
                <Button variant="outline" size="sm" asChild className="gap-2 font-bold hover:bg-primary/5 border-primary/20">
                  <a href={research.file_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" /> PDF
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
