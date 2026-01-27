// app/dashboard/research/[id]/page.tsx
"use client"

import { use, useState, useEffect } from "react"
import { notFound, useRouter } from "next/navigation"
import Link from "next/link"
import {
  Heart,
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
  Eye,
  Clock,
  CheckCircle,
  BarChart3,
  Hash
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useItem } from "@/lib/hooks"
import { useAuth } from "@/lib/auth-context"
import { CommentsSection } from "@/components/comments-section"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { CitationModal } from "@/components/research/citation-modal"

const statusConfig: any = {
  borrador: { label: "Borrador", class: "bg-muted text-muted-foreground border-0", icon: FileText },
  en_revision: { label: "En Revisión", class: "bg-amber-100/50 text-amber-700 border-amber-200", icon: Clock },
  aprobado: { label: "Aprobado", class: "bg-emerald-100/50 text-emerald-700 border-emerald-200", icon: CheckCircle },
  rechazado: { label: "Rechazado", class: "bg-red-100/50 text-red-700 border-red-200", icon: ShieldCheck },
}

export default function ResearchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params)
  const { data: research, isLoading, error } = useItem(unwrappedParams.id)
  const { user } = useAuth()
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  // Likes State
  const [likes, setLikes] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [likeLoading, setLikeLoading] = useState(false)

  // Fetch Likes
  useEffect(() => {
    async function fetchLikes() {
      if (!unwrappedParams.id) return

      try {
        const { count } = await supabase.from('research_likes').select('*', { count: 'exact', head: true }).eq('investigation_id', unwrappedParams.id);
        setLikes(count || 0);

        if (user) {
          const { data } = await supabase.from('research_likes').select('*').eq('investigation_id', unwrappedParams.id).eq('user_id', user.id).maybeSingle();
          setIsLiked(!!data);
        }
      } catch (e) {
        console.error("Error fetching likes", e)
      }
    }
    fetchLikes();
  }, [unwrappedParams.id, user]);

  const handleLike = async () => {
    if (!user) {
      alert("Debes iniciar sesión para dar me gusta");
      return;
    }
    setLikeLoading(true);
    try {
      if (isLiked) {
        await supabase.from('research_likes').delete().eq('investigation_id', unwrappedParams.id).eq('user_id', user.id);
        setLikes(prev => prev - 1);
      } else {
        await supabase.from('research_likes').insert({ investigation_id: unwrappedParams.id, user_id: user.id });
        setLikes(prev => prev + 1);

        // Send Notification
        if (research && research.owner_id !== user.id) {
          await supabase.from('notifications').insert({
            user_id: research.owner_id,
            actor_id: user.id,
            type: 'like',
            title: 'Nuevo Me Gusta',
            message: `${user.fullName || 'Un usuario'} indicó que le gusta tu investigación: ${research.title}`,
            reference_id: research.id
          });
        }
      }
      setIsLiked(!isLiked);
    } catch (e) {
      console.error("Error toggling like", e);
    } finally {
      setLikeLoading(false);
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    const title = research?.title || "Investigación en Sembri"
    const text = `Mira esta investigación interesante: ${title}`

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        })
        return
      } catch (err) {
        if ((err as any).name !== 'AbortError') {
          console.error("Error al compartir:", err)
        }
      }
    }

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
        <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Cargando investigación...</p>
      </div>
    )
  }

  if (error || !research) {
    return notFound()
  }

  const status = statusConfig[research.status] || statusConfig.en_revision
  const StatusIcon = status.icon
  const isOwner = user?.id === research.owner_id
  const canDelete = isOwner || user?.role === "admin"

  const authors = Array.isArray(research.authors) ? research.authors : [research.authors]
  const keywords = Array.isArray(research.keywords) ? research.keywords : []

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="group -ml-2 text-muted-foreground hover:text-foreground">
          <Link href="/dashboard/my-submissions" className="gap-2">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Volver al listado
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          {research.created_at && (
            <span className="text-xs font-mono text-muted-foreground">
              ID: {research.id.split('-')[0]}...
            </span>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
          <div className="space-y-6 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className={cn("px-3 py-1 font-bold text-xs uppercase tracking-wide gap-1.5 pl-2", status.class)}>
                <StatusIcon className="h-3.5 w-3.5" />
                {status.label}
              </Badge>
              {research.doi && (
                <a
                  href={`/doi/${research.doi}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100 hover:bg-blue-100 transition-colors"
                >
                  <Globe className="h-3 w-3" />
                  DOI: {research.doi}
                </a>
              )}
              {research.reviewed_at && (
                <Badge variant="outline" className="text-[10px] text-muted-foreground font-medium gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Revisado el {new Date(research.reviewed_at).toLocaleDateString()}
                </Badge>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-[1.1]">
              {research.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Link href={`/dashboard/user/${research.owner_id}`} className="flex items-center gap-2 group/author hover:opacity-80 transition-opacity">
                  <div className="flex -space-x-2">
                    {authors.map((_: any, i: number) => (
                      <div key={i} className="h-8 w-8 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-[10px] font-bold text-primary ring-2 ring-transparent group-hover/author:ring-primary/20 transition-all">
                        {authors[i]?.[0]}
                      </div>
                    ))}
                  </div>
                  <span className="font-bold text-foreground group-hover/author:text-primary transition-colors underline decoration-dotted underline-offset-4 decoration-primary/30">
                    {authors.join(", ")}
                  </span>
                </Link>
              </div>
              <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{research.year}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 shrink-0 lg:pt-2">
            {research.file_url && (
              <Button className="font-bold h-11 px-6 gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-all rounded-xl" asChild>
                <a href={research.file_url} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4" /> Descargar PDF
                </a>
              </Button>
            )}

            <Button
              onClick={handleLike}
              disabled={likeLoading}
              variant="outline"
              className={cn(
                "font-bold h-11 px-6 gap-2 rounded-xl border-2 transition-all duration-300",
                isLiked
                  ? "bg-red-50 border-red-200 text-red-500 hover:bg-red-100/50 hover:text-red-600 shadow-sm"
                  : "hover:border-red-200 hover:text-red-500 hover:bg-red-50/50 bg-background/50"
              )}
            >
              {likeLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Heart className={cn("h-5 w-5 transition-transform", isLiked && "fill-current scale-110", "bg-transparent")} />
              )}
              <span>{likes}</span>
            </Button>

            {research.status === 'aprobado' && research.slug && (
              <Button variant="outline" className="font-bold h-11 px-6 gap-2 rounded-xl border-primary/20 text-primary hover:bg-primary/5" asChild>
                <Link href={`/research/${research.slug}`} target="_blank">
                  <Globe className="h-4 w-4" /> Ver Pública
                </Link>
              </Button>
            )}
            <Button variant="outline" className="font-bold h-11 px-6 gap-2 rounded-xl bg-background/50 hover:bg-background" onClick={handleShare}>
              <Share2 className="h-4 w-4" /> Compartir
            </Button>
            <CitationModal research={research} />
            {canDelete && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-11 w-11 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Eliminar investigación</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card/40 border-0 shadow-sm">
            <CardContent className="p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground flex items-center gap-2">
                <Eye className="h-3 w-3" /> Vistas
              </span>
              <span className="text-2xl font-black">{research.views_count || 0}</span>
            </CardContent>
          </Card>
          <Card className="bg-card/40 border-0 shadow-sm">
            <CardContent className="p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground flex items-center gap-2">
                <Download className="h-3 w-3" /> Descargas
              </span>
              <span className="text-2xl font-black">{research.downloads_count || 0}</span>
            </CardContent>
          </Card>
          <Card className="bg-card/40 border-0 shadow-sm">
            <CardContent className="p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground flex items-center gap-2">
                <Hash className="h-3 w-3" /> Tipo
              </span>
              <span className="text-lg font-bold truncate">{research.work_type || "N/A"}</span>
            </CardContent>
          </Card>
          <Card className="bg-card/40 border-0 shadow-sm">
            <CardContent className="p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground flex items-center gap-2">
                <Globe className="h-3 w-3" /> Idioma
              </span>
              <span className="text-lg font-bold truncate">{research.language || "N/A"}</span>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Main Content (Abstract & File) */}
          <div className="lg:col-span-8 space-y-8">
            <Card className="border-0 shadow-lg ring-1 ring-border/50 bg-card/60 backdrop-blur-md rounded-3xl overflow-hidden">
              <div className="h-1.5 w-full bg-gradient-to-r from-primary to-primary/40" />
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" /> Resumen Ejecutivo
                </CardTitle>
                <CardDescription>
                  Descripción general del trabajo de investigación.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed text-base md:text-lg bg-muted/20 p-6 rounded-2xl border-l-4 border-primary/20 text-justify">
                  {research.abstract}
                </p>
              </CardContent>
            </Card>

            {/* Keywords */}
            {keywords.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 ml-1">
                  <Tag className="h-3.5 w-3.5" /> Palabras Clave
                </h3>
                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword: string) => (
                    <Badge key={keyword} variant="secondary" className="px-3 py-1.5 text-sm font-semibold bg-background border border-border/60 hover:border-primary/40 transition-colors rounded-lg text-foreground/80">
                      #{keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Comments Section */}
            <div className="pt-8">
              <CommentsSection investigationId={research.id} />
            </div>
          </div>

          {/* Sidebar (Metadata) */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-0 shadow-xl ring-1 ring-border/50 bg-card rounded-3xl overflow-hidden sticky top-24">
              <CardHeader className="border-b bg-muted/30 pb-4">
                <CardTitle className="text-lg font-black uppercase tracking-tight">Ficha Técnica</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/40">
                  <MetaRow icon={Building} label="Facultad" value={research.faculty} />
                  <MetaRow icon={GraduationCap} label="Carrera" value={research.career} />
                  <MetaRow icon={User} label="Asesor" value={research.advisor} />
                  <MetaRow icon={BookOpen} label="Tipo de Trabajo" value={research.work_type} />
                  <MetaRow icon={Calendar} label="Fecha de Publicación" value={new Date(research.created_at).toLocaleDateString('es-GT', { year: 'numeric', month: 'long', day: 'numeric' })} />
                  <MetaRow icon={ShieldCheck} label="Licencia" value="CC BY-NC-SA 4.0" />
                </div>

                {research.file_url && (
                  <div className="p-6 bg-muted/10">
                    <Button className="w-full font-bold h-12 rounded-xl shadow-md" asChild>
                      <a href={research.file_url} target="_blank" rel="noopener noreferrer">
                        <Eye className="h-4 w-4 mr-2" /> Leer Documento
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetaRow({ icon: Icon, label, value }: any) {
  if (!value) return null
  return (
    <div className="flex items-start gap-4 p-5 hover:bg-muted/20 transition-colors group">
      <div className="p-2.5 rounded-xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">{label}</p>
        <p className="text-sm font-bold text-foreground leading-snug break-words">{value}</p>
      </div>
    </div>
  )
}
