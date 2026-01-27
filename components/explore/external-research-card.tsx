
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Calendar, Users, BookOpen } from "lucide-react"
import { OpenAlexResult } from "@/lib/external-apis"
import Link from "next/link"

interface ExternalResearchCardProps {
    research: OpenAlexResult
}

export function ExternalResearchCard({ research }: ExternalResearchCardProps) {
    const authors = research.authorships.map(a => a.author.display_name).join(", ")
    const maxAuthors = 3
    const displayAuthors = research.authorships.slice(0, maxAuthors).map(a => a.author.display_name).join(", ")
    const remainingAuthors = research.authorships.length - maxAuthors

    return (
        <Card className="group hover:shadow-md transition-all duration-300 border-l-4 border-l-blue-500/50">
            <CardHeader className="space-y-3 pb-3">
                <div className="flex justify-between items-start gap-4">
                    <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors">
                        Global
                    </Badge>
                    {research.publication_date && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(research.publication_date).getFullYear()}
                        </span>
                    )}
                </div>

                <CardTitle className="line-clamp-2 text-lg font-bold group-hover:text-blue-600 transition-colors">
                    {research.display_name}
                </CardTitle>

                {research.primary_location?.source?.display_name && (
                    <CardDescription className="flex items-center gap-1 text-xs">
                        <BookOpen className="h-3 w-3" />
                        {research.primary_location.source.display_name}
                    </CardDescription>
                )}
            </CardHeader>

            <CardContent className="space-y-4 pb-3">
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4 mt-0.5 shrink-0" />
                    <span className="line-clamp-1">
                        {displayAuthors}
                        {remainingAuthors > 0 && ` +${remainingAuthors} más`}
                    </span>
                </div>

                {research.concepts.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {research.concepts.slice(0, 3).map((concept) => (
                            <Badge key={concept.display_name} variant="outline" className="text-[10px] font-normal">
                                {concept.display_name}
                            </Badge>
                        ))}
                    </div>
                )}
            </CardContent>

            <CardFooter className="pt-2">
                {(research.primary_location?.landing_page_url || research.doi) && (
                    <Button asChild variant="outline" size="sm" className="w-full gap-2 hover:border-blue-500/50 hover:text-blue-600">
                        <Link
                            href={research.primary_location?.landing_page_url || research.doi || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <ExternalLink className="h-3 w-3" />
                            Ver Fuente Original
                        </Link>
                    </Button>
                )}
            </CardFooter>
        </Card>
    )
}
