// components/dashboard/recent-submissions.tsx
"use client"

import Link from "next/link"
import { FileText, ArrowRight, Loader2, Inbox } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useMyWorkspaceItems } from "@/lib/hooks"
import { useAuth } from "@/lib/auth-context"

const statusConfig: any = {
  borrador: { label: "Borrador", variant: "outline", class: "bg-muted text-muted-foreground border-0" },
  en_revision: { label: "Revisando", variant: "secondary", class: "bg-amber-100/50 text-amber-700 border-0" },
  aprobado: { label: "Aprobado", variant: "default", class: "bg-emerald-100/50 text-emerald-700 border-0" },
  rechazado: { label: "Rechazado", variant: "destructive", class: "bg-red-100/50 text-red-700 border-0" },
}

export function RecentSubmissions() {
  const { user } = useAuth()
  const { data: submissions, isLoading } = useMyWorkspaceItems(user?.id)
  const recentItems = (submissions || []).slice(0, 5)

  return (
    <Card className="border-0 shadow-sm ring-1 ring-border/50 bg-card/40 backdrop-blur-md">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg font-black uppercase tracking-tight">Actividad Reciente</CardTitle>
        <Button variant="link" size="sm" asChild className="h-auto p-0 font-black text-[10px] uppercase tracking-widest">
          <Link href="/dashboard/my-submissions" className="flex items-center gap-1">
            Ver Todo <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="py-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary/20" /></div>
        ) : recentItems.length > 0 ? (
          <div className="divide-y divide-border/20 px-4 pb-4">
            {recentItems.map((item) => (
              <Link key={item.id} href={`/dashboard/research/${item.id}`} className="flex items-center gap-4 py-4 hover:opacity-70 transition-opacity">
                <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{item.title}</p>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase">{item.year} • {item.authors?.[0]}</p>
                </div>
                <Badge className={statusConfig[item.status]?.class + " text-[9px] font-black uppercase px-2 py-0.5 rounded-lg"}>
                  {statusConfig[item.status]?.label}
                </Badge>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center space-y-2">
            <Inbox className="h-8 w-8 mx-auto text-muted-foreground/20" />
            <p className="text-xs font-bold text-muted-foreground uppercase">Sin registros aún</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
