// app/dashboard/upload/page.tsx
"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, ChevronRight, ChevronLeft, Upload, X, FileText, AlertCircle, Loader2, ShieldCheck, Info, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"

const steps = ["Unidad", "Metadatos", "Archivo", "Finalizar"]

const FACULTIES = [
  { id: "ing", name: "Facultad de Ingeniería", enabled: true },
  { id: "econ", name: "Ciencias Económicas", enabled: false },
  { id: "der", name: "Derecho", enabled: false },
  { id: "edu", name: "Educación", enabled: false },
]

const ENGINEERING_CAREERS = [
  "Ingeniería en Sistemas y Ciencias de la Computación",
  "Ingeniería Electrónica y Redes de Información",
  "Ingeniería Civil",
  "Ingeniería Industrial",
  "Ingeniería Comercial",
  "Ingeniería Mecánica",
  "Data Science & AI",
]

const LANGUAGES = ["Español", "Inglés", "Alemán", "Italiano"]
const WORK_TYPES = ["Tesis", "Artículo Científico", "Proyecto Integrador", "Estudio de Caso", "Ensayo Académico"]

interface FormData {
  facultyId: string
  career: string
  title: string
  authors: string[]
  advisor: string
  abstract: string
  keywords: string[]
  year: string
  language: string
  workType: string
  file: File | null
}

