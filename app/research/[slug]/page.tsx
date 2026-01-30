// app/research/[slug]/page.tsx
/**
 * Página pública de investigación con metadata académica completa
 * 
 * Esta página es indexable por Google Scholar y otros motores académicos.
 * URL: /research/[slug]
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft,
    Download,
    User,
    Calendar,
    Building,
    Tag,
    FileText,
    GraduationCap,
    Globe,
    BookOpen,
    ExternalLink,
    ShieldCheck,
    Eye,
    Hash,
    CheckCircle,
    University,
    Award
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { supabase } from '@/lib/supabase'
import { generateAcademicMetadata, generateScholarlyArticleJsonLd } from '@/lib/utils/academic-metadata'
import type { Investigation } from '@/lib/utils/academic-metadata'
import { cn } from '@/lib/utils'
import { ActionButtons } from './action-buttons'
import { RelatedResearch } from '@/components/research/related-research'

// Generar metadata para SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params

    const { data: investigation } = await supabase
        .from('investigations')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'aprobado')
        .single()

    if (!investigation) {
        return {
            title: 'Investigación no encontrada',
        }
    }

    return generateAcademicMetadata(investigation as Investigation)
}

// Obtener datos de la investigación
async function getInvestigation(slug: string): Promise<Investigation | null> {
    const { data, error } = await supabase
        .from('investigations')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'aprobado')
        .single()

    if (error || !data) {
        return null
    }

    // Incrementar contador de vistas
    await supabase.rpc('increment_views', { investigation_id: data.id })

    return data as Investigation
}

export default async function PublicResearchPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const investigation = await getInvestigation(slug)

    if (!investigation) {
        notFound()
    }

    // Generar JSON-LD para structured data
    const jsonLd = generateScholarlyArticleJsonLd(investigation)

    const authors = Array.isArray(investigation.authors)
        ? investigation.authors
        : [investigation.authors]

    return (
        <>
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/20">
                {/* Header */}
                <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50 supports-[backdrop-filter]:bg-background/80">
                    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group">
                            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                            <span>Volver al repositorio</span>
                        </Link>
                        <div className="flex items-center gap-2">
                            <University className="h-5 w-5 text-primary" />
                            <span className="font-bold text-sm hidden sm:inline">Universidad del Istmo</span>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="pb-24">
                    {/* Hero Section with Gradient */}
                    <div className="relative border-b bg-muted/20 overflow-hidden">
                        <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] -z-10" />
                        <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24 space-y-8 relative z-10">

                            <div className="space-y-6 max-w-4xl">
                                <div className="flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <Badge variant="outline" className="px-3 py-1 font-bold text-xs uppercase tracking-wide gap-1.5 pl-2 bg-background/50 backdrop-blur-sm border-primary/20 text-primary">
                                        <Award className="h-3.5 w-3.5" />
                                        {investigation.work_type || "Investigación"}
                                    </Badge>
                                    <Badge variant="secondary" className="px-3 py-1 font-bold text-xs uppercase tracking-wide gap-1.5 pl-2 text-emerald-700 bg-emerald-100/50 border border-emerald-200">
                                        <CheckCircle className="h-3.5 w-3.5" />
                                        Verificado
                                    </Badge>
                                </div>

                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    {investigation.title}
                                </h1>

                                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground pt-2 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                                    <div className="flex items-center gap-3">
                                        <div className="flex pl-3">
                                            {authors.map((_: any, i: number) => (
                                                <div key={i} className="-ml-3 h-10 w-10 rounded-full bg-background border-2 border-muted flex items-center justify-center text-xs font-black text-primary shadow-sm relative z-10 first:z-0">
                                                    {authors[i]?.[0]}
                                                </div>
                                            ))}
                                        </div>
                                        <span className="font-bold text-foreground text-base">
                                            {authors.join(', ')}
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                                    <div className="flex items-center gap-2 font-medium">
                                        <Calendar className="h-4 w-4 text-primary" />
                                        <span>{investigation.year}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                                <ActionButtons investigationId={investigation.id} fileUrl={investigation.file_url} />
                            </div>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20">
                        {/* Stats Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                            <StatCard icon={<Eye className="h-4 w-4" />} label="Vistas" value={investigation.views_count || 0} />
                            <StatCard icon={<Download className="h-4 w-4" />} label="Descargas" value={investigation.downloads_count || 0} />
                            <StatCard icon={<Globe className="h-4 w-4" />} label="Idioma" value={investigation.language || "Español"} textValue />
                            <StatCard icon={<ShieldCheck className="h-4 w-4" />} label="Licencia" value="CC BY 4.0" textValue />
                        </div>

                        <div className="grid lg:grid-cols-12 gap-12">
                            {/* Main Column */}
                            <div className="lg:col-span-8 space-y-12">
                                {/* Abstract */}
                                <section>
                                    <h2 className="text-2xl font-black tracking-tight mb-6 flex items-center gap-2">
                                        <FileText className="h-6 w-6 text-primary" />
                                        Resumen
                                    </h2>
                                    <div className="text-lg leading-relaxed text-muted-foreground text-justify">
                                        {investigation.abstract}
                                    </div>
                                </section>

                                {/* Keywords */}
                                {investigation.keywords && investigation.keywords.length > 0 && (
                                    <section>
                                        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                                            <Tag className="h-4 w-4" /> Palabras Clave
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {investigation.keywords.map((keyword: string) => (
                                                <Badge
                                                    key={keyword}
                                                    variant="secondary"
                                                    className="px-4 py-2 text-sm bg-muted/50 hover:bg-muted font-medium text-foreground transition-colors rounded-lg"
                                                >
                                                    {keyword}
                                                </Badge>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Related Research (Server Component) */}
                                <RelatedResearch
                                    currentId={investigation.id}
                                    faculty={investigation.faculty || ''}
                                    career={investigation.career}
                                />
                            </div>

                            {/* Sidebar Column */}
                            <aside className="lg:col-span-4 space-y-8">
                                <div className="sticky top-24 space-y-8">
                                    <Card className="border-border/50 shadow-lg rounded-3xl overflow-hidden bg-card/50 backdrop-blur-sm">
                                        <CardHeader className="border-b bg-muted/40 pb-4">
                                            <CardTitle className="text-sm font-black uppercase tracking-widest">
                                                Información Académica
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-0 text-sm">
                                            <div className="divide-y divide-border/40">
                                                <MetaItem icon={<Building className="h-4 w-4" />} label="Facultad" value={investigation.faculty} />
                                                <MetaItem icon={<GraduationCap className="h-4 w-4" />} label="Carrera" value={investigation.career} />
                                                <MetaItem icon={<User className="h-4 w-4" />} label="Asesor" value={investigation.advisor} />
                                                <MetaItem icon={<Hash className="h-4 w-4" />} label="Referencia" value={`#${investigation.id.substring(0, 8)}`} />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-border/50 shadow-md rounded-3xl bg-primary/5 border-primary/10">
                                        <CardContent className="p-6">
                                            <h3 className="font-bold mb-2 flex items-center gap-2 text-primary">
                                                <BookOpen className="h-4 w-4" /> Cita Sugerida
                                            </h3>
                                            <div className="bg-background/80 p-3 rounded-xl text-xs font-mono border border-primary/20 leading-relaxed opacity-80 mb-3 select-all">
                                                {authors.join(', ')} ({investigation.year}). {investigation.title}. Repositorio Institucional UNIS.
                                            </div>
                                            <p className="text-[10px] text-muted-foreground text-center font-medium">
                                                Formato APA (Generado automáticamente)
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </aside>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="border-t bg-muted/20">
                    <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col items-center text-center text-sm text-muted-foreground">
                        <UniversityLogo className="mb-6 opacity-80 grayscale hover:grayscale-0 transition-all" variant='default' />
                        <p className="font-medium mb-2">
                            © {new Date().getFullYear()} Universidad del Istmo. Todos los derechos reservados.
                        </p>
                        <p className="max-w-md text-xs leading-relaxed opacity-70">
                            Promoviendo la investigación y el conocimiento abierto. "Saber para Servir".
                        </p>
                    </div>
                </footer>
            </div>
        </>
    )
}

// Subcomponents

function StatCard({ icon, label, value, textValue = false }: any) {
    if (!value && value !== 0) return null
    return (
        <Card className="border-border/50 bg-background/50 backdrop-blur shadow-sm hover:shadow-md transition-all rounded-2xl">
            <CardContent className="p-4 flex flex-col gap-1 items-center text-center justify-center h-full">
                <div className="p-2 rounded-full bg-primary/10 text-primary mb-1">
                    {icon}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-tight">
                    {label}
                </span>
                <span className={cn("font-black text-foreground", textValue ? "text-sm leading-tight line-clamp-1" : "text-2xl")}>
                    {value}
                </span>
            </CardContent>
        </Card>
    )
}

function MetaItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    if (!value) return null
    return (
        <div className="flex items-start gap-3 p-4 hover:bg-muted/30 transition-colors">
            <div className="mt-0.5 text-muted-foreground">
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 mb-0.5">
                    {label}
                </p>
                <p className="font-semibold text-foreground leading-snug">{value}</p>
            </div>
        </div>
    )
}

import { UniversityLogo } from '@/components/university-logo'
