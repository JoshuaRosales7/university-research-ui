"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResearchCard } from "@/components/research/research-card"
import { mockResearches } from "@/lib/mock-data"

export function SubmissionsContent() {
  const [searchQuery, setSearchQuery] = useState("")

  const filterByStatus = (status: string | null) => {
    let results = mockResearches

    if (status) {
      results = results.filter((r) => r.status === status)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      results = results.filter((r) => r.title.toLowerCase().includes(query))
    }

    return results
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Mis Envíos</h1>
          <p className="text-muted-foreground">Gestiona tus investigaciones enviadas</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/upload" className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva Investigación
          </Link>
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar en mis envíos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Todos ({filterByStatus(null).length})</TabsTrigger>
          <TabsTrigger value="en_revision">En Revisión ({filterByStatus("en_revision").length})</TabsTrigger>
          <TabsTrigger value="aprobado">Aprobados ({filterByStatus("aprobado").length})</TabsTrigger>
          <TabsTrigger value="rechazado">Rechazados ({filterByStatus("rechazado").length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6 space-y-4">
          {filterByStatus(null).map((research) => (
            <ResearchCard key={research.id} research={research} showStatus />
          ))}
        </TabsContent>

        <TabsContent value="en_revision" className="mt-6 space-y-4">
          {filterByStatus("en_revision").map((research) => (
            <ResearchCard key={research.id} research={research} showStatus />
          ))}
        </TabsContent>

        <TabsContent value="aprobado" className="mt-6 space-y-4">
          {filterByStatus("aprobado").map((research) => (
            <ResearchCard key={research.id} research={research} showStatus />
          ))}
        </TabsContent>

        <TabsContent value="rechazado" className="mt-6 space-y-4">
          {filterByStatus("rechazado").map((research) => (
            <ResearchCard key={research.id} research={research} showStatus />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
