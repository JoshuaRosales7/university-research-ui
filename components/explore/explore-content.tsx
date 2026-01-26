// components/explore/explore-content.tsx
"use client"

import { useState, useMemo } from "react"
import { Search, Filter, LayoutGrid, List, SlidersHorizontal, Loader2, Database } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ResearchCard } from "@/components/research/research-card"
import { useSearch } from "@/lib/hooks"
import { cn } from "@/lib/utils"

type ViewMode = "list" | "grid"
type SortOption = "date" | "relevance" | "title"

export function ExploreContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [sortBy, setSortBy] = useState<SortOption>("date")
  const [selectedFaculties, setSelectedFaculties] = useState<string[]>([])

  const faculties = [
    "Arquitectura y Diseño",
    "Ciencias Económicas y Empresariales",
    "Comunicación",
    "Derecho",
    "Educación",
    "Ingeniería",
    "Humanidades",
  ]

  const { data, isLoading } = useSearch({
    query: searchQuery,
    page: 0,
    size: 50
  })

  const results = (data?.items || []).filter((r: any) => {
    if (selectedFaculties.length > 0) {
      return selectedFaculties.includes(r.faculty || "Arquitectura y Diseño") // Defaulting for mock comparison if faculty missing in DB
    }
    return true
  })

  const toggleFaculty = (faculty: string) => {
    setSelectedFaculties((prev) => (prev.includes(faculty) ? prev.filter((f) => f !== faculty) : [...prev, faculty]))
  }

  const clearFilters = () => {
    setSelectedFaculties([])
    setSearchQuery("")
  }

  const activeFiltersCount = selectedFaculties.length

  const FilterContent = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary"></div>
          Filtrar por Facultad
        </h4>
        <div className="space-y-3">
          {faculties.map((faculty) => (
            <div key={faculty} className="flex items-center space-x-3 group cursor-pointer hover:translate-x-1 transition-transform duration-200">
              <Checkbox
                id={`faculty-${faculty}`}
                checked={selectedFaculties.includes(faculty)}
                onCheckedChange={() => toggleFaculty(faculty)}
                className="border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded-lg transition-all"
              />
              <Label htmlFor={`faculty-${faculty}`} className="text-sm font-semibold cursor-pointer text-muted-foreground group-hover:text-primary transition-colors">
                {faculty}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {activeFiltersCount > 0 && (
        <button 
          onClick={clearFilters} 
          className="w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-destructive bg-destructive/5 hover:bg-destructive/10 transition-colors border border-destructive/20"
        >
          Limpiar todos los filtros
        </button>
      )}
    </div>
  )

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-1 bg-gradient-to-b from-primary to-primary/40 rounded-full"></div>
            <h1 className="text-5xl font-black tracking-tighter text-foreground">Explorar Repositorio</h1>
          </div>
          <p className="text-muted-foreground font-medium text-base ml-4">Accede a la base de conocimientos global de la Universidad del Istmo.</p>
        </div>
      </div>

      {/* Main Controls Strip */}
      <div className="flex flex-col gap-4 p-4 md:p-6 bg-gradient-to-br from-card/80 via-card/60 to-background/40 backdrop-blur-xl rounded-[2.5rem] ring-1 ring-primary/20 md:flex-row md:items-center shadow-2xl border border-primary/10">
        <div className="relative flex-1 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-primary group-focus-within:scale-125 group-focus-within:text-primary transition-all duration-300" />
          <Input
            type="search"
            placeholder="Buscar por título, autor, palabras clave..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-16 h-16 bg-transparent border-0 focus:ring-2 focus:ring-primary/50 text-foreground text-lg placeholder:text-muted-foreground/50 placeholder:font-medium rounded-2xl transition-all"
          />
        </div>

        <div className="flex items-center gap-3 px-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden h-12 gap-2 border-primary/20 hover:bg-primary/5 font-bold text-sm rounded-xl">
                <SlidersHorizontal className="h-4 w-4" /> Filtros
                {activeFiltersCount > 0 && <Badge className="ml-1 px-2 h-5 min-w-5 bg-primary text-white font-bold">{activeFiltersCount}</Badge>}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-background border-r border-primary/10">
              <SheetHeader>
                <SheetTitle className="text-xl font-bold text-foreground">Refinar Búsqueda</SheetTitle>
              </SheetHeader>
              <div className="mt-8">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>

          <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
            <SelectTrigger className="w-auto md:w-48 h-12 border-primary/20 bg-background/50 font-bold rounded-xl hover:bg-background transition-colors">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="date" className="font-bold">Más recientes</SelectItem>
              <SelectItem value="title" className="font-bold">Título A-Z</SelectItem>
            </SelectContent>
          </Select>

          <div className="hidden md:flex items-center border border-primary/20 rounded-xl p-1.5 bg-primary/5">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              className={cn("h-9 w-9 rounded-lg font-bold transition-all", viewMode === "list" && "shadow-lg scale-105")}
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              className={cn("h-9 w-9 rounded-lg font-bold transition-all", viewMode === "grid" && "shadow-lg scale-105")}
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex gap-10 items-start">
        {/* Persistent Filters Sidebar */}
        <Card className="hidden lg:block w-80 shrink-0 border-0 shadow-2xl ring-1 ring-primary/20 bg-gradient-to-br from-card/80 via-card/60 to-background/40 backdrop-blur-xl rounded-[2rem] sticky top-20">
          <CardHeader className="border-b border-primary/10 bg-gradient-to-r from-primary/10 to-transparent pb-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-black flex items-center gap-3">
                <Filter className="h-5 w-5 text-primary" /> 
                <span>Filtros</span>
              </CardTitle>
              {activeFiltersCount > 0 && (
                <button 
                  onClick={clearFilters} 
                  className="text-[10px] font-black uppercase text-primary hover:text-primary/80 transition-colors py-1 px-3 bg-primary/10 rounded-lg"
                >
                  Resetear
                </button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <FilterContent />
          </CardContent>
        </Card>

        <div className="flex-1 space-y-8">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3 font-bold text-muted-foreground uppercase tracking-widest text-xs bg-primary/5 px-4 py-2 rounded-lg border border-primary/10">
              <Database className="h-4 w-4 text-primary" />
              <span><span className="text-primary font-black text-base">{results.length}</span> Documentos</span>
            </div>
          </div>

          {isLoading ? (
            <div className="py-32 flex flex-col items-center justify-center gap-5 text-center">
              <div className="relative h-16 w-16">
                <Loader2 className="h-16 w-16 animate-spin text-primary absolute" />
                <div className="h-16 w-16 bg-gradient-to-r from-primary/20 to-transparent rounded-full animate-pulse"></div>
              </div>
              <p className="font-bold text-muted-foreground uppercase tracking-tighter text-sm">Consultando base de investigación...</p>
            </div>
          ) : results.length === 0 ? (
            <Card className="border-0 shadow-xl bg-gradient-to-br from-card/40 via-card/20 to-background/40 backdrop-blur-sm py-24 text-center ring-1 ring-primary/10 rounded-[2rem]">
              <CardContent>
                <div className="bg-primary/10 p-6 rounded-full w-fit mx-auto mb-8">
                  <Search className="h-12 w-12 text-primary/40" />
                </div>
                <h3 className="text-2xl font-black mb-4">Sin resultados</h3>
                <p className="text-muted-foreground mb-10 max-w-sm mx-auto leading-relaxed">No se encontraron investigaciones que coincidan con tus criterios de búsqueda actual.</p>
                <Button 
                  variant="outline" 
                  className="font-bold border-primary/30 text-primary hover:bg-primary/5" 
                  onClick={clearFilters}
                >
                  Restablecer Filtros
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className={cn(
              "animate-in slide-in-from-bottom-4 duration-500",
              viewMode === "grid" 
                ? "grid gap-6 md:grid-cols-2 lg:grid-cols-2" 
                : "space-y-5"
            )}>
              {results.map((research) => (
                <div key={research.id} className="animate-in fade-in duration-300">
                  <ResearchCard research={research} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
