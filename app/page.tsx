'use client'

import Link from "next/link"
import { Search, BookOpen, GraduationCap, Users, ArrowRight, Building2, Shield, Zap, Globe, Award, TrendingUp, FileText, Download, Eye, Star, Sparkles, CheckCircle2, Lock, Unlock, Database, BarChart3, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UniversityLogo } from "@/components/university-logo"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

// Modal Component
function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background border rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
        <div className="sticky top-0 bg-background/95 backdrop-blur-xl border-b px-6 py-4 flex items-center justify-between">
          <h3 className="text-2xl font-black">{title}</h3>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

// Stats Card Component
function StatCard({ icon: Icon, value, label, description, color, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/50 p-6 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 text-left w-full"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-opacity`} />
      <div className="relative">
        <div className={`h-12 w-12 rounded-xl ${color} bg-opacity-10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <h4 className="text-3xl font-black text-foreground mb-1">{value}</h4>
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground/70 mt-2 line-clamp-2">{description}</p>
        )}
      </div>
    </button>
  )
}

// Feature Card Component
function FeatureCard({ icon: Icon, title, description, color, gradient }: any) {
  return (
    <div className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2`}>
      <div className="absolute inset-0 bg-grid-white/[0.05] -z-0" />
      <div className={`h-16 w-16 rounded-2xl ${color} bg-opacity-20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
        <Icon className={`h-8 w-8 ${color}`} />
      </div>
      <h3 className="text-2xl font-black mb-3 text-white">{title}</h3>
      <p className="text-white/80 leading-relaxed">{description}</p>
    </div>
  )
}

// Area Card Component  
function AreaCard({ label, icon: Icon, color, bg, description, stats }: any) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="group relative overflow-hidden rounded-3xl bg-card border border-border/50 p-6 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-2 text-left w-full"
      >
        <div className={`absolute top-0 right-0 w-32 h-32 ${bg} opacity-20 rounded-full blur-3xl group-hover:opacity-40 transition-opacity`} />
        <div className="relative">
          <div className={`h-14 w-14 rounded-2xl ${bg} ${color} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
            <Icon className="h-7 w-7" />
          </div>
          <h3 className="font-black text-xl mb-2">{label}</h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{description}</p>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className={`${color}`}>Ver más</span>
            <ArrowRight className={`h-3 w-3 ${color} group-hover:translate-x-1 transition-transform`} />
          </div>
        </div>
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={label}>
        <div className="space-y-6">
          <div className={`h-20 w-20 rounded-3xl ${bg} ${color} flex items-center justify-center`}>
            <Icon className="h-10 w-10" />
          </div>

          <div>
            <h4 className="font-bold text-lg mb-2">Descripción</h4>
            <p className="text-muted-foreground leading-relaxed">{description}</p>
          </div>

          {stats && (
            <div>
              <h4 className="font-bold text-lg mb-3">Estadísticas</h4>
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat: any, i: number) => (
                  <div key={i} className="bg-muted/50 rounded-xl p-4">
                    <div className="text-2xl font-black mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button asChild className="w-full" size="lg">
            <Link href={`/dashboard/explore?faculty=${encodeURIComponent(label)}`}>
              Explorar {label}
            </Link>
          </Button>
        </div>
      </Modal>
    </>
  )
}

export default function LandingPage() {
  const [investigations, setInvestigations] = useState<any[]>([])
  const [stats, setStats] = useState({ documents: 0, authors: 0, faculties: 0 })
  const [facultyStats, setFacultyStats] = useState<any[]>([])
  const [modalContent, setModalContent] = useState<{ isOpen: boolean; title: string; content: React.ReactNode }>({
    isOpen: false,
    title: '',
    content: null
  })

  useEffect(() => {
    async function fetchData() {
      // Fetch investigations
      const { data: invData } = await supabase
        .from('investigations')
        .select('*')
        .eq('status', 'aprobado')
        .not('slug', 'is', null)
        .order('created_at', { ascending: false })
        .limit(6)

      setInvestigations(invData || [])

      // Fetch all approved investigations for stats
      const { data: allInvestigations } = await supabase
        .from('investigations')
        .select('faculty,user_id,career')
        .eq('status', 'aprobado')

      // Fetch stats
      const [docsRes, authorsRes] = await Promise.all([
        supabase.from('investigations').select('*', { count: 'exact', head: true }).eq('status', 'aprobado'),
        supabase.from('profiles').select('*', { count: 'exact', head: true })
      ])

      // Calculate faculty statistics
      const facultyMap = new Map<string, { count: number; authors: Set<string>; careers: Set<string> }>()

      allInvestigations?.forEach((inv) => {
        const faculty = inv.faculty || 'Sin clasificar'
        if (!facultyMap.has(faculty)) {
          facultyMap.set(faculty, { count: 0, authors: new Set(), careers: new Set() })
        }
        const stats = facultyMap.get(faculty)!
        stats.count++
        if (inv.user_id) stats.authors.add(inv.user_id)
        if (inv.career) stats.careers.add(inv.career)
      })

      const facultyStatsArray = Array.from(facultyMap.entries()).map(([name, data]) => ({
        name,
        count: data.count,
        authors: data.authors.size,
        careers: data.careers.size
      })).sort((a, b) => b.count - a.count)

      setFacultyStats(facultyStatsArray)

      const uniqueFaculties = facultyMap.size

      setStats({
        documents: docsRes.count || 0,
        authors: authorsRes.count || 0,
        faculties: uniqueFaculties || 0
      })
    }

    fetchData()
  }, [])

  const openModal = (title: string, content: React.ReactNode) => {
    setModalContent({ isOpen: true, title, content })
  }

  const closeModal = () => {
    setModalContent({ isOpen: false, title: '', content: null })
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary/20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
            <UniversityLogo />
          </Link>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="hidden md:flex font-medium">
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
            <Button size="sm" asChild className="rounded-full px-6 font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
              <Link href="/register">Registrarse</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32 md:pt-32 md:pb-48">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] -z-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background -z-10" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse -z-10" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000 -z-10" />

          <div className="container mx-auto px-4 text-center space-y-8 relative z-10">
            <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-semibold bg-secondary/50 backdrop-blur-sm mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500 hover:bg-secondary/70 transition-colors">
              <Sparkles className="h-4 w-4 mr-2 text-primary" />
              Repositorio Institucional Oficial
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-foreground max-w-4xl mx-auto leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-700">
              Descubre el conocimiento <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-600 to-purple-600 animate-gradient">
                que transforma el futuro
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
              Accede a tesis, artículos científicos y proyectos de investigación de la <span className="font-bold text-foreground">Universidad del Istmo</span>.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mt-10 p-2 bg-background/50 backdrop-blur-md rounded-2xl border shadow-2xl shadow-primary/10 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-200 hover:shadow-primary/20 transition-shadow">
              <form action="/dashboard/explore" method="GET" className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    name="q"
                    placeholder="Buscar investigaciones, autores, palabras clave..."
                    className="pl-12 h-14 bg-transparent border-transparent focus-visible:ring-2 focus-visible:ring-primary text-base"
                  />
                </div>
                <Button size="lg" type="submit" className="h-14 px-8 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all">
                  <Search className="h-5 w-5 mr-2" />
                  Buscar
                </Button>
              </form>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto mt-16 pt-16 border-t border-border/40 animate-in fade-in zoom-in duration-1000 delay-300">
              <StatCard
                icon={FileText}
                value={`${stats.documents}+`}
                label="Documentos"
                description="Investigaciones aprobadas y publicadas"
                color="text-blue-500"
                onClick={() => openModal('Documentos Académicos', (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-2xl p-6 border border-blue-500/20">
                      <FileText className="h-12 w-12 text-blue-500 mb-4" />
                      <h4 className="font-bold text-2xl mb-2">{stats.documents}+ Documentos</h4>
                      <p className="text-muted-foreground">Nuestra colección incluye tesis de grado, artículos científicos, proyectos de investigación y publicaciones académicas de alta calidad.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/50 rounded-xl p-4">
                        <CheckCircle2 className="h-6 w-6 text-green-500 mb-2" />
                        <div className="font-bold">Revisión por pares</div>
                        <div className="text-sm text-muted-foreground">Todos los documentos son validados</div>
                      </div>
                      <div className="bg-muted/50 rounded-xl p-4">
                        <Download className="h-6 w-6 text-blue-500 mb-2" />
                        <div className="font-bold">Descarga gratuita</div>
                        <div className="text-sm text-muted-foreground">Acceso abierto 100%</div>
                      </div>
                    </div>
                  </div>
                ))}
              />

              <StatCard
                icon={Users}
                value={`${stats.authors}+`}
                label="Autores"
                description="Investigadores registrados en la plataforma"
                color="text-amber-500"
                onClick={() => openModal('Comunidad de Investigadores', (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 rounded-2xl p-6 border border-amber-500/20">
                      <Users className="h-12 w-12 text-amber-500 mb-4" />
                      <h4 className="font-bold text-2xl mb-2">{stats.authors}+ Investigadores</h4>
                      <p className="text-muted-foreground">Una comunidad activa de estudiantes, profesores y académicos comprometidos con la generación de conocimiento.</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 bg-muted/50 rounded-xl p-4">
                        <GraduationCap className="h-8 w-8 text-amber-500" />
                        <div>
                          <div className="font-bold">Estudiantes</div>
                          <div className="text-sm text-muted-foreground">Tesistas y colaboradores</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-muted/50 rounded-xl p-4">
                        <Award className="h-8 w-8 text-amber-500" />
                        <div>
                          <div className="font-bold">Profesores</div>
                          <div className="text-sm text-muted-foreground">Asesores y directores</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              />

              <StatCard
                icon={Building2}
                value={stats.faculties}
                label="Facultades"
                description="Áreas de conocimiento representadas"
                color="text-rose-500"
                onClick={() => openModal('Facultades Participantes', (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-rose-500/10 to-rose-600/10 rounded-2xl p-6 border border-rose-500/20">
                      <Building2 className="h-12 w-12 text-rose-500 mb-4" />
                      <h4 className="font-bold text-2xl mb-2">{stats.faculties} Facultades</h4>
                      <p className="text-muted-foreground">Investigación multidisciplinaria que abarca diversas áreas del conocimiento humano.</p>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-4">
                      <h5 className="font-bold mb-3">Áreas activas:</h5>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {facultyStats.map((faculty, index) => {
                          const colors = ['bg-blue-500', 'bg-amber-500', 'bg-rose-500', 'bg-emerald-500', 'bg-purple-500', 'bg-cyan-500']
                          const color = colors[index % colors.length]
                          return (
                            <div key={faculty.name} className="flex items-center justify-between text-sm bg-background/50 rounded-lg p-3 hover:bg-background transition-colors">
                              <div className="flex items-center gap-3">
                                <div className={`h-2 w-2 rounded-full ${color}`} />
                                <span className="font-medium">{faculty.name}</span>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>{faculty.count} {faculty.count === 1 ? 'investigación' : 'investigaciones'}</span>
                                <span>•</span>
                                <span>{faculty.authors} {faculty.authors === 1 ? 'autor' : 'autores'}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              />

              <StatCard
                icon={Unlock}
                value="100%"
                label="Acceso Abierto"
                description="Todo el contenido es de libre acceso"
                color="text-emerald-500"
                onClick={() => openModal('Acceso Abierto', (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 rounded-2xl p-6 border border-emerald-500/20">
                      <Unlock className="h-12 w-12 text-emerald-500 mb-4" />
                      <h4 className="font-bold text-2xl mb-2">100% Acceso Abierto</h4>
                      <p className="text-muted-foreground">Creemos en la democratización del conocimiento. Todo nuestro contenido está disponible gratuitamente para la comunidad global.</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 bg-muted/50 rounded-xl p-4">
                        <Globe className="h-6 w-6 text-emerald-500 mt-1" />
                        <div>
                          <div className="font-bold">Sin barreras</div>
                          <div className="text-sm text-muted-foreground">No requiere suscripción ni pago</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 bg-muted/50 rounded-xl p-4">
                        <Eye className="h-6 w-6 text-emerald-500 mt-1" />
                        <div>
                          <div className="font-bold">Visibilidad global</div>
                          <div className="text-sm text-muted-foreground">Indexado en buscadores académicos</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 bg-muted/50 rounded-xl p-4">
                        <Download className="h-6 w-6 text-emerald-500 mt-1" />
                        <div>
                          <div className="font-bold">Descarga libre</div>
                          <div className="text-sm text-muted-foreground">PDFs completos sin restricciones</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-muted/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16 space-y-4">
              <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-semibold bg-background/50 backdrop-blur-sm">
                <Star className="h-4 w-4 mr-2 text-primary" />
                Características
              </div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight">
                ¿Por qué elegirnos?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Una plataforma diseñada para impulsar la investigación académica
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={Zap}
                title="Búsqueda Rápida"
                description="Encuentra investigaciones relevantes en segundos con nuestro motor de búsqueda avanzado y filtros inteligentes."
                color="text-yellow-400"
                gradient="from-yellow-600 to-orange-600"
              />
              <FeatureCard
                icon={Shield}
                title="Contenido Verificado"
                description="Todas las publicaciones pasan por un riguroso proceso de revisión para garantizar calidad académica."
                color="text-blue-400"
                gradient="from-blue-600 to-cyan-600"
              />
              <FeatureCard
                icon={Globe}
                title="Alcance Global"
                description="Tu investigación visible para la comunidad académica internacional con indexación en buscadores especializados."
                color="text-green-400"
                gradient="from-green-600 to-emerald-600"
              />
              <FeatureCard
                icon={TrendingUp}
                title="Métricas en Tiempo Real"
                description="Monitorea el impacto de tus publicaciones con estadísticas de visualizaciones, descargas y citas."
                color="text-purple-400"
                gradient="from-purple-600 to-pink-600"
              />
              <FeatureCard
                icon={Database}
                title="Almacenamiento Seguro"
                description="Tus documentos protegidos con respaldos automáticos y tecnología de encriptación de última generación."
                color="text-red-400"
                gradient="from-red-600 to-rose-600"
              />
              <FeatureCard
                icon={BarChart3}
                title="Panel de Control"
                description="Gestiona tus investigaciones, colaboradores y estadísticas desde un dashboard intuitivo y poderoso."
                color="text-indigo-400"
                gradient="from-indigo-600 to-blue-600"
              />
            </div>
          </div>
        </section>

        {/* Recent Investigations */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div className="space-y-2">
                <h2 className="text-3xl md:text-4xl font-black tracking-tight">Investigaciones Recientes</h2>
                <p className="text-lg text-muted-foreground">Explora las últimas publicaciones académicas aprobadas</p>
              </div>
              <Button variant="outline" asChild className="gap-2 group hover:bg-primary hover:text-primary-foreground transition-all">
                <Link href="/dashboard/explore">
                  Ver todo el catálogo
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {investigations.length > 0 ? (
                investigations.map((item) => (
                  <Link
                    key={item.id}
                    href={`/research/${item.slug}`}
                    className="group relative overflow-hidden rounded-2xl bg-card border border-border/50 p-6 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
                          {item.career || 'General'}
                        </div>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.abstract || 'Sin descripción disponible'}
                      </p>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="text-xs text-muted-foreground">
                          {item.author}
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full py-12 text-center">
                  <BookOpen className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay investigaciones públicas disponibles en este momento.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Areas of Knowledge */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight">Áreas de Conocimiento</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Explora investigaciones organizadas por disciplina académica
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {facultyStats.length > 0 ? (
                facultyStats.map((faculty, index) => {
                  // Assign colors and icons based on index or faculty name
                  const colorSchemes = [
                    { color: "text-blue-500", bg: "bg-blue-500/10", icon: Building2 },
                    { color: "text-amber-500", bg: "bg-amber-500/10", icon: Users },
                    { color: "text-rose-500", bg: "bg-rose-500/10", icon: Building2 },
                    { color: "text-emerald-500", bg: "bg-emerald-500/10", icon: BookOpen },
                    { color: "text-purple-500", bg: "bg-purple-500/10", icon: GraduationCap },
                    { color: "text-cyan-500", bg: "bg-cyan-500/10", icon: Award },
                  ]
                  const scheme = colorSchemes[index % colorSchemes.length]

                  // Generate description based on faculty name
                  const getDescription = (name: string) => {
                    const descriptions: { [key: string]: string } = {
                      'Ingeniería': 'Innovación tecnológica, desarrollo de software, sistemas electrónicos, infraestructura y soluciones de ingeniería aplicada a problemas reales.',
                      'Ciencias Humanas': 'Estudios sociales, psicología, educación, antropología y análisis del comportamiento humano en diversos contextos culturales.',
                      'Arquitectura': 'Diseño urbano, planificación arquitectónica, sostenibilidad, patrimonio cultural y desarrollo de espacios habitables innovadores.',
                      'Ciencias Económicas': 'Análisis económico, administración de empresas, finanzas, marketing, emprendimiento y desarrollo de modelos de negocio.',
                      'Ciencias de la Salud': 'Investigación médica, salud pública, enfermería, nutrición y promoción del bienestar integral de la población.',
                      'Derecho': 'Análisis jurídico, derechos humanos, legislación, justicia social y desarrollo del marco legal contemporáneo.',
                    }
                    return descriptions[name] || `Investigaciones y estudios especializados en el área de ${name}, contribuyendo al desarrollo académico y científico de la disciplina.`
                  }

                  return (
                    <AreaCard
                      key={faculty.name}
                      label={faculty.name}
                      icon={scheme.icon}
                      color={scheme.color}
                      bg={scheme.bg}
                      description={getDescription(faculty.name)}
                      stats={[
                        { value: `${faculty.count}`, label: faculty.count === 1 ? 'Investigación' : 'Investigaciones' },
                        { value: `${faculty.authors}`, label: faculty.authors === 1 ? 'Investigador' : 'Investigadores' },
                        ...(faculty.careers > 0 ? [{ value: `${faculty.careers}`, label: faculty.careers === 1 ? 'Carrera' : 'Carreras' }] : [])
                      ]}
                    />
                  )
                })
              ) : (
                <div className="col-span-full py-12 text-center">
                  <Building2 className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">Cargando áreas de conocimiento...</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-blue-500/10 to-purple-500/10" />
          <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-semibold bg-background/50 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 mr-2 text-primary" />
                Únete a la comunidad
              </div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight">
                ¿Listo para compartir tu investigación?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Regístrate hoy y forma parte de la comunidad académica más innovadora de la región
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button size="lg" asChild className="rounded-full px-8 font-bold text-lg shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all">
                  <Link href="/register">
                    <GraduationCap className="h-5 w-5 mr-2" />
                    Comenzar ahora
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="rounded-full px-8 font-bold text-lg hover:bg-background/80 backdrop-blur-sm">
                  <Link href="/dashboard/explore">
                    <Search className="h-5 w-5 mr-2" />
                    Explorar contenido
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50 backdrop-blur-sm py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <UniversityLogo variant="compact" />
              <div>
                <div className="font-black text-sm">Universidad del Istmo</div>
                <div className="text-xs text-muted-foreground">Repositorio Institucional</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center md:text-right">
              © {new Date().getFullYear()} Repositorio Institucional. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* Modal */}
      <Modal isOpen={modalContent.isOpen} onClose={closeModal} title={modalContent.title}>
        {modalContent.content}
      </Modal>
    </div>
  )
}
