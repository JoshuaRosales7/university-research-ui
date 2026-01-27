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
    Share2,
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
    BarChart3,
    Hash,
    CheckCircle
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

            <div className="min-h-screen bg-background font-sans text-foreground">
                {/* Header */}
                <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
                            <ArrowLeft className="h-4 w-4" />
                            Volver al repositorio
                        </Link>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-bold border-primary/20 text-primary bg-primary/5">
                                Repositorio Institucional UNIS
                            </Badge>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
                    {/* Hero Section */}
                    <div className="space-y-8">
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
                            <div className="space-y-6 flex-1">
                                <div className="flex flex-wrap items-center gap-3">
                                    <Badge className="px-3 py-1 font-bold text-xs uppercase tracking-wide gap-1.5 pl-2 bg-emerald-100/50 text-emerald-700 border-emerald-200">
                                        <CheckCircle className="h-3.5 w-3.5" />
                                        Publicación Aprobada
                                    </Badge>
                                    {investigation.reviewed_at && (
                                        <Badge variant="outline" className="text-[10px] text-muted-foreground font-medium gap-1">
                                            Revisado el {new Date(investigation.reviewed_at).toLocaleDateString()}
                                        </Badge>
                                    )}
                                </div>

                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.1] max-w-4xl">
                                    {investigation.title}
                                </h1>

                                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground pt-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex -space-x-2">
                                            {authors.map((_: any, i: number) => (
                                                <div key={i} className="h-8 w-8 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-[10px] font-bold text-primary">
                                                    {authors[i]?.[0]}
                                                </div>
                                            ))}
                                        </div>
                                        <span className="font-bold text-foreground">
                                            {authors.join(', ')}
                                        </span>
                                    </div>
                                    <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        <span>{investigation.year}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons Component */}
                            <div className="shrink-0 pt-2">
                                <ActionButtons investigationId={investigation.id} fileUrl={investigation.file_url} />
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="bg-card/40 border-0 shadow-sm hover:bg-card/60 transition-colors">
                                <CardContent className="p-5 flex flex-col gap-1">
                                    <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground flex items-center gap-2">
                                        <Eye className="h-3 w-3" /> Vistas
                                    </span>
                                    <span className="text-3xl font-black text-foreground">{investigation.views_count || 0}</span>
                                </CardContent>
                            </Card>
                            <Card className="bg-card/40 border-0 shadow-sm hover:bg-card/60 transition-colors">
                                <CardContent className="p-5 flex flex-col gap-1">
                                    <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground flex items-center gap-2">
                                        <Download className="h-3 w-3" /> Descargas
                                    </span>
                                    <span className="text-3xl font-black text-foreground">{investigation.downloads_count || 0}</span>
                                </CardContent>
                            </Card>
                            <Card className="bg-card/40 border-0 shadow-sm hover:bg-card/60 transition-colors">
                                <CardContent className="p-5 flex flex-col gap-1">
                                    <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground flex items-center gap-2">
                                        <Hash className="h-3 w-3" /> Tipo
                                    </span>
                                    <span className="text-lg font-bold truncate">{investigation.work_type || "Investigación"}</span>
                                </CardContent>
                            </Card>
                            <Card className="bg-card/40 border-0 shadow-sm hover:bg-card/60 transition-colors">
                                <CardContent className="p-5 flex flex-col gap-1">
                                    <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground flex items-center gap-2">
                                        <Globe className="h-3 w-3" /> Idioma
                                    </span>
                                    <span className="text-lg font-bold truncate">{investigation.language || "Español"}</span>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div className="grid gap-10 lg:grid-cols-12">
                        {/* Main Content */}
                        <div className="lg:col-span-8 space-y-10">
                            {/* Abstract */}
                            <Card className="border-0 shadow-lg ring-1 ring-border/50 bg-card/60 backdrop-blur-md rounded-3xl overflow-hidden">
                                <div className="h-1.5 w-full bg-gradient-to-r from-primary to-primary/40" />
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-primary" /> Resumen Ejecutivo
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground leading-relaxed text-base md:text-lg bg-muted/20 p-8 rounded-2xl border-l-4 border-primary/20 text-justify">
                                        {investigation.abstract}
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Keywords */}
                            {investigation.keywords && investigation.keywords.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 ml-1">
                                        <Tag className="h-3.5 w-3.5" /> Palabras Clave
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {investigation.keywords.map((keyword: string) => (
                                            <Badge
                                                key={keyword}
                                                variant="secondary"
                                                className="px-4 py-2 text-sm font-semibold bg-background border border-border/60 hover:border-primary/40 transition-colors rounded-lg text-foreground/80"
                                            >
                                                #{keyword.toLowerCase()}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* PDF Link Card */}
                            {investigation.file_url && (
                                <Card className="border-0 shadow-xl overflow-hidden group rounded-3xl mt-8">
                                    <div className="p-8 bg-gradient-to-br from-primary/10 to-transparent flex flex-col md:flex-row items-center justify-between gap-6">
                                        <div className="flex items-center gap-6">
                                            <div className="p-4 bg-background rounded-2xl shadow-lg ring-1 ring-primary/20 group-hover:scale-110 transition-transform">
                                                <FileText className="h-10 w-10 text-primary" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-black text-xl text-foreground">Documento Completo</p>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                                                    PDF Verificado • {investigation.language || "Español"}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            size="lg"
                                            className="font-black h-14 px-10 gap-2 shadow-xl rounded-2xl"
                                            asChild
                                        >
                                            <a href={investigation.file_url} target="_blank" rel="noopener noreferrer">
                                                Leer Documento <ExternalLink className="h-5 w-5" />
                                            </a>
                                        </Button>
                                    </div>
                                </Card>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-4 space-y-8">
                            <Card className="border-0 shadow-xl ring-1 ring-border/50 bg-card rounded-3xl overflow-hidden sticky top-28">
                                <CardHeader className="border-b bg-muted/30 pb-4">
                                    <CardTitle className="text-lg font-black uppercase tracking-tight">
                                        Ficha Técnica
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-border/40">
                                        {investigation.faculty && (
                                            <MetaItem
                                                icon={<Building className="h-4 w-4" />}
                                                label="Facultad"
                                                value={investigation.faculty}
                                            />
                                        )}
                                        {investigation.career && (
                                            <MetaItem
                                                icon={<GraduationCap className="h-4 w-4" />}
                                                label="Carrera"
                                                value={investigation.career}
                                            />
                                        )}
                                        {investigation.advisor && (
                                            <MetaItem
                                                icon={<User className="h-4 w-4" />}
                                                label="Asesor"
                                                value={investigation.advisor}
                                            />
                                        )}
                                        {investigation.work_type && (
                                            <MetaItem
                                                icon={<BookOpen className="h-4 w-4" />}
                                                label="Tipo de Trabajo"
                                                value={investigation.work_type}
                                            />
                                        )}
                                        <MetaItem
                                            icon={<Calendar className="h-4 w-4" />}
                                            label="Publicado"
                                            value={new Date(investigation.created_at).toLocaleDateString('es-GT', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        />
                                        <MetaItem
                                            icon={<ShieldCheck className="h-4 w-4" />}
                                            label="Licencia"
                                            value="CC BY-NC-SA 4.0"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Citation Info */}
                            <Card className="border-0 shadow-lg ring-1 ring-border/50 bg-card/60 backdrop-blur-md rounded-3xl overflow-hidden">
                                <CardHeader className="border-b bg-muted/20 pb-4">
                                    <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                        <User className="h-4 w-4" /> Cómo Citar
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="bg-muted/30 p-4 rounded-xl text-xs font-mono leading-relaxed break-words select-all">
                                        {authors.join(', ')} ({investigation.year}). <em>{investigation.title}</em>.
                                        Repositorio Institucional UNIS.
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-2 text-center">
                                        Formato APA 7ma Edición (Generado automáticamente)
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="border-t bg-muted/10 mt-20">
                    <div className="max-w-7xl mx-auto px-6 py-12 text-center text-sm text-muted-foreground">
                        <div className="flex justify-center mb-6">
                            <Badge variant="outline" className="font-mono text-[10px] uppercase">
                                Universidad del Istmo
                            </Badge>
                        </div>
                        <p className="font-bold mb-2">
                            © {new Date().getFullYear()} Repositorio Institucional UNIS
                        </p>
                        <p className="text-xs max-w-md mx-auto leading-relaxed">
                            El contenido de este repositorio está protegido bajo la licencia Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    )
}

function MetaItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    if (!value) return null
    return (
        <div className="flex items-start gap-4 p-5 hover:bg-muted/20 transition-colors group">
            <div className="p-2.5 rounded-xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm shrink-0">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">
                    {label}
                </p>
                <p className="text-sm font-bold text-foreground leading-snug break-words">{value}</p>
            </div>
        </div>
    )
}
