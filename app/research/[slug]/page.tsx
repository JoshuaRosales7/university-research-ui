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

            <div className="min-h-screen bg-background">
                {/* Header */}
                <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                    <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2 text-sm font-bold hover:text-primary transition-colors">
                            <ArrowLeft className="h-4 w-4" />
                            Volver al repositorio
                        </Link>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-bold">
                                Repositorio UNIS
                            </Badge>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-5xl mx-auto px-4 py-12 space-y-8">
                    {/* Title Section */}
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <Badge className="px-4 py-1.5 font-black text-[10px] uppercase tracking-widest rounded-xl bg-emerald-100/50 text-emerald-700 border-0">
                                Publicación Aprobada
                            </Badge>

                            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground leading-tight">
                                {investigation.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-6 pt-2 text-sm">
                                <span className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-primary" />
                                    <span className="font-bold text-foreground">
                                        {authors.join(', ')}
                                    </span>
                                </span>
                                <span className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    <span className="font-bold text-foreground">{investigation.year}</span>
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <ActionButtons investigationId={investigation.id} fileUrl={investigation.file_url} />
                    </div>

                    <Separator />

                    {/* Content Grid */}
                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Abstract */}
                            <Card className="border-0 shadow-lg ring-1 ring-border/50 bg-card/40 backdrop-blur-md rounded-3xl overflow-hidden">
                                <div className="h-2 w-full bg-primary" />
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-primary" /> Resumen
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground leading-relaxed text-base bg-muted/20 p-6 rounded-2xl border-l-4 border-primary">
                                        {investigation.abstract}
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Keywords */}
                            {investigation.keywords && investigation.keywords.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                                        <Tag className="h-4 w-4" /> Palabras Clave
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {investigation.keywords.map((keyword: string) => (
                                            <Badge
                                                key={keyword}
                                                variant="secondary"
                                                className="px-3 py-1.5 text-xs font-bold bg-primary/5 text-primary border-primary/10 rounded-lg"
                                            >
                                                #{keyword.toLowerCase()}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* PDF Link */}
                            {investigation.file_url && (
                                <Card className="border-0 shadow-xl overflow-hidden group rounded-3xl">
                                    <div className="p-8 bg-gradient-to-br from-primary/10 to-transparent flex flex-col md:flex-row items-center justify-between gap-6">
                                        <div className="flex items-center gap-6">
                                            <div className="p-4 bg-background rounded-2xl shadow-lg ring-1 ring-primary/20 group-hover:scale-110 transition-transform">
                                                <FileText className="h-10 w-10 text-primary" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-black text-xl text-foreground">Documento Completo</p>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                                                    PDF Verificado
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            size="lg"
                                            className="font-black h-14 px-10 gap-2 shadow-xl rounded-2xl"
                                            asChild
                                        >
                                            <a href={investigation.file_url} target="_blank" rel="noopener noreferrer">
                                                Abrir <ExternalLink className="h-5 w-5" />
                                            </a>
                                        </Button>
                                    </div>
                                </Card>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <Card className="border-0 shadow-lg ring-1 ring-border/50 bg-card/60 backdrop-blur-md rounded-3xl overflow-hidden">
                                <CardHeader className="border-b bg-muted/20 pb-4">
                                    <CardTitle className="text-lg font-black uppercase tracking-tight">
                                        Metadatos
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-5">
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
                                            label="Tipo"
                                            value={investigation.work_type}
                                        />
                                    )}
                                    {investigation.language && (
                                        <MetaItem
                                            icon={<Globe className="h-4 w-4" />}
                                            label="Idioma"
                                            value={investigation.language}
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
                                </CardContent>
                            </Card>

                            {/* Citation Info */}
                            <Card className="border-0 shadow-lg ring-1 ring-border/50 bg-card/60 backdrop-blur-md rounded-3xl overflow-hidden">
                                <CardHeader className="border-b bg-muted/20 pb-4">
                                    <CardTitle className="text-sm font-black uppercase tracking-tight">
                                        Cómo Citar
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="bg-muted/30 p-4 rounded-xl text-xs font-mono leading-relaxed">
                                        {authors.join(', ')} ({investigation.year}). <em>{investigation.title}</em>.
                                        Repositorio Institucional UNIS.
                                        https://repositorio.unis.edu.gt/research/{investigation.slug}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="border-t bg-muted/30 mt-20">
                    <div className="max-w-5xl mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
                        <p className="font-bold">
                            © {new Date().getFullYear()} Universidad del Istmo (UNIS) - Repositorio Institucional
                        </p>
                        <p className="text-xs mt-2">
                            Todos los documentos están bajo licencia Creative Commons BY-NC-SA 4.0
                        </p>
                    </div>
                </footer>
            </div>
        </>
    )
}

function MetaItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-start gap-3 group">
            <div className="p-2 rounded-xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-0.5">
                    {label}
                </p>
                <p className="text-sm font-bold text-foreground truncate">{value}</p>
            </div>
        </div>
    )
}