export default function UploadPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    facultyId: "ing",
    career: "",
    title: "",
    authors: [user?.fullName || ""],
    advisor: "",
    abstract: "",
    keywords: [],
    year: new Date().getFullYear().toString(),
    language: "Español",
    workType: "Tesis",
    file: null,
  })
  const [keywordInput, setKeywordInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleNext = () => currentStep < 4 && setCurrentStep(currentStep + 1)
  const handleBack = () => currentStep > 1 && setCurrentStep(currentStep - 1)

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData({ ...formData, keywords: [...formData.keywords, keywordInput.trim()] })
      setKeywordInput("")
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file?.type === "application/pdf") {
      setFormData({ ...formData, file })
    }
  }

  const handleAddAuthor = () => {
    setFormData({ ...formData, authors: [...formData.authors, ""] })
  }

  const handleAuthorChange = (idx: number, val: string) => {
    const newAuthors = [...formData.authors]
    newAuthors[idx] = val
    setFormData({ ...formData, authors: newAuthors })
  }

  const handleSubmit = async () => {
    if (!user || !formData.file) return
    setIsSubmitting(true)
    setSubmitError("")
    setUploadProgress(20)

    try {
      // Sanitización agresiva del nombre de archivo
      const fileExt = formData.file.name.split('.').pop()?.toLowerCase() || 'pdf'
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(2, 8)

      // Nombre limpio sin caracteres especiales
      const baseName = formData.file.name
        .replace(/\.[^/.]+$/, '') // Remover extensión
        .replace(/[^a-zA-Z0-9]/g, '-') // Solo letras, números y guiones
        .replace(/-+/g, '-') // Normalizar múltiples guiones
        .substring(0, 50) // Limitar longitud

      const safeFileName = `${timestamp}-${randomId}-${baseName}.${fileExt}`
      const filePath = `${user.id}/${safeFileName}`

      // Enhanced retry logic with exponential backoff
      let uploadError: any = null
      let uploadAttempts = 0
      const maxAttempts = 3
      const baseDelay = 1000 // 1 second

      while (uploadAttempts < maxAttempts) {
        try {
          console.log(`[Upload] Attempt ${uploadAttempts + 1}/${maxAttempts}`)

          // Create a fresh file blob for each attempt to avoid stale references
          const fileBlob = new Blob([formData.file], { type: 'application/pdf' })

          const { error } = await supabase.storage
            .from('investigations')
            .upload(filePath, fileBlob, {
              cacheControl: '3600',
              upsert: false,
              contentType: 'application/pdf',
            })

          if (error) {
            uploadError = error

            // Check if it's an abort error
            const isAbortError = error.message.includes('aborted') ||
              error.message.includes('AbortError') ||
              error.name === 'AbortError'

            if (isAbortError && uploadAttempts < maxAttempts - 1) {
              uploadAttempts++
              const delay = baseDelay * Math.pow(2, uploadAttempts - 1) // Exponential backoff
              console.log(`[Upload] Reintentando en ${delay}ms (${uploadAttempts}/${maxAttempts})...`)
              await new Promise(resolve => setTimeout(resolve, delay))
              continue
            }

            // If it's not an abort error or we've exhausted retries, throw
            throw error
          }

          // Upload exitoso
          uploadError = null
          console.log('[Upload] Exitoso')
          break
        } catch (err: any) {
          uploadError = err

          const isAbortError = err.message?.includes('aborted') ||
            err.message?.includes('AbortError') ||
            err.name === 'AbortError'

          if (isAbortError && uploadAttempts < maxAttempts - 1) {
            uploadAttempts++
            const delay = baseDelay * Math.pow(2, uploadAttempts - 1)
            console.log(`[Upload] Reintentando en ${delay}ms (${uploadAttempts}/${maxAttempts})...`)
            await new Promise(resolve => setTimeout(resolve, delay))
            continue
          }

          // If we've exhausted retries or it's a different error, throw
          throw err
        }
      }

      if (uploadError) {
        console.error('[Upload Error]:', uploadError)
        throw new Error(`Error al subir archivo después de ${maxAttempts} intentos: ${uploadError.message}`)
      }

      setUploadProgress(70)
      const { data: { publicUrl } } = supabase.storage
        .from('investigations')
        .getPublicUrl(filePath)

      const investigationData = {
        owner_id: user.id,
        title: formData.title,
        abstract: formData.abstract,
        authors: formData.authors.filter(a => a.trim()),
        advisor: formData.advisor,
        keywords: formData.keywords,
        year: formData.year,
        language: formData.language,
        work_type: formData.workType,
        file_url: publicUrl,
        status: 'en_revision',
        faculty: FACULTIES.find(f => f.id === formData.facultyId)?.name,
        career: formData.career
      }

      console.log('[Submitting]:', investigationData)

      const { error: dbError, data } = await supabase.from('investigations').insert(investigationData)

      if (dbError) {
        console.error('[DB Error]:', dbError)
        throw new Error(`Error al guardar en base de datos: ${dbError.message}`)
      }

      console.log('[Success]:', data)
      setUploadProgress(100)
      setTimeout(() => router.push("/dashboard/my-submissions"), 500)
    } catch (error: any) {
      console.error('[Submit Error]:', error)

      // Filter out abort errors from user-facing messages
      const isAbortError = error?.message?.includes('aborted') ||
        error?.message?.includes('AbortError') ||
        error?.name === 'AbortError'

      if (isAbortError) {
        setSubmitError('Error de conexión. Por favor, intenta nuevamente.')
      } else {
        setSubmitError(error?.message || 'Error desconocido al enviar')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const isStepValid = (step: number) => {
    if (step === 1) return !!formData.facultyId && !!formData.career
    if (step === 2) return !!formData.title && !!formData.abstract && formData.authors.some(a => a.trim())
    if (step === 3) return !!formData.file
    return true
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-foreground">Cargar Documento</h1>
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest">Ingeniería UNIS Repository</p>
        </div>
        <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 rounded-xl font-black text-[10px] uppercase">
          Paso {currentStep} de 4
        </Badge>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {steps.map((step, idx) => (
          <div key={step} className="space-y-2">
            <div className={cn(
              "h-1.5 rounded-full transition-all duration-700",
              currentStep > idx ? "bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" : "bg-muted"
            )} />
            <p className={cn(
              "text-[9px] font-black uppercase tracking-widest text-center",
              currentStep > idx ? "text-foreground" : "text-muted-foreground/30"
            )}>{step}</p>
          </div>
        ))}
      </div>

      <Card className="border-0 shadow-2xl ring-1 ring-border/50 bg-card/40 backdrop-blur-md rounded-[2rem] overflow-hidden">
        <CardContent className="p-10">
          {currentStep === 1 && (
            <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Unidad Académica</Label>
                <div className="grid gap-3">
                  {FACULTIES.map((f) => (
                    <div
                      key={f.id}
                      onClick={() => f.enabled && setFormData({ ...formData, facultyId: f.id, career: "" })}
                      className={cn(
                        "flex items-center justify-between p-5 rounded-2xl border-2 transition-all cursor-pointer",
                        formData.facultyId === f.id ? "border-primary bg-primary/5 shadow-lg" : "border-border/40 bg-muted/10 opacity-60",
                        !f.enabled && "grayscale cursor-not-allowed opacity-30"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center font-black text-xs", formData.facultyId === f.id ? "bg-primary text-white" : "bg-muted")}>
                          {f.name[0]}
                        </div>
                        <span className="font-bold text-sm tracking-tight">{f.name}</span>
                      </div>
                      {!f.enabled ? <Lock className="h-4 w-4" /> : formData.facultyId === f.id && <Check className="h-5 w-5 text-primary" />}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Especialidad / Carrera</Label>
                <Select value={formData.career} onValueChange={(v) => setFormData({ ...formData, career: v })}>
                  <SelectTrigger className="h-16 rounded-2xl border-border/40 font-bold bg-background/50 px-6 shadow-sm">
                    <SelectValue placeholder="Selecciona tu programa..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl shadow-3xl">
                    {ENGINEERING_CAREERS.map(c => <SelectItem key={c} value={c} className="rounded-xl py-3.5 font-bold">{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4 md:col-span-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Título de la Investigación</Label>
                  <Input
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Título completo..."
                    className="h-14 rounded-2xl border-border/40 font-bold px-6 bg-background/50"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Autores</Label>
                    <button onClick={handleAddAuthor} className="text-[9px] font-black text-primary uppercase hover:underline">+ Añadir</button>
                  </div>
                  <div className="space-y-2">
                    {formData.authors.map((a, i) => (
                      <Input key={i} value={a} onChange={e => handleAuthorChange(i, e.target.value)} placeholder={`Autor ${i + 1}`} className="h-10 rounded-xl border-border/40 font-medium" />
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Asesor / Tutor</Label>
                  <Input value={formData.advisor} onChange={e => setFormData({ ...formData, advisor: e.target.value })} placeholder="Nombre del docente guía..." className="h-14 rounded-2xl border-border/40 font-bold px-6 bg-background/50" />
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Idioma</Label>
                  <Select value={formData.language} onValueChange={v => setFormData({ ...formData, language: v })}>
                    <SelectTrigger className="h-14 rounded-2xl border-border/40 font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {LANGUAGES.map(l => <SelectItem key={l} value={l} className="font-bold">{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Tipo de Documento</Label>
                  <Select value={formData.workType} onValueChange={v => setFormData({ ...formData, workType: v })}>
                    <SelectTrigger className="h-14 rounded-2xl border-border/40 font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {WORK_TYPES.map(t => <SelectItem key={t} value={t} className="font-bold">{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4 md:col-span-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Resumen (Abstract)</Label>
                  <Textarea
                    value={formData.abstract}
                    onChange={e => setFormData({ ...formData, abstract: e.target.value })}
                    className="min-h-[140px] rounded-2xl border-border/40 p-6 font-medium leading-relaxed bg-background/50"
                    placeholder="Describe los objetivos y resultados..."
                  />
                </div>

                <div className="space-y-4 md:col-span-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Palabras Clave</Label>
                  <div className="flex gap-2">
                    <Input value={keywordInput} onChange={e => setKeywordInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddKeyword()} className="h-12 rounded-xl" placeholder="IA, Sostenibilidad..." />
                    <Button onClick={handleAddKeyword} variant="secondary" className="font-black px-6 rounded-xl">Añadir</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.keywords.map(k => (
                      <Badge key={k} className="bg-primary/5 text-primary border-primary/10 rounded-lg px-3 py-1 font-bold">
                        {k} <X className="h-3 w-3 ml-2 cursor-pointer" onClick={() => setFormData({ ...formData, keywords: formData.keywords.filter(curr => curr !== k) })} />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className={cn(
                "relative border-4 border-dashed rounded-[3rem] p-24 text-center transition-all duration-700",
                formData.file ? "border-green-500 bg-green-500/5 shadow-2xl shadow-green-500/10" : "border-border/30 bg-muted/5 hover:border-primary/40"
              )}>
                {formData.file ? (
                  <div className="flex flex-col items-center gap-6">
                    <div className="h-20 w-20 rounded-3xl bg-green-500/10 flex items-center justify-center">
                      <FileText className="h-10 w-10 text-green-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-black text-xl tracking-tight">{formData.file.name}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{(formData.file.size / 1024 / 1024).toFixed(2)} MB • PDF</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setFormData({ ...formData, file: null })} className="text-red-500 font-bold uppercase text-[10px] tracking-widest">Remover Archivo</Button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="h-20 w-20 rounded-3xl bg-primary/10 mx-auto flex items-center justify-center">
                      <Upload className="h-8 w-8 text-primary opacity-50" />
                    </div>
                    <div className="space-y-2">
                      <p className="font-black text-3xl tracking-tighter">Arrastra tu PDF</p>
                      <p className="text-muted-foreground font-medium">Límite de tamaño sugerido: 25MB</p>
                    </div>
                    <Button className="font-black px-12 h-14 rounded-2xl shadow-2xl shadow-primary/20">Seleccionar Manuscrito</Button>
                    <input type="file" accept=".pdf" onChange={handleFileSelect} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-8 animate-in fade-in duration-500">
              {submitError && <Alert variant="destructive" className="rounded-2xl border-destructive/20 font-bold shadow-lg"><AlertDescription>{submitError}</AlertDescription></Alert>}

              <div className="p-10 bg-muted/20 border border-border/10 rounded-[2.5rem] space-y-8 shadow-inner overflow-hidden relative">
                <div className="absolute top-0 right-0 p-10 opacity-5">
                  <ShieldCheck className="h-40 w-40 text-primary" />
                </div>

                <div className="grid grid-cols-2 gap-x-12 gap-y-8 relative z-10">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em]">Título Certificado</p>
                    <p className="font-black text-2xl tracking-tight leading-none">{formData.title}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em]">Tipo / Año</p>
                    <p className="font-black text-xl">{formData.workType} • {formData.year}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em]">Autores</p>
                    <p className="font-bold text-sm">{formData.authors.filter(a => a.trim()).join(", ")}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em]">Asesor</p>
                    <p className="font-bold text-sm">{formData.advisor || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 bg-background/80 backdrop-blur-md p-6 rounded-[2rem] border border-border/40 shadow-2xl relative z-10 transition-all hover:translate-y-[-5px]">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <FileText className="h-7 w-7 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-black truncate">{formData.file?.name}</p>
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Listo para auditoría digital</p>
                  </div>
                  <Check className="h-8 w-8 text-emerald-500" />
                </div>
              </div>
            </div>
          )}

          <div className="mt-12 flex gap-5">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 1 || isSubmitting}
              className="h-16 flex-1 rounded-2xl font-black uppercase tracking-widest text-[11px] border border-border/30 hover:bg-muted/40 transition-all"
            >
              Regresar
            </Button>
            {currentStep < 4 ? (
              <Button
                onClick={handleNext}
                disabled={!isStepValid(currentStep)}
                className="h-16 flex-[2] rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Continuar <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="h-16 flex-[2] rounded-2xl font-black uppercase tracking-widest text-[11px] bg-emerald-600 hover:bg-emerald-700 shadow-2xl shadow-emerald-900/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-3" /> : <ShieldCheck className="h-5 w-5 mr-3" />}
                Certificar Envío
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-3 opacity-40">
        <div className="h-px w-10 bg-border" />
        <span className="text-[10px] font-black uppercase tracking-[0.5em]">UNIS Engineering Secured</span>
        <div className="h-px w-10 bg-border" />
      </div>
    </div>
  )
}
