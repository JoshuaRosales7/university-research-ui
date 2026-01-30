import Link from "next/link"
import { Search, BookOpen, GraduationCap, Users, ArrowRight, Building2, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UniversityLogo } from "@/components/university-logo"
import { supabase } from "@/lib/supabase"
import { PublicResearchCard } from "@/components/research/public-research-card"

// Fetch data server-side
async function getRecentInvestigations() {
  const { data, error } = await supabase
    .from('investigations')
    .select('*')
    .eq('status', 'aprobado')
    .not('slug', 'is', null)
    .order('created_at', { ascending: false })
    .limit(6)

  if (error) {
    console.error('Error fetching investigations:', error)
    return []
  }

  return data || []
}

// Fetch stats server-side
async function getStats() {
  try {
    const [docsRes, authorsRes, facultiesRes] = await Promise.all([
      // Count approved investigations
      supabase
        .from('investigations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'aprobado'),

      // Count registered researchers (profiles)
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true }),

      // Get unique faculties from approved investigations
      supabase
        .from('investigations')
        .select('faculty')
        .eq('status', 'aprobado')
    ])

    const uniqueFaculties = new Set(
      (facultiesRes.data || [])
        .map(i => i.faculty)
        .filter(Boolean)
    ).size

    return {
      documents: docsRes.count || 0,
      authors: authorsRes.count || 0,
      faculties: uniqueFaculties || 0
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
    return { documents: 0, authors: 0, faculties: 0 }
  }
}

export default async function LandingPage() {
  const [investigations, stats] = await Promise.all([
    getRecentInvestigations(),
    getStats()
  ])

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
            <Button size="sm" asChild className="rounded-full px-6 font-bold shadow-lg shadow-primary/20">
              <Link href="/register">Registrarse</Link>
            </Button>
          </div>
        </div>
      </header>


      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32 md:pt-32 md:pb-48">
          <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] -z-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background -z-10" />

          <div className="container mx-auto px-4 text-center space-y-8 relative z-10">
            <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium bg-secondary/50 backdrop-blur-sm mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
              Repositorio Institucional Oficial
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-foreground max-w-4xl mx-auto leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-700">
              Descubre el conocimiento <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                que transforma el futuro
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
              Accede a tesis, artículos científicos y proyectos de investigación de la Universidad del Istmo.
            </p>

            <div className="max-w-2xl mx-auto mt-10 p-2 bg-background/50 backdrop-blur-md rounded-2xl border shadow-2xl shadow-primary/10 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-200">
              <form action="/dashboard/explore" method="GET" className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    name="q"
                    placeholder="Buscar investigaciones, autores, palabras clave..."
                    className="pl-10 h-12 bg-transparent border-transparent focus-visible:ring-0 text-base"
                  />
                </div>
                <Button size="lg" type="submit" className="h-12 px-8 rounded-xl font-bold">
                  Buscar
                </Button>
              </form>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-16 pt-16 border-t border-border/40 animate-in fade-in zoom-in duration-1000 delay-300">
              <div className="space-y-2">
                <h4 className="text-3xl font-black text-foreground">{stats.documents}+</h4>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Documentos</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-3xl font-black text-foreground">{stats.authors}+</h4>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Autores</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-3xl font-black text-foreground">{stats.faculties}</h4>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Facultades</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-3xl font-black text-foreground">100%</h4>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Acceso Abierto</p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Section */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div className="space-y-2">
                <h2 className="text-3xl md:text-4xl font-black tracking-tight">Investigaciones Recientes</h2>
                <p className="text-muted-foreground">Explora las últimas publicaciones académicas aprobadas.</p>
              </div>
              <Button variant="outline" asChild className="gap-2 group">
                <Link href="/dashboard/explore">
                  Ver todo el catálogo <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {investigations.length > 0 ? (
                investigations.map((item) => (
                  <PublicResearchCard key={item.id} research={item} />
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-muted-foreground">
                  <p>No hay investigaciones públicas disponibles en este momento.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Categories Preview */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-center mb-16">Áreas de Conocimiento</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Ingeniería", icon: Building2, color: "text-blue-500", bg: "bg-blue-500/10" },
                { label: "Ciencias Humanas", icon: Users, color: "text-amber-500", bg: "bg-amber-500/10" },
                { label: "Arquitectura", icon: Building2, color: "text-rose-500", bg: "bg-rose-500/10" },
                { label: "Ciencias Económicas", icon: BookOpen, color: "text-emerald-500", bg: "bg-emerald-500/10" },
              ].map((cat, i) => (
                <Link
                  key={i}
                  href={`/dashboard/explore?faculty=${encodeURIComponent(cat.label)}`}
                  className="group relative overflow-hidden rounded-3xl bg-card border border-border/50 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`h-12 w-12 rounded-2xl ${cat.bg} ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <cat.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">{cat.label}</h3>
                  <p className="text-sm text-muted-foreground">Explorar área</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <UniversityLogo variant="compact" />
              <span className="font-bold text-sm">Universidad del Istmo</span>
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
