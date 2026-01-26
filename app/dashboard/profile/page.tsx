// app/dashboard/profile/page.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import {
  User,
  Mail,
  Building,
  GraduationCap,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Settings,
  Bell,
  Shield,
  ChevronRight,
  ShieldCheck,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { useMyWorkspaceItems } from "@/lib/hooks"

const roleConfigs: any = {
  estudiante: { label: "Estudiante", color: "bg-blue-500", icon: GraduationCap },
  docente: { label: "Docente", color: "bg-amber-500", icon: GraduationCap },
  admin: { label: "Administrador", color: "bg-red-500", icon: ShieldCheck },
}

export default function ProfilePage() {
  const { user } = useAuth()
  const { data: submissions, isLoading: loadingItems } = useMyWorkspaceItems(user?.id)
  const [isEditing, setIsEditing] = useState(false)

  if (!user) return null

  const role = roleConfigs[user.role] || roleConfigs.estudiante
  const items = submissions || []

  const stats = {
    total: items.length,
    approved: items.filter((r: any) => r.status === "aprobado").length,
    pending: items.filter((r: any) => r.status === "en_revision" || r.status === 'pending').length,
    rejected: items.filter((r: any) => r.status === "rechazado").length,
  }

  const completionRate = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight">Configuración de Perfil</h1>
        <p className="text-muted-foreground">Administra tu identidad académica y preferencias de seguridad.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Identity Card */}
        <div className="space-y-6">
          <Card className="border-0 shadow-2xl ring-1 ring-border/50 overflow-hidden bg-card/60 backdrop-blur-md">
            <div className={`h-32 ${role.color} opacity-80 relative overflow-hidden`}>
              <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" />
              <div className="absolute -right-8 -bottom-8 opacity-20 rotate-12">
                <role.icon className="w-40 h-40 text-white" />
              </div>
            </div>
            <CardContent className="relative pt-0 px-6 pb-8">
              <div className="flex flex-col items-center -mt-16 text-center space-y-4">
                <Avatar className="h-32 w-32 border-8 border-background shadow-xl">
                  <AvatarImage src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                  <AvatarFallback className="text-3xl bg-primary text-primary-foreground font-bold">
                    {user.fullName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight">{user.fullName}</h2>
                  <Badge className={`${role.color} text-white font-bold border-0 px-3 py-1`}>
                    {role.label}
                  </Badge>
                  <p className="text-sm text-muted-foreground font-medium">{user.email}</p>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-dashed space-y-4">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  <span>Progreso Académico</span>
                  <span>{completionRate}%</span>
                </div>
                <Progress value={completionRate} className="h-2 bg-muted shadow-inner" />
                <p className="text-[10px] text-center text-muted-foreground leading-relaxed italic">
                  Basado en tus investigaciones aprobadas vs enviadas.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl ring-1 ring-border/50 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-tighter">Acceso Institucional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Building className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Facultad</p>
                  <p className="text-sm font-bold truncate">Universidad del Istmo</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Miembro desde</p>
                  <p className="text-sm font-bold">Enero 2026</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Details & Settings */}
        <div className="lg:col-span-2 space-y-8">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="bg-muted/50 p-1 h-12 flex w-full max-w-[400px]">
              <TabsTrigger value="info" className="flex-1 font-bold gap-2"><User className="h-4 w-4" /> Datos</TabsTrigger>
              <TabsTrigger value="activity" className="flex-1 font-bold gap-2"><FileText className="h-4 w-4" /> Actividad</TabsTrigger>
              <TabsTrigger value="security" className="flex-1 font-bold gap-2"><Shield className="h-4 w-4" /> Seguridad</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-6 animate-in slide-in-from-bottom-2">
              <Card className="border-0 shadow-xl ring-1 ring-border/50">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold">Perfil Personal</CardTitle>
                    <CardDescription>Actualiza tus datos de contacto.</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)} className="font-bold border-primary/20 bg-primary/5">
                    {isEditing ? "Guardar" : "Modificar"}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest opacity-60">Nombre</Label>
                      <Input defaultValue={user.firstName} disabled={!isEditing} className="h-11 font-medium" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest opacity-60">Apellido</Label>
                      <Input defaultValue={user.lastName} disabled={!isEditing} className="h-11 font-medium" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest opacity-60">Correo Institucional</Label>
                    <Input defaultValue={user.email} disabled className="h-11 font-mono text-sm bg-muted/50" />
                    <p className="text-[10px] text-muted-foreground italic flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-green-500" /> Gestionado por Universidad del Istmo Auth
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="mt-6 animate-in slide-in-from-bottom-2">
              <Card className="border-0 shadow-xl ring-1 ring-border/50">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Historial de Investigaciones</CardTitle>
                  <CardDescription>Resumen de tus últimas contribuciones.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {loadingItems ? (
                    <div className="py-20 flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-xs font-bold text-muted-foreground uppercase">Consultando...</p>
                    </div>
                  ) : items.length > 0 ? (
                    <div className="divide-y divide-border/40">
                      {items.slice(0, 5).map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between p-4 hover:bg-primary/5 transition-colors group">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="bg-background border p-2 rounded-lg group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold truncate pr-4">{item.title}</p>
                              <p className="text-[10px] text-muted-foreground uppercase font-bold">{new Date(item.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <Badge variant={item.status === 'aprobado' ? 'default' : 'secondary'} className="font-bold text-[10px] shrink-0 uppercase">
                            {item.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-20 text-center">
                      <p className="text-muted-foreground">No hay actividad registrada aún.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="mt-6 animate-in slide-in-from-bottom-2">
              <div className="grid gap-6">
                <Card className="border-0 shadow-xl ring-1 ring-border/50">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg font-bold">Notificaciones</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-bold">Alertas de Revisión</p>
                        <p className="text-xs text-muted-foreground">Notificar cuando un docente evalúe mi trabajo.</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator className="opacity-40" />
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-bold">Actualizaciones Institucionales</p>
                        <p className="text-xs text-muted-foreground">Boletines y anuncios de la biblioteca.</p>
                      </div><div>

                        <p className="text-xs text-muted-foreground">V.0.0.2</p>
                      </div>
                      <Switch />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-xl ring-1 ring-border/50 bg-destructive/5">
                  <CardHeader>
                    <div className="flex items-center gap-3 text-destructive">
                      <Shield className="h-5 w-5" />
                      <CardTitle className="text-lg font-bold">Seguridad Avanzada</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full justify-between font-bold border-destructive/20 text-destructive hover:bg-destructive/5">
                      Cambiar Contraseña
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="w-full justify-between font-bold border-destructive/20 text-destructive hover:bg-destructive/5">
                      Cerrar todas las sesiones
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
