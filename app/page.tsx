import Link from "next/link"
import { Search, BookOpen, GraduationCap, Shield, Zap, Globe, TrendingUp, Database, BarChart3, Star, Sparkles, Eye, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UniversityLogo } from "@/components/university-logo"
import { supabase, supabaseQuery } from "@/lib/supabase"
import { StatsSection } from "@/components/landing/stats-section"
import { AreasSection } from "@/components/landing/areas-section"

// Fetch all data server-side in parallel - OPTIMIZED
async function getLandingPageData() {
  try {
    // Execute all queries in parallel for better performance
    const [investigationsRes, allInvestigationsRes, docsCountRes, authorsCountRes] = await Promise.all([
      // Recent investigations - only fetch needed fields
      supabase
        .from('investigations')
        .select('id,title,abstract,author,slug,career,created_at')
        .eq('status', 'aprobado')
        .not('slug', 'is', null)
        .order('created_at', { ascending: false })
        .limit(6),

      // All investigations for stats - only needed fields
      supabase
        .from('investigations')
        .select('faculty,user_id,career')
        .eq('status', 'aprobado'),

      // Document count
      supabase
        .from('investigations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'aprobado'),

      // Authors count
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
    ])

    const investigations = investigationsRes.data || []
    const allInvestigations = allInvestigationsRes.data || []

    // Calculate faculty statistics efficiently
    const facultyMap = new Map<string, { count: number; authors: Set<string>; careers: Set<string> }>()

    allInvestigations.forEach((inv) => {
      const faculty = inv.faculty || 'Sin clasificar'
      if (!facultyMap.has(faculty)) {
        facultyMap.set(faculty, { count: 0, authors: new Set(), careers: new Set() })
      }
      const stats = facultyMap.get(faculty)!
      stats.count++
      if (inv.user_id) stats.authors.add(inv.user_id)
      if (inv.career) stats.careers.add(inv.career)
    })

    const facultyStats = Array.from(facultyMap.entries())
      .map(([name, data]) => ({
        name,
        count: data.count,
        authors: data.authors.size,
        careers: data.careers.size
      }))
      .sort((a, b) => b.count - a.count)

    const stats = {
      documents: docsCountRes.count || 0,
      authors: authorsCountRes.count || 0,
      faculties: facultyMap.size || 0
    }

    return {
      investigations,
      stats,
      facultyStats
    }
  } catch (error) {
    console.error('Error fetching landing page data:', error)
    // Return empty data on error
    return {
      investigations: [],
      stats: { documents: 0, authors: 0, faculties: 0 },
      facultyStats: []
    }
  }
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

export default async function LandingPage() {
  // Fetch all data server-side - this runs on the server, not the client
  const { investigations, stats, facultyStats } = await getLandingPageData()

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

            {/* Stats Grid - Client Component */}
            <StatsSection stats={stats} facultyStats={facultyStats} />
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

        {/* Areas of Knowledge - Client Component */}
        <AreasSection facultyStats={facultyStats} />

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
    </div>
  )
}
