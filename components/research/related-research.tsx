import Link from "next/link"
import { ArrowRight, BookOpen, Calendar, User } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"

interface RelatedResearchProps {
    currentId: string
    faculty: string
    career?: string
}

export async function RelatedResearch({ currentId, faculty, career }: RelatedResearchProps) {
    // Intentar buscar por carrera primero (más específico)
    let query = supabase
        .from('investigations')
        .select('id, title, slug, authors, year, work_type, abstract')
        .eq('status', 'aprobado')
        .neq('id', currentId)
        .limit(3)

    if (career) {
        query = query.eq('career', career)
    } else if (faculty) {
        query = query.eq('faculty', faculty)
    }

    const { data: related } = await query

    if (!related || related.length === 0) return null

    return (
        <div className="space-y-6 pt-12 border-t mt-12">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black tracking-tight flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-primary" />
                    Investigaciones Relacionadas
                </h3>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {related.map((item: any) => {
                    const authors = Array.isArray(item.authors) ? item.authors : [item.authors]
                    const href = item.slug ? `/research/${item.slug}` : `/research/${item.id}`

                    return (
                        <Card key={item.id} className="group hover:shadow-xl transition-all duration-300 border-border/50 bg-card/50">
                            <CardContent className="p-5 space-y-4 h-full flex flex-col">
                                <div className="space-y-2">
                                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider">
                                        {item.work_type || "Investigación"}
                                    </Badge>
                                    <Link href={href}>
                                        <h4 className="font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                            {item.title}
                                        </h4>
                                    </Link>
                                </div>

                                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed flex-1">
                                    {item.abstract}
                                </p>

                                <div className="pt-4 flex items-center justify-between text-xs text-muted-foreground mt-auto">
                                    <div className="flex items-center gap-2">
                                        <User className="h-3.5 w-3.5" />
                                        <span className="truncate max-w-[100px]">{authors[0]}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span>{item.year}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
