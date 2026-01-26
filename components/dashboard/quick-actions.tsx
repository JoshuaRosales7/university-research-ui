// components/dashboard/quick-actions.tsx
"use client"

import Link from "next/link"
import { Plus, Search, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function QuickActions() {
  return (
    <Card className="border-0 shadow-sm ring-1 ring-border/50 bg-card/40 backdrop-blur-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-black uppercase tracking-tight">Accesos Directos</CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="grid grid-cols-1 gap-2">
          <Button asChild className="h-12 justify-start gap-4 font-bold rounded-xl shadow-lg shadow-primary/10">
            <Link href="/dashboard/upload">
              <Plus className="h-5 w-5" /> Nueva Investigación
            </Link>
          </Button>

          <Button variant="ghost" asChild className="h-12 justify-start gap-4 font-bold rounded-xl hover:bg-primary/5">
            <Link href="/dashboard/my-submissions">
              <FileText className="h-5 w-5 text-primary" /> Mis Envíos
            </Link>
          </Button>

          <Button variant="ghost" asChild className="h-12 justify-start gap-4 font-bold rounded-xl hover:bg-primary/5">
            <Link href="/dashboard/explore">
              <Search className="h-5 w-5 text-primary" /> Explorar Repositorio
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
