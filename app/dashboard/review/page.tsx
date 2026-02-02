"use client"

import { useState, useEffect } from "react"
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  User,
  Calendar,
  ChevronRight,
  Loader2,
  ShieldAlert,
  Trash2,
  Download,
  SearchCheck,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { supabase, supabaseQuery } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"

export default function ReviewPanelPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [investigations, setInvestigations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedResearch, setSelectedResearch] = useState<any | null>(null)
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(null)
  const [reviewComment, setReviewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Integration States
  const [plagiarismResult, setPlagiarismResult] = useState<{ score: number, status: string, reportUrl: string } | null>(null)
  const [isCheckingPlagiarism, setIsCheckingPlagiarism] = useState(false)
  const [isRequestingFile, setIsRequestingFile] = useState(false)
  const [fileRequestSent, setFileRequestSent] = useState(false)

  const isAdmin = user?.role === "admin"
  const isDocente = user?.role === "docente"
  const canReview = isAdmin || isDocente

  useEffect(() => {
    if (canReview) {
      fetchInvestigations()
    }
  }, [canReview])

  async function fetchInvestigations() {
    setLoading(true)
    try {
      // Usamos supabaseQuery para retry automático
      const { data, error } = await supabaseQuery(() =>
        supabase
          .from('investigations')
          .select('*')
          .order('created_at', { ascending: false })
      )

      if (error) {
        toast({
          variant: "destructive",
          title: "Error al cargar",
          description: "No se pudieron cargar las investigaciones. Reintentando...",
        })
        throw error
      }
      setInvestigations(data || [])
    } catch (error) {
      console.error("Error fetching investigations:", error)
    } finally {
      setLoading(false)
    }
  }

  const pending = investigations.filter(r => r.status === 'en_revision') || []
  const approved = investigations.filter(r => r.status === 'aprobado') || []
  const rejected = investigations.filter(r => r.status === 'rechazado') || []

  const handleReviewSubmit = async () => {
    if (!selectedResearch || !reviewAction || !user) {
      console.error("Faltan datos requeridos:", { selectedResearch, reviewAction, user })
      return
    }

    setIsSubmitting(true)
    try {
      const newStatus = reviewAction === 'approve' ? 'aprobado' : 'rechazado'
      let doi = null

      if (newStatus === 'aprobado') {
        try {
          // Generate DOI automatically
          const { generateDOI } = await import('@/lib/integrations')
          doi = await generateDOI(selectedResearch.id, selectedResearch)
        } catch (e) {
          console.error("Error generating DOI", e)
          toast({
            variant: "destructive",
            title: "Advertencia",
            description: "No se pudo generar el DOI automáticamente, pero el proceso continuará.",
          })
        }
      }

      // Update status & DOI
      const updateData: any = { status: newStatus }
      if (doi) updateData.doi = doi
      if (plagiarismResult) updateData.plagiarism_score = plagiarismResult.score

      console.log('Enviando actualización:', updateData)

      const { error } = await supabase
        .from('investigations')
        .update(updateData)
        .eq('id', selectedResearch.id)

      if (error) {
        console.error("Error de Supabase:", error)
        throw new Error(error.message)
      }

      // Add feedback comment if provided
      if (reviewComment.trim() || doi) {
        let content = ""
        const authorName = Array.isArray(selectedResearch.authors)
          ? selectedResearch.authors[0] // Use first author as primary contact
          : selectedResearch.authors || "Autor";

        if (newStatus === 'aprobado') {
          const date = new Date().toLocaleDateString('es-GT', { year: 'numeric', month: 'long', day: 'numeric' })
          content = `- Revisión aprobada y DOI asignado – Unis Repo

Estimado/a ${authorName},

Nos complace informarle que su trabajo de investigación ha sido aprobado satisfactoriamente tras el proceso de revisión académica.

Detalles de la publicación:

   Estado de revisión: Aprobado
   Repositorio: Unis Repo
   DOI asignado: ${doi || "Pendiente de asignación"}
   Fecha: ${date}

Su investigación ya cuenta con un Identificador de Objeto Digital (DOI), lo que garantiza su trazabilidad, citación y reconocimiento académico a nivel internacional.

---
${reviewComment ? `Nota del Revisor: ${reviewComment}` : ''}`
        } else {
          content = `❌ Revisión Rechazada

Estimado/a ${authorName},

Lamentamos informarle que su trabajo de investigación no ha cumplido con los criterios necesarios para su aprobación en esta instancia.

**Motivo del rechazo / Retroalimentación:
${reviewComment || "No se proporcionaron detalles específicos."}

Le invitamos a realizar las correcciones indicadas y volver a enviar su trabajo para una nueva revisión.`
        }

        const { error: commentError } = await supabase.from('comments').insert({
          investigation_id: selectedResearch.id,
          user_id: user.id,
          content: content.trim(),
        })

        if (commentError) {
          console.error("Error creating comment:", commentError)
          // No interrumpimos el flujo principal por un error en comentario
        }
      }

      await fetchInvestigations()

      // Close all dialogs
      setReviewAction(null)
      setSelectedResearch(null)
      setReviewComment("")
      setPlagiarismResult(null)
      setFileRequestSent(false)

      toast({
        title: newStatus === 'aprobado' ? "Investigación Aprobada" : "Investigación Rechazada",
        description: `Se ha actualizado el estado correctamente${doi ? ' y se ha asignado DOI' : ''}.`,
      })

    } catch (error: any) {
      console.error("Error submitting review:", error)
      toast({
        variant: "destructive",
        title: "Error al actualizar",
        description: error.message || "Ocurrió un error inesperado al procesar la revisión.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta investigación? Esta acción no se puede deshacer.")) return

    try {
      const { error } = await supabase
        .from('investigations')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: "Investigación eliminada",
        description: "El registro ha sido eliminado correctamente.",
      })

      await fetchInvestigations()
    } catch (error: any) {
      console.error("Error deleting:", error)
      toast({
        variant: "destructive",
        title: "Error al eliminar",
        description: error.message || "No se pudo eliminar el registro.",
      })
    }
  }

  if (!canReview) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="bg-destructive/10 p-6 rounded-full">
          <ShieldAlert className="h-12 w-12 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold">Acceso Restringido</h1>
        <p className="text-muted-foreground max-w-md">
          Solo personal docente y administrativo puede acceder al Panel de Revisión.
        </p>
        <Button asChild variant="outline">
          <Link href="/dashboard">Volver al Inicio</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter text-foreground">Panel de Revisión</h1>
          <p className="text-muted-foreground font-medium text-lg">Valida y gestiona investigaciones académicas.</p>
        </div>
        <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/20 px-4 py-2 font-black text-xs uppercase tracking-widest rounded-xl">
          {pending.length} Pendientes
        </Badge>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="font-bold text-muted-foreground uppercase text-xs tracking-widest">Cargando...</p>
        </div>
      ) : (
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="bg-muted/50 p-1 h-12 rounded-2xl">
            <TabsTrigger value="pending" className="h-10 px-6 font-bold gap-2 rounded-xl">
              <Clock className="h-4 w-4" /> Pendientes
              <Badge className="ml-1 bg-primary/20 text-primary px-2 py-0.5 rounded-full text-[9px] font-black">
                {pending.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="approved" className="h-10 px-6 font-bold gap-2 rounded-xl">
              <CheckCircle className="h-4 w-4" /> Aprobados ({approved.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="h-10 px-6 font-bold gap-2 rounded-xl">
              <XCircle className="h-4 w-4" /> Rechazados ({rejected.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-8 space-y-4">
            {pending.length === 0 ? (
              <Card className="border-0 shadow-lg ring-1 ring-border/50 text-center py-20 bg-muted/5 rounded-3xl">
                <CheckCircle className="h-16 w-16 text-green-500/30 mx-auto mb-4" />
                <p className="text-lg font-bold">Todo al día</p>
                <p className="text-muted-foreground">No hay investigaciones pendientes de revisión.</p>
              </Card>
            ) : (
              pending.map((research) => (
                <Card
                  key={research.id}
                  className="border-0 shadow-lg ring-1 ring-border/50 hover:ring-primary/40 transition-all group rounded-3xl overflow-hidden"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="hidden sm:flex shrink-0">
                        <div className="rounded-2xl bg-amber-500/10 p-4 ring-1 ring-amber-500/20">
                          <FileText className="h-8 w-8 text-amber-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                            {research.title}
                          </h3>
                          <Badge className="bg-amber-500/10 text-amber-700 font-black text-[9px] uppercase tracking-widest rounded-lg px-3 py-1">
                            Por Revisar
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm font-medium text-muted-foreground">
                          <span className="flex items-center gap-2">
                            <User className="h-4 w-4 text-primary" />
                            {Array.isArray(research.authors) ? research.authors.join(", ") : research.authors}
                          </span>
                          <span className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            {new Date(research.created_at).toLocaleDateString('es-GT')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 italic border-l-2 pl-4 border-primary/20">
                          {research.abstract}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-dashed gap-4">
                          <div className="flex gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              className="font-bold gap-2 rounded-xl shadow-lg"
                              onClick={() => setSelectedResearch(research)}
                            >
                              <Eye className="h-4 w-4" /> Revisar
                            </Button>
                            {research.file_url && (
                              <Button variant="outline" size="sm" className="font-bold gap-2 rounded-xl" asChild>
                                <a href={research.file_url} target="_blank">
                                  <Download className="h-4 w-4" /> PDF
                                </a>
                              </Button>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 font-bold rounded-xl"
                            onClick={() => handleDelete(research.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="approved" className="mt-8 space-y-4">
            {approved.map((research) => (
              <Card key={research.id} className="border-0 shadow-md ring-1 ring-border/50 rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="p-2 rounded-lg bg-green-500/10">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm line-clamp-1">{research.title}</p>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                          {Array.isArray(research.authors) ? research.authors[0] : research.authors}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild className="font-bold rounded-xl">
                        <Link href={`/dashboard/research/${research.id}`}>Ver</Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(research.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="rejected" className="mt-8 space-y-4">
            {rejected.map((research) => (
              <Card key={research.id} className="border-0 shadow-md ring-1 ring-border/50 rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="p-2 rounded-lg bg-red-500/10">
                        <XCircle className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm line-clamp-1">{research.title}</p>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                          {Array.isArray(research.authors) ? research.authors[0] : research.authors}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild className="font-bold rounded-xl">
                        <Link href={`/dashboard/research/${research.id}`}>Ver</Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(research.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      )}

      {/* Review Dialog */}
      <Dialog open={!!selectedResearch && !reviewAction} onOpenChange={() => setSelectedResearch(null)}>
        <DialogContent className="max-w-3xl border-0 shadow-2xl p-0 overflow-hidden rounded-3xl">
          {selectedResearch && (
            <div className="flex flex-col h-full">
              <div className="bg-muted/30 p-8 border-b">
                <Badge className="mb-4 bg-primary/20 text-primary border-0 font-black uppercase tracking-widest text-[10px] rounded-lg px-3 py-1">
                  Expediente Académico
                </Badge>
                <DialogTitle className="text-2xl font-black leading-tight mb-2">{selectedResearch.title}</DialogTitle>
                <div className="flex items-center gap-4 text-muted-foreground text-sm font-medium">
                  <span className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {Array.isArray(selectedResearch.authors) ? selectedResearch.authors.join(", ") : selectedResearch.authors}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> {selectedResearch.year}
                  </span>
                </div>
              </div>
              <div className="p-8 space-y-8 overflow-y-auto max-h-[50vh]">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Resumen</h4>
                  <p className="text-muted-foreground leading-relaxed">{selectedResearch.abstract}</p>
                </div>
                {selectedResearch.file_url && (
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Documento</h4>
                    <a
                      href={selectedResearch.file_url}
                      target="_blank"
                      className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-2xl group hover:bg-primary/10 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <FileText className="h-10 w-10 text-primary" />
                        <div>
                          <p className="font-bold text-sm">Visualizar PDF</p>
                          <p className="text-[10px] uppercase text-muted-foreground">Documento Completo</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="font-bold bg-background border-primary/20 rounded-xl">
                        Abrir <ChevronRight className="h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                )}

                {/* Plagiarism Check Section */}
                <div className="space-y-3 pt-6 border-t border-dashed">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Validación Académica</h4>
                    {plagiarismResult && (
                      <Badge variant={plagiarismResult.status === 'warning' ? 'destructive' : 'outline'} className="font-bold">
                        {plagiarismResult.score}% Similitud
                      </Badge>
                    )}
                  </div>

                  {!plagiarismResult ? (
                    selectedResearch.file_url ? (
                      <Button
                        variant="secondary"
                        className="w-full h-12 rounded-2xl font-bold gap-2 bg-muted/40 hover:bg-muted/60"
                        disabled={isCheckingPlagiarism}
                        onClick={async () => {
                          setIsCheckingPlagiarism(true)
                          try {
                            const { checkPlagiarism } = await import('@/lib/integrations')
                            const result = await checkPlagiarism(selectedResearch.file_url)
                            setPlagiarismResult(result)
                          } catch (e) {
                            console.error(e)
                            alert("Error al verificar plagio")
                          } finally {
                            setIsCheckingPlagiarism(false)
                          }
                        }}
                      >
                        {isCheckingPlagiarism ? <Loader2 className="h-4 w-4 animate-spin" /> : <SearchCheck className="h-4 w-4" />}
                        Ejecutar Análisis de Plagio (Turnitin)
                      </Button>
                    ) : (
                      <Button
                        variant={fileRequestSent ? "default" : "outline"}
                        className={cn(
                          "w-full h-12 rounded-2xl font-bold gap-2 transition-all",
                          fileRequestSent ? "bg-green-600 hover:bg-green-700 border-green-600 text-white" : "border-primary/20 text-primary hover:bg-primary/5"
                        )}
                        disabled={isRequestingFile || fileRequestSent}
                        onClick={async () => {
                          if (!user) return
                          setIsRequestingFile(true)
                          try {
                            // 1. Enviar Notificación
                            await supabase.from('notifications').insert({
                              user_id: selectedResearch.owner_id,
                              actor_id: user.id,
                              type: 'system',
                              title: 'Acción Requerida: Validación Académica',
                              message: `El departamento de Validación Académica requiere el documento PDF de tu investigación "${selectedResearch.title}" para proceder con el análisis de plagio y aprobación final. Por favor, cárgalo lo antes posible.`,
                              reference_id: selectedResearch.id
                            })

                            // 2. Dejar registro en comentarios
                            await supabase.from('comments').insert({
                              investigation_id: selectedResearch.id,
                              user_id: user.id,
                              content: `⚠️ **Solicitud de Archivo (Validación Académica)**\n\nSe ha solicitado formalmente al autor que cargue el documento PDF para proceder con la revisión de Plagio y aprobación final.`
                            })

                            toast({
                              title: "Solicitud Enviada Correctamente",
                              description: "Se ha notificado al autor y se ha creado un registro en el historial de comentarios."
                            })
                            setFileRequestSent(true)
                          } catch (e) {
                            console.error(e)
                            toast({ variant: "destructive", title: "Error", description: "No se pudo enviar la solicitud." })
                          } finally {
                            setIsRequestingFile(false)
                          }
                        }}
                      >
                        {isRequestingFile ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : fileRequestSent ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                        {fileRequestSent ? "Solicitud Enviada" : "Solicitar Archivo al Autor"}
                      </Button>
                    )
                  ) : (
                    <div className="p-4 rounded-2xl bg-muted/30 border border-muted/50 space-y-3">
                      <div className="flex items-center gap-4">
                        <div className={cn("p-3 rounded-xl", plagiarismResult.status === 'warning' ? 'bg-red-500/10 text-red-600' : 'bg-green-500/10 text-green-600')}>
                          {plagiarismResult.status === 'warning' ? <ShieldAlert className="h-6 w-6" /> : <CheckCircle className="h-6 w-6" />}
                        </div>
                        <div>
                          <p className="font-bold text-sm">Análisis Completado</p>
                          <p className="text-xs text-muted-foreground">
                            Nivel de coincidencia: <span className="font-black text-foreground">{plagiarismResult.score}%</span>
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="link" asChild className="p-0 h-auto text-primary font-bold text-xs" >
                        <a href={plagiarismResult.reportUrl} target="_blank">Ver Reporte Detallado <ChevronRight className="h-3 w-3 ml-1" /></a>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter className="p-8 bg-muted/20 border-t gap-4">
                <Button
                  variant="destructive"
                  className="h-12 px-8 font-black gap-2 shadow-lg rounded-2xl"
                  onClick={() => setReviewAction('reject')}
                >
                  <XCircle className="h-5 w-5" /> Rechazar
                </Button>
                <Button
                  className="h-12 px-8 font-black gap-2 shadow-lg rounded-2xl"
                  onClick={() => setReviewAction('approve')}
                >
                  <CheckCircle className="h-5 w-5" /> Aprobar
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={!!reviewAction} onOpenChange={() => setReviewAction(null)}>
        <DialogContent className="border-0 shadow-2xl rounded-3xl p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Finalizar Revisión</DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              Al {reviewAction === 'approve' ? 'aprobar' : 'rechazar'} este trabajo, se actualizará su estado.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Label className="font-bold text-sm">Retroalimentación (Opcional)</Label>
            <Textarea
              placeholder="Escribe tus observaciones..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="min-h-[120px] rounded-2xl bg-muted/20 border-0 focus:bg-background"
              disabled={isSubmitting}
            />
          </div>
          <DialogFooter className="pt-6">
            <Button variant="ghost" className="font-bold" onClick={() => setReviewAction(null)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              variant={reviewAction === 'approve' ? 'default' : 'destructive'}
              className="font-bold h-12 px-8 rounded-2xl"
              onClick={handleReviewSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirmar {reviewAction === 'approve' ? 'Aprobación' : 'Rechazo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
