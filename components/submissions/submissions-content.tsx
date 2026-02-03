// components/submissions/submissions-content.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Search, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResearchCard } from "@/components/research/research-card"
import { useMyWorkspaceItems } from "@/lib/hooks"
import { useAuth } from "@/lib/auth-context"

import { canUploadResearch } from "@/lib/config"

export function SubmissionsContent() {
  const { user } = useAuth()
  const { data: submissions, isLoading } = useMyWorkspaceItems(user?.id)
  const [searchQuery, setSearchQuery] = useState("")

  const results = submissions || []

  const filterByStatus = (status: string | null) => {
    let filtered = results

    if (status) {
      filtered = filtered.filter((r) => r.status === status)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((r) =>
        r.title.toLowerCase().includes(query) ||
        r.authors.some((a: string) => a.toLowerCase().includes(query))
      )
    }

    return filtered
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Cargando tus investigaciones...</p>
      </div>
    )
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter text-foreground">Mis Envíos</h1>
          <p className="text-muted-foreground font-medium text-lg">Gestiona y consulta el estado de tus investigaciones institucionales.</p>
        </div>
        {canUploadResearch(user) && (
          <Button asChild size="lg" className="h-14 px-8 shadow-2xl shadow-primary/20 transition-all font-black uppercase tracking-widest rounded-2xl active:scale-95">
            <Link href="/dashboard/upload" className="gap-3">
              <Plus className="h-6 w-6" />
              Nueva Investigación
            </Link>
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4 p-2 bg-card/60 backdrop-blur-md rounded-3xl ring-1 ring-border/50 md:flex-row md:items-center max-w-2xl shadow-lg">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary group-focus-within:scale-110 transition-transform" />
          <Input
            type="search"
            placeholder="Filtrar por título o autor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 bg-transparent border-0 focus:ring-0 text-foreground placeholder:text-muted-foreground/60 font-medium"
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-muted/50 p-1 h-auto flex flex-wrap sm:flex-nowrap">
          <TabsTrigger value="all" className="py-2.5 px-4 font-semibold">Todos ({filterByStatus(null).length})</TabsTrigger>
          <TabsTrigger value="en_revision" className="py-2.5 px-4 font-semibold">En Revisión ({filterByStatus("en_revision").length})</TabsTrigger>
          <TabsTrigger value="aprobado" className="py-2.5 px-4 font-semibold">Aprobados ({filterByStatus("aprobado").length})</TabsTrigger>
          <TabsTrigger value="rechazado" className="py-2.5 px-4 font-semibold">Rechazados ({filterByStatus("rechazado").length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-8 space-y-6">
          {filterByStatus(null).length > 0 ? (
            filterByStatus(null).map((research) => (
              <ResearchCard key={research.id} research={research} showStatus isOwner={true} />
            ))
          ) : (
            <div className="text-center py-20 border-2 border-dashed rounded-3xl bg-muted/5">
              <p className="text-muted-foreground">No se encontraron investigaciones.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="en_revision" className="mt-8 space-y-6">
          {filterByStatus("en_revision").map((research) => (
            <ResearchCard key={research.id} research={research} showStatus isOwner={true} />
          ))}
        </TabsContent>

        <TabsContent value="aprobado" className="mt-8 space-y-6">
          {filterByStatus("aprobado").map((research) => (
            <ResearchCard key={research.id} research={research} showStatus isOwner={true} />
          ))}
        </TabsContent>

        <TabsContent value="rechazado" className="mt-8 space-y-6">
          {filterByStatus("rechazado").map((research) => (
            <ResearchCard key={research.id} research={research} showStatus isOwner={true} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
