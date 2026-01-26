"use client"

import { useState, useEffect } from "react"
import { Search, Filter, LayoutGrid, List, SlidersHorizontal, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useCommunities, useSearch, getMetadataValue, getMetadataValues } from "@/lib/hooks"
import type { DSpaceItem } from "@/lib/types"
import Link from "next/link"

type ViewMode = "list" | "grid"
type SortOption = "date" | "title"

export function ExploreContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [sortBy, setSortBy] = useState<SortOption>("date")
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>([])
  const [page, setPage] = useState(0)

  const { data: communitiesData, isLoading: loadingCommunities } = useCommunities(0, 50)
  const { data: searchData, isLoading: loadingSearch } = useSearch(
    debouncedQuery || selectedCommunities.length > 0
      ? {
          query: debouncedQuery || "*",
          dsoType: "ITEM",
          scope: selectedCommunities[0], // DSpace only supports one scope at a time
          page,
          size: 20,
          sort: sortBy === "date" ? "dc.date.issued,desc" : "dc.title,asc",
        }
      : { dsoType: "ITEM", page, size: 20 },
  )

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
      setPage(0)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const communities = communitiesData?.communities || []
  const items = searchData?.results?.filter((r): r is DSpaceItem => "inArchive" in r) || []
  const totalResults = searchData?.totalElements || 0

  const toggleCommunity = (communityId: string) => {
    setSelectedCommunities((prev) =>
      prev.includes(communityId) ? prev.filter((c) => c !== communityId) : [communityId],
    )
    setPage(0)
  }

  const clearFilters = () => {
    setSelectedCommunities([])
    setSearchQuery("")
    setDebouncedQuery("")
    setPage(0)
  }

  const activeFiltersCount = selectedCommunities.length

  const FilterContent = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <h4 className="font-medium">Comunidades</h4>
        {loadingCommunities ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando...
          </div>
        ) : (
          communities.map((community) => (
            <div key={community.uuid} className="flex items-center space-x-2">
              <Checkbox
                id={`community-${community.uuid}`}
                checked={selectedCommunities.includes(community.uuid)}
                onCheckedChange={() => toggleCommunity(community.uuid)}
              />
              <Label htmlFor={`community-${community.uuid}`} className="text-sm font-normal cursor-pointer">
                {community.name}
              </Label>
            </div>
          ))
        )}
      </div>

      {activeFiltersCount > 0 && (
        <Button variant="outline" size="sm" onClick={clearFilters} className="w-full bg-transparent">
          Limpiar filtros
        </Button>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Explorar Investigaciones</h1>
        <p className="text-muted-foreground">Busca y consulta las investigaciones publicadas en DSpace</p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por título, autor, palabra clave..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden gap-2 bg-transparent">
                <SlidersHorizontal className="h-4 w-4" />
                Filtros
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>

          <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Más recientes</SelectItem>
              <SelectItem value="title">Título A-Z</SelectItem>
            </SelectContent>
          </Select>

          <div className="hidden md:flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtros activos:</span>
          {selectedCommunities.map((communityId) => {
            const community = communities.find((c) => c.uuid === communityId)
            return (
              <Badge key={communityId} variant="secondary" className="gap-1">
                {community?.name || communityId}
                <button onClick={() => toggleCommunity(communityId)} className="ml-1 hover:text-destructive">
                  ×
                </button>
              </Badge>
            )
          })}
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Limpiar todos
          </Button>
        </div>
      )}

      <div className="flex gap-6">
        <Card className="hidden lg:block w-64 h-fit shrink-0 border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-4 w-4" />
              <h3 className="font-semibold">Filtros</h3>
            </div>
            <FilterContent />
          </CardContent>
        </Card>

        <div className="flex-1 space-y-4">
          <p className="text-sm text-muted-foreground">
            {loadingSearch
              ? "Buscando..."
              : `${totalResults} resultado${totalResults !== 1 ? "s" : ""} encontrado${totalResults !== 1 ? "s" : ""}`}
          </p>

          {loadingSearch ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </CardContent>
            </Card>
          ) : items.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No se encontraron investigaciones con los filtros aplicados.</p>
                <Button variant="link" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className={cn(viewMode === "grid" ? "grid gap-4 md:grid-cols-2" : "space-y-4")}>
              {items.map((item) => (
                <DSpaceItemCard key={item.uuid} item={item} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalResults > 20 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {page + 1} de {Math.ceil(totalResults / 20)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={(page + 1) * 20 >= totalResults}
              >
                Siguiente
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function DSpaceItemCard({ item }: { item: DSpaceItem }) {
  const title = getMetadataValue(item, "dc.title")
  const authors = getMetadataValues(item, "dc.contributor.author")
  const abstract = getMetadataValue(item, "dc.description.abstract")
  const dateIssued = getMetadataValue(item, "dc.date.issued")
  const keywords = getMetadataValues(item, "dc.subject")
  const itemType = getMetadataValue(item, "dc.type")

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <Link
                href={`/dashboard/research/${item.uuid}`}
                className="font-semibold hover:text-primary transition-colors line-clamp-2"
              >
                {title}
              </Link>
              <p className="text-sm text-muted-foreground">{authors.length > 0 ? authors.join(", ") : "Sin autor"}</p>
            </div>
            {itemType && (
              <Badge variant="outline" className="shrink-0">
                {itemType}
              </Badge>
            )}
          </div>

          {abstract && <p className="text-sm text-muted-foreground line-clamp-2">{abstract}</p>}

          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {keywords.slice(0, 3).map((keyword) => (
                <Badge key={keyword} variant="secondary" className="text-xs">
                  {keyword}
                </Badge>
              ))}
              {keywords.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{keywords.length - 3}
                </Badge>
              )}
            </div>
            {dateIssued && <span className="text-xs text-muted-foreground">{dateIssued}</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
