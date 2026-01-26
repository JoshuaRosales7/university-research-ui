// app/dashboard/research/[id]/page.tsx
"use client"

import { use, useState } from "react"
import { notFound, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Download,
  Share2,
  User,
  Calendar,
  Building,
  Tag,
  FileText,
  Loader2,
  ExternalLink,
  ShieldCheck,
  GraduationCap,
  Globe,
  BookOpen,
  Trash2,
  Copy,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useItem } from "@/lib/hooks"
import { useAuth } from "@/lib/auth-context"
import { CommentsSection } from "@/components/comments-section"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

const statusConfig: any = {
  borrador: { label: "Borrador", class: "bg-muted text-muted-foreground border-0" },
  en_revision: { label: "En Revisión", class: "bg-amber-100/50 text-amber-700 border-0" },
  aprobado: { label: "Aprobado", class: "bg-emerald-100/50 text-emerald-700 border-0" },
  rechazado: { label: "Rechazado", class: "bg-red-100/50 text-red-700 border-0" },
}

export default function ResearchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params)
  const { data: research, isLoading, error } = useItem(unwrappedParams.id)
  const { user } = useAuth()
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleShare = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      alert("¡Enlace copiado al portapapeles!")
    } catch (err) {
      console.error("Error al copiar:", err)
    }
  }

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de eliminar esta investigación? Esta acción no se puede deshacer.")) return

    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('investigations')
        .delete()
        .eq('id', unwrappedParams.id)

      if (error) throw error
      router.push("/dashboard/my-submissions")
    } catch (error) {
      console.error("Error al eliminar:", error)
      alert("Error al eliminar la investigación")
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Cargando...</p>
      </div>
    )
  }

  if (error || !research) {
    return notFound()
  }

  const status = statusConfig[research.status] || statusConfig.en_revision
  const isOwner = user?.id === research.owner_id
  const canDelete = isOwner || user?.role === "admin"

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <Button variant="ghost" size="sm" asChild className="w-fit -ml-2">
        <Link href="/dashboard/my-submissions" className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
      </Button>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-4 flex-1">
            <Badge className={cn("px-4 py-1.5 font-black text-[10px] uppercase tracking-widest rounded-xl", status.class)}>
              {status.label}
            </Badge>
            <h1 className="text-4xl font-black tracking-tight text-foreground leading-tight">{research.title}</h1>

            <div className="flex flex-wrap items-center gap-6 pt-2 text-sm">
              <span className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <span className="font-bold text-foreground">{Array.isArray(research.authors) ? research.authors.join(", ") : research.authors}</span>
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="font-bold text-foreground">{research.year}</span>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            {research.file_url && (
              <Button className="font-black h-12 px-8 gap-2 shadow-lg rounded-xl" asChild>
                <a href={research.file_url} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4" /> Descargar
                </a>
              </Button>
            )}
            {research.status === 'aprobado' && research.slug && (
              <Button variant="outline" className="font-bold h-12 px-8 gap-2 rounded-xl border-emerald-500 text-emerald-700 hover:bg-emerald-50" asChild>
                <Link href={`/research/${research.slug}`} target="_blank">
                  <Globe className="h-4 w-4" /> Ver Página Pública
                </Link>
              </Button>
            )}
            <Button variant="outline" className="font-bold h-12 px-8 gap-2 rounded-xl" onClick={handleShare}>
              <Share2 className="h-4 w-4" /> Compartir
            </Button>
            {canDelete && (
              <Button
                variant="ghost"
                className="font-bold h-12 px-4 gap-2 rounded-xl text-destructive hover:bg-destructive/10"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
      </div>

      <Separator />

      <div className="grid gap-8 lg:grid-cols-3">
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
                {research.abstract}
              </p>
            </CardContent>
          </Card>

          {/* Keywords */}
          {research.keywords && research.keywords.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                <Tag className="h-4 w-4" /> Palabras Clave
              </h3>
              <div className="flex flex-wrap gap-2">
                {research.keywords.map((keyword: string) => (
                  <Badge key={keyword} variant="secondary" className="px-3 py-1.5 text-xs font-bold bg-primary/5 text-primary border-primary/10 rounded-lg">
                    #{keyword.toLowerCase()}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* PDF Link */}
          {research.file_url && (
            <Card className="border-0 shadow-xl overflow-hidden group rounded-3xl">
              <div className="p-8 bg-gradient-to-br from-primary/10 to-transparent flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-background rounded-2xl shadow-lg ring-1 ring-primary/20 group-hover:scale-110 transition-transform">
                    <FileText className="h-10 w-10 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-black text-xl text-foreground">Documento Completo</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">PDF Verificado</p>
                  </div>
                </div>
                <Button size="lg" className="font-black h-14 px-10 gap-2 shadow-xl rounded-2xl" asChild>
                  <a href={research.file_url} target="_blank">
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
              <CardTitle className="text-lg font-black uppercase tracking-tight">Metadatos</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              {research.faculty && <MetaItem icon={<Building className="h-4 w-4" />} label="Facultad" value={research.faculty} />}
              {research.career && <MetaItem icon={<GraduationCap className="h-4 w-4" />} label="Carrera" value={research.career} />}
              {research.advisor && <MetaItem icon={<User className="h-4 w-4" />} label="Asesor" value={research.advisor} />}
              {research.work_type && <MetaItem icon={<BookOpen className="h-4 w-4" />} label="Tipo" value={research.work_type} />}
              {research.language && <MetaItem icon={<Globe className="h-4 w-4" />} label="Idioma" value={research.language} />}
              <MetaItem icon={<Calendar className="h-4 w-4" />} label="Publicado" value={new Date(research.created_at).toLocaleDateString('es-GT', { year: 'numeric', month: 'long', day: 'numeric' })} />
              <MetaItem icon={<ShieldCheck className="h-4 w-4" />} label="Licencia" value="CC BY-NC-SA 4.0" />

              <div className="pt-5 border-t border-dashed">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-3">ID del Sistema</p>
                <div className="bg-muted/30 p-3 rounded-xl font-mono text-[9px] text-muted-foreground truncate">
                  {research.id}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Comments Section */}
      <div className="mt-12">
        <CommentsSection investigationId={research.id} />
      </div>
    </div>
  )
}

function MetaItem({ icon, label, value }: any) {
  return (
    <div className="flex items-start gap-3 group">
      <div className="p-2 rounded-xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-0.5">{label}</p>
        <p className="text-sm font-bold text-foreground truncate">{value}</p>
      </div>
    </div>
  )
}
