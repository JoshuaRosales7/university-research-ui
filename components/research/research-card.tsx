// components/research/research-card.tsx
"use client"

import Link from "next/link"
import { FileText, Download, User, Calendar, Tag, ArrowRight, ExternalLink, BookOpen } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const statusConfig: any = {
  borrador: { label: "Borrador", variant: "outline", class: "bg-muted/50 text-muted-foreground border-muted/50" },
  en_revision: { label: "En Revisión", variant: "secondary", class: "bg-amber-500/20 text-amber-700 border-amber-300/50" },
  aprobado: { label: "Aprobado", variant: "default", class: "bg-emerald-500/20 text-emerald-700 border-emerald-300/50" },
  rechazado: { label: "Rechazado", variant: "destructive", class: "bg-red-500/20 text-red-700 border-red-300/50" },
}

interface ResearchCardProps {
  research: any
  showStatus?: boolean
}

export function ResearchCard({ research, showStatus = false }: ResearchCardProps) {
  const status = statusConfig[research.status] || statusConfig.en_revision

  return (
    <Card className="border-0 shadow-xl ring-1 ring-primary/10 hover:ring-primary/40 hover:shadow-2xl transition-all duration-300 group overflow-hidden bg-gradient-to-br from-card/80 via-card/60 to-background/40 backdrop-blur-sm rounded-2xl">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row gap-0">
          {/* Icon Section */}
          <div className="hidden sm:flex shrink-0 w-28 bg-gradient-to-b from-primary/10 to-primary/5 items-center justify-center border-r border-primary/10 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300">
            <div className="rounded-2xl bg-background shadow-lg p-4 group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300 border border-primary/20">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 min-w-0 p-6 sm:p-7 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <Link
                  href={`/dashboard/research/${research.id}`}
                  className="text-lg sm:text-xl font-black leading-tight group-hover:text-primary transition-colors duration-200 line-clamp-2 underline-offset-4 decoration-primary/30 hover:underline"
                >
                  {research.title}
                </Link>
                {research.collection_id && (
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 bg-primary/5 px-3 py-1 rounded-lg w-fit border border-primary/10">
                    Ref: {research.id.substring(0, 8)}
                  </p>
                )}
              </div>

              {showStatus && (
                <Badge variant={status.variant} className={`shrink-0 h-8 px-3 font-bold shadow-md border ${status.class}`}>
                  {status.label}
                </Badge>
              )}
            </div>

            {/* Metadata Row */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold text-muted-foreground/80">
              {Array.isArray(research.authors) && research.authors.length > 0 && (
                <span className="flex items-center gap-2 hover:text-primary transition-colors duration-200">
                  <User className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="truncate text-xs">
                    {research.authors.slice(0, 2).join(", ")}
                    {research.authors.length > 2 && <span className="text-[10px]"> +{research.authors.length - 2}</span>}
                  </span>
                </span>
              )}
              <span className="flex items-center gap-2 hover:text-primary transition-colors duration-200">
                <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-xs font-bold">{research.year}</span>
              </span>
              {(research.faculty) && (
                <span className="flex items-center gap-2 hover:text-primary transition-colors duration-200">
                  <Tag className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-xs font-bold truncate">{research.faculty}</span>
                </span>
              )}
            </div>

            {/* Abstract */}
            <p className="text-sm text-muted-foreground/80 leading-relaxed line-clamp-2 border-l-3 border-primary/30 pl-4 py-2 bg-primary/5 rounded-r-lg">
              {research.abstract}
            </p>

            {/* Keywords */}
            {Array.isArray(research.keywords) && research.keywords.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {research.keywords.slice(0, 4).map((keyword: string) => (
                  <Badge 
                    key={keyword} 
                    variant="outline" 
                    className="text-[10px] uppercase font-bold tracking-tighter bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary transition-colors duration-200"
                  >
                    {keyword}
                  </Badge>
                ))}
                {research.keywords.length > 4 && (
                  <Badge 
                    variant="outline" 
                    className="text-[10px] uppercase font-bold tracking-tighter bg-muted/50 border-muted/50 text-muted-foreground"
                  >
                    +{research.keywords.length - 4}
                  </Badge>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-5 border-t border-primary/10">
              <Button 
                variant="default" 
                size="sm" 
                asChild 
                className="font-bold gap-2 shadow-lg hover:shadow-2xl transition-all duration-200 rounded-lg group-hover:bg-primary group-hover:text-white"
              >
                <Link href={`/dashboard/research/${research.id}`}>
                  Ver Detalles <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              {research.file_url && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  asChild 
                  className="gap-2 font-bold hover:bg-primary/10 border-primary/30 text-primary hover:text-primary rounded-lg transition-all duration-200"
                >
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
