// app/dashboard/admin/page.tsx
"use client"

import { useAuth } from "@/lib/auth-context"
import { ShieldAlert, Users, Database, Settings, Activity, Loader2, Search, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function AdminDashboardPage() {
    const { user } = useAuth()

    const isAdmin = user?.role === "admin"

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <div className="bg-destructive/10 p-6 rounded-full">
                    <ShieldAlert className="h-12 w-12 text-destructive" />
                </div>
                <h1 className="text-2xl font-bold">Acceso Denegado</h1>
                <p className="text-muted-foreground max-w-md">
                    Este panel es exclusivo para administradores del sistema.
                </p>
                <Button asChild variant="outline">
                    <Link href="/dashboard">Volver al Dashboard</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold tracking-tight">Administración Global</h1>
                    <p className="text-muted-foreground">Control total de usuarios, datos y configuración del repositorio.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="font-bold gap-2">
                        <Activity className="h-4 w-4 text-green-500" /> Logs del Sistema
                    </Button>
                    <Button className="font-bold gap-2">
                        <Settings className="h-4 w-4" /> Configuración
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <AdminStatCard title="Usuarios Totales" value="245" change="+12% este mes" icon={<Users className="text-blue-500" />} color="bg-blue-500/10" />
                <AdminStatCard title="Investigaciones" value="1,840" change="+45 nuevas" icon={<Database className="text-purple-500" />} color="bg-purple-500/10" />
                <AdminStatCard title="Tasa de Aprobación" value="78%" change="-2% vs prep" icon={<Activity className="text-amber-500" />} color="bg-amber-500/10" />
                <AdminStatCard title="Reportes" value="5" change="Pendientes" icon={<ShieldAlert className="text-red-500" />} color="bg-red-500/10" />
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* User Management Section */}
                <Card className="lg:col-span-2 border-0 shadow-xl ring-1 ring-border/50">
                    <CardHeader className="border-b bg-muted/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold">Gestión de Usuarios</CardTitle>
                                <CardDescription>Visualiza y administra los roles de la comunidad UNIS.</CardDescription>
                            </div>
                            <div className="relative w-64 group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input placeholder="Buscar por email..." className="pl-10 h-9 text-xs" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border/40">
                            <UserRow name="Dra. Ana Valenzuela" email="ana.v@unis.edu.gt" role="publicador" status="active" />
                            <UserRow name="Carlos Mendizabal" email="carlos.m@unis.edu.gt" role="usuario" status="pending" />
                            <UserRow name="Roberto Gomez" email="rgomez@unis.edu.gt" role="admin" status="active" />
                            <UserRow name="Lucia Perez" email="lperez@unis.edu.gt" role="usuario" status="active" />
                        </div>
                        <div className="p-4 bg-muted/10 text-center">
                            <Button variant="link" className="font-bold text-xs gap-2">
                                Ver todos los usuarios <ArrowRight className="h-3 w-3" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* System Health */}
                <Card className="border-0 shadow-xl ring-1 ring-border/50 bg-card/50">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Estado del Sistema</CardTitle>
                        <CardDescription>Monitorización en tiempo real.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <HealthItem label="Base de Datos (Supabase)" status="Online" color="bg-green-500" />
                        <HealthItem label="Storage Bucket (S3)" status="Online" color="bg-green-500" />
                        <HealthItem label="Auth Service" status="Online" color="bg-green-500" />
                        <HealthItem label="Edge Functions" status="Idle" color="bg-amber-500" />

                        <div className="pt-6 border-t border-dashed">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Métricas Críticas</p>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span>Almacenamiento Usado</span>
                                        <span>45%</span>
                                    </div>
                                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-primary w-[45%] rounded-full shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span>Límite de API (Monthly)</span>
                                        <span>12%</span>
                                    </div>
                                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 w-[12%] rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function AdminStatCard({ title, value, change, icon, color }: any) {
    return (
        <Card className="border-0 shadow-lg ring-1 ring-border/50 bg-card/60 backdrop-blur-md">
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="space-y-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</p>
                        <div>
                            <p className="text-3xl font-extrabold tracking-tight">{value}</p>
                            <p className="text-[10px] font-bold text-green-600 mt-1">{change}</p>
                        </div>
                    </div>
                    <div className={cn("p-4 rounded-2xl shadow-inner", color)}>
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function UserRow({ name, email, role, status }: any) {
    return (
        <div className="flex items-center justify-between p-4 hover:bg-primary/5 transition-colors group">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-bold text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    {name.substring(0, 2)}
                </div>
                <div>
                    <p className="text-sm font-bold">{name}</p>
                    <p className="text-xs text-muted-foreground">{email}</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tighter shadow-sm">{role}</Badge>
                <div className={cn("h-2 w-2 rounded-full", status === 'active' ? "bg-green-500" : "bg-amber-500")} />
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

function HealthItem({ label, status, color }: any) {
    return (
        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-transparent hover:border-border transition-all">
            <span className="text-xs font-bold text-muted-foreground">{label}</span>
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-foreground">{status}</span>
                <div className={cn("w-2 h-2 rounded-full shadow-[0_0_8px]", color)} />
            </div>
        </div>
    )
}
