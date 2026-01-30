"use client"

import Link from "next/link"
import { User, Calendar, Tag, ArrowRight, ExternalLink, BookOpen } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface PublicResearchCardProps {
    research: {
        id: string
        title: string
        slug: string
        abstract: string
        authors: string[] | string
        year: number
        faculty?: string
        keywords?: string[]
        file_url?: string
        created_at: string
    }
}

export function PublicResearchCard({ research }: PublicResearchCardProps) {
    const authors = Array.isArray(research.authors) ? research.authors : [research.authors]
    const keywords = research.keywords || []

    // Usar slug para la URL pública, fallback a ID si no hay slug (aunque debería haber)
    const href = research.slug ? `/research/${research.slug}` : `/research/${research.id}`

    return (
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                    <div className="space-y-3">
                        <Link
                            href={href}
                            className="block"
                        >
                            <h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors duration-200 line-clamp-2">
                                {research.title}
                            </h3>
                        </Link>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-muted-foreground">
                            {authors.length > 0 && (
                                <span className="flex items-center gap-1.5">
                                    <User className="h-3.5 w-3.5 text-primary" />
                                    <span className="truncate max-w-[200px]">
                                        {authors.slice(0, 2).join(", ")}
                                        {authors.length > 2 && ` +${authors.length - 2}`}
                                    </span>
                                </span>
                            )}
                            <span className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-primary" />
                                <span>{research.year}</span>
                            </span>
                            {research.faculty && (
                                <span className="flex items-center gap-1.5">
                                    <Tag className="h-3.5 w-3.5 text-primary" />
                                    <span className="truncate max-w-[150px]">{research.faculty}</span>
                                </span>
                            )}
                        </div>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                        {research.abstract}
                    </p>

                    <div className="flex items-center justify-between pt-4 mt-auto border-t border-border/50">
                        <div className="flex gap-2">
                            {keywords.slice(0, 3).map((keyword) => (
                                <Badge
                                    key={keyword}
                                    variant="secondary"
                                    className="text-[10px] font-medium"
                                >
                                    {keyword}
                                </Badge>
                            ))}
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="font-bold text-primary hover:text-primary hover:bg-primary/10 -mr-3"
                        >
                            <Link href={href}>
                                Leer más <ArrowRight className="ml-1 h-3.5 w-3.5" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
