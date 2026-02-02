"use client"

import { useState, useEffect } from "react"
import { Search, Filter, LayoutGrid, List, SlidersHorizontal, Loader2, Database, ChevronLeft, ChevronRight, BookOpen, GraduationCap, Calendar, Briefcase, School, Globe, Server } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ResearchCard } from "@/components/research/research-card"
import { ExternalResearchCard } from "@/components/explore/external-research-card"
import { useSearch, useOpenAlexSearch } from "@/lib/hooks"
import { cn } from "@/lib/utils"

type ViewMode = "list" | "grid"
type SortOption = "date" | "relevance" | "title"
type SearchSource = "local" | "global"

export function ExploreContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [source, setSource] = useState<SearchSource>("local")
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [sortBy, setSortBy] = useState<SortOption>("date")
  const [page, setPage] = useState(0)
  const pageSize = 10

  // Filter States
  const [selectedFaculties, setSelectedFaculties] = useState<string[]>([])
  const [selectedCareers, setSelectedCareers] = useState<string[]>([])
  const [selectedYears, setSelectedYears] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])

  // Data Options
  const faculties = [
    "Facultad de Ingeniería",
    "Facultad de Ciencias",
    "Facultad de Arquitectura y Diseño",
    "Facultad de Ciencias Económicas y Empresariales",
    "Facultad de Derecho",
    "Facultad de Educación",
    "Facultad de Humanidades",
    "Facultad de Comunicación",
  ]

  const careers = [
    "Ingeniería de Sistemas",
    "Ingeniería Industrial",
    "Ingeniería Electrónica y Redes de Información",
    "Biología Marina",
    "Química Ambiental",
    "Arquitectura",
    "Diseño Gráfico",
    "Administración de Empresas",
    "Derecho",
    "Psicología Clínica",
    "Periodismo",
  ]

  const currentYear = new Date().getFullYear() + 1
  const years = Array.from({ length: 11 }, (_, i) => (currentYear - i).toString())

  const workTypes = [
    "Tesis",
    "Artículo Científico",
    "Proyecto de Grado",
    "Ensayo",
    "Monografía"
  ]

  // Reset page when filters change
  useEffect(() => {
    setPage(0)
  }, [searchQuery, selectedFaculties, selectedCareers, selectedYears, selectedTypes, source])

  // Internal Search (Conditional)
  const { data: localData, isLoading: isLoadingLocal } = useSearch(
    source === "local"
      ? {
        query: searchQuery,
        page: page,
        size: pageSize,
        filters: {
          faculty: selectedFaculties,
          career: selectedCareers,
          year: selectedYears,
          work_type: selectedTypes,
        },
      }
      : null,
  )

  // External Search (Conditional)
  const shouldFetchGlobal = source === "global"
  const { data: externalData, isLoading: isLoadingExternal } = useOpenAlexSearch(
    shouldFetchGlobal ? searchQuery : "",
    page + 1,
    shouldFetchGlobal ? selectedYears : []
  )

  const isLoading = source === "global" ? isLoadingExternal : isLoadingLocal
  const items = (source === "global" ? externalData?.results : localData?.items) || []
  const total = (source === "global" ? externalData?.meta?.count : localData?.total) || 0

  // Handlers
  const toggleFilter = (item: string, current: string[], setFn: (val: string[]) => void) => {
    setFn(current.includes(item) ? current.filter((i) => i !== item) : [...current, item])
  }

  const clearFilters = () => {
    setSelectedFaculties([])
    setSelectedCareers([])
    setSelectedYears([])
    setSelectedTypes([])
    setSearchQuery("")
    setPage(0)
  }

  const activeFiltersCount =
    selectedFaculties.length +
    selectedCareers.length +
    selectedYears.length +
    selectedTypes.length

  const totalPages = total ? Math.ceil(total / pageSize) : 0

  const FilterSection = ({
    title,
    icon: Icon,
    items,
    selected,
    onToggle
  }: {
    title: string,
    icon: any,
    items: string[],
    selected: string[],
    onToggle: (item: string) => void
  }) => (
    <AccordionItem value={title} className="border-none">
      <AccordionTrigger className="hover:no-underline py-3 px-2 rounded-lg hover:bg-muted/50 transition-colors">
        <span className="flex items-center gap-2 font-bold text-sm text-foreground/80">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </span>
        {selected.length > 0 && (
          <Badge variant="secondary" className="ml-auto mr-2 h-5 min-w-5 px-1.5 text-[10px] font-bold">
            {selected.length}
          </Badge>
        )}
      </AccordionTrigger>
      <AccordionContent className="pt-2 pb-4 px-2">
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item} className="flex items-start space-x-3 group cursor-pointer hover:bg-muted/30 p-1.5 rounded-md transition-all">
              <Checkbox
                id={`${title}-${item}`}
                checked={selected.includes(item)}
                onCheckedChange={() => onToggle(item)}
                className="mt-0.5 border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <Label
                htmlFor={`${title}-${item}`}
                className="text-xs leading-none font-medium text-muted-foreground w-full cursor-pointer group-hover:text-foreground transition-colors pt-0.5"
              >
                {item}
              </Label>
            </div>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  )

  const FilterContent = () => (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between px-1">
        <h3 className="font-black text-lg tracking-tight flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary fill-primary/20" />
          Filtros {source === "global" && "(Limitado)"}
        </h3>
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 -mr-2"
          >
            Limpiar todo
          </Button>
        )}
      </div>

      {source === "global" && (
        <div className="bg-blue-50/50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900/50 text-xs text-blue-700 dark:text-blue-300">
          <p className="flex items-start gap-2">
            <Globe className="h-4 w-4 shrink-0 mt-0.5" />
            <span>En modo Global, solo puedes filtrar por Año de publicación.</span>
          </p>
        </div>
      )}

      <ScrollArea className="flex-1 -mx-4 px-4">
        <Accordion type="multiple" defaultValue={source === "local" ? ["Facultad", "Tipo", "Año"] : ["Año"]} className="space-y-1">
          {source === "local" && (
            <>
              <FilterSection
                title="Facultad"
                icon={School}
                items={faculties}
                selected={selectedFaculties}
                onToggle={(i) => toggleFilter(i, selectedFaculties, setSelectedFaculties)}
              />
              <FilterSection
                title="Carrera"
                icon={GraduationCap}
                items={careers}
                selected={selectedCareers}
                onToggle={(i) => toggleFilter(i, selectedCareers, setSelectedCareers)}
              />
            </>
          )}

          <FilterSection
            title="Año"
            icon={Calendar}
            items={years}
            selected={selectedYears}
            onToggle={(i) => toggleFilter(i, selectedYears, setSelectedYears)}
          />

          {source === "local" && (
            <FilterSection
              title="Tipo"
              icon={BookOpen}
              items={workTypes}
              selected={selectedTypes}
              onToggle={(i) => toggleFilter(i, selectedTypes, setSelectedTypes)}
            />
          )}
        </Accordion>
      </ScrollArea>
    </div>
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 container mx-auto px-4 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-primary/10">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-1.5 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.5)]"></div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground">
              Explorar <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">Investigaciones</span>
            </h1>
          </div>
          <p className="text-muted-foreground font-medium text-base pl-5 max-w-2xl">
            Accede al repositorio académico de la Universidad del Istmo. Descubre tesis, artículos y proyectos destacados.
          </p>
        </div>
      </div>

      {/* Main Search & Controls */}
      <div className="sticky top-4 z-40 bg-background/80 backdrop-blur-md rounded-2xl shadow-sm border border-border/50 p-2 transition-all duration-200">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              type="search"
              placeholder="Buscar por título, autor, palabras clave..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-muted/40 border-transparent focus:bg-background focus:border-primary/20 text-base rounded-xl transition-all shadow-sm"
            />
          </div>

          <div className="flex bg-muted/40 p-1 rounded-xl h-12 shrink-0">
            <Button
              variant={source === "local" ? "default" : "ghost"}
              size="sm"
              onClick={() => setSource("local")}
              className="h-full rounded-lg px-4 gap-2"
            >
              <Server className="h-4 w-4" />
              <span className="hidden sm:inline">Institucional</span>
            </Button>
            <Button
              variant={source === "global" ? "default" : "ghost"}
              size="sm"
              onClick={() => setSource("global")}
              className="h-full rounded-lg px-4 gap-2"
            >
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Global (OpenAlex)</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="lg" className="lg:hidden h-12 px-4 gap-2 rounded-xl border-dashed">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filtros
                  {activeFiltersCount > 0 && (
                    <Badge variant="default" className="ml-1 h-5 w-5 p-0 justify-center rounded-full text-[10px]">{activeFiltersCount}</Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[350px]">
                <FilterContent />
              </SheetContent>
            </Sheet>

            {source === "local" && (
              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger className="w-[160px] h-12 rounded-xl bg-muted/40 border-transparent hover:bg-muted/60">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Más recientes</SelectItem>
                  <SelectItem value="title">Título A-Z</SelectItem>
                  <SelectItem value="relevance">Relevancia</SelectItem>
                </SelectContent>
              </Select>
            )}

            <div className="hidden md:flex items-center bg-muted/40 rounded-xl p-1 h-12">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-10 w-10 p-0 rounded-lg"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-10 w-10 p-0 rounded-lg"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-8 items-start">
        {/* Desktop Filters Sidebar */}
        <aside className="hidden lg:block w-72 shrink-0 sticky top-24 max-h-[calc(100vh-8rem)]">
          <Card className={cn(
            "h-full border-border/50 backdrop-blur-sm shadow-sm transition-colors",
            source === "local" ? "bg-card/50" : "bg-blue-50/20 border-blue-100"
          )}>
            <CardContent className="p-6 h-full">
              <FilterContent />
            </CardContent>
          </Card>
        </aside>

        {/* Results Area */}
        <div className="flex-1 space-y-6 min-h-[500px]">
          {/* Results Meta */}
          {!isLoading && (
            <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span>
                  Mostrando <strong className="text-foreground">{items?.length || 0}</strong> de <strong className="text-foreground">{total || 0}</strong> resultados
                </span>
              </div>
              {activeFiltersCount > 0 && (
                <div className="flex gap-2 flex-wrap justify-end">
                  {selectedFaculties.slice(0, 1).map(f => (
                    <Badge key={f} variant="outline" className="text-xs max-w-[150px] truncate">{f}</Badge>
                  ))}
                  {selectedFaculties.length > 1 && <Badge variant="outline" className="text-xs">+{selectedFaculties.length - 1} más</Badge>}
                </div>
              )}
            </div>
          )}

          {isLoading ? (
            <div className="h-[400px] flex flex-col items-center justify-center gap-4 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground animate-pulse font-medium">Cargando investigaciones...</p>
            </div>
          ) : !items || items.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-muted rounded-[2rem] bg-muted/10">
              <div className="bg-muted p-6 rounded-full mb-6">
                <Search className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-2">No se encontraron resultados</h3>
              <p className="text-muted-foreground max-w-sm mb-8">
                Prueba ajustando tus términos de búsqueda o filtros para encontrar lo que buscas.
              </p>
              <Button onClick={clearFilters} variant="outline" size="lg" className="font-semibold">
                Limpiar filtros de búsqueda
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className={cn(
                "grid gap-4",
                viewMode === "grid"
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2"
                  : "grid-cols-1"
              )}>

                {items.map((item: any) => (
                  <div key={item.id} className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-backwards">
                    {source === "local" ? (
                      <ResearchCard research={item} />
                    ) : (
                      <ExternalResearchCard research={item} />
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-12 py-8 border-t border-border/40">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="h-10 w-10 rounded-full"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Página</span>
                    <span className="text-sm font-bold text-foreground px-3 py-1 bg-muted rounded-md min-w-[3rem] text-center">
                      {page + 1}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">de {totalPages}</span>
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="h-10 w-10 rounded-full"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
