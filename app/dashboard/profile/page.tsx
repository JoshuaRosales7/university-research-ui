
"use client"

import { useState, useEffect } from "react"
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
  Shield,
  ChevronRight,
  ShieldCheck,
  Loader2,
  PenLine,
  LogOut,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  Bell,
  Camera,
  Globe,
  Download,
  BookOpen
} from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"

// ... (existing imports, before or alongside other component imports)

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
// import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth-context"
import { useMyWorkspaceItems } from "@/lib/hooks"
import { cn } from "@/lib/utils"
// Import AlertDialog components
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { supabase, supabaseQuery } from "@/lib/supabase"
import { toast } from "sonner"

const roleConfigs: any = {
  estudiante: { label: "Estudiante", class: "bg-blue-100 text-blue-700 border-blue-200", icon: GraduationCap },
  docente: { label: "Docente", class: "bg-amber-100 text-amber-700 border-amber-200", icon: SchoolIcon },
  admin: { label: "Administrador", class: "bg-red-100 text-red-700 border-red-200", icon: ShieldCheck },
}

// Helper component for icon just to avoid reference errors if School is not imported
function SchoolIcon(props: any) {
  return <Building {...props} />
}

export default function ProfilePage() {
  const { user, logout, refreshUser } = useAuth()
  const { data: submissions, isLoading: loadingItems } = useMyWorkspaceItems(user?.id)

  // UI States
  const [isEditing, setIsEditing] = useState(false)
  const [loadingMetadata, setLoadingMetadata] = useState(true)

  // Data States
  const [extendedData, setExtendedData] = useState<{
    bio: string
    website: string
    interests: string
    avatarUrl: string
    notifications: boolean
    orcidId: string | null
    isPublic: boolean
  }>({
    bio: "",
    website: "",
    interests: "",
    avatarUrl: "",
    notifications: true,
    orcidId: null,
    isPublic: true
  })

  // Modals
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false)
  const [isSessionAlertOpen, setIsSessionAlertOpen] = useState(false)

  // Form States
  const [passwordData, setPasswordData] = useState({ newPassword: "", confirmPassword: "" })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [sessionLoading, setSessionLoading] = useState(false)
  const [avatarInput, setAvatarInput] = useState("")

  // Social Stats State
  const [socialStats, setSocialStats] = useState({ followers: 0, following: 0, likes: 0 })

  // Fetch Metadata on Load
  useEffect(() => {
    async function fetchMetadata() {
      if (!user) return

      try {
        // Get basic auth metadata
        const { data: authData } = await supabase.auth.getUser()

        // Get advanced profile data (including is_public)
        const { data: profileData } = await supabaseQuery(() =>
          supabase
            .from('profiles')
            .select('is_public')
            .eq('id', user.id)
            .single()
        )

        // Get Social Stats
        // Usamos supabaseQuery para cada llamada individual dentro de Promise.all
        // para aprovechar los retries automáticos en paralelo
        const [investigationsRes] = await Promise.all([
          // supabaseQuery(() => supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', user.id)),
          // supabaseQuery(() => supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', user.id)),
          supabaseQuery(() => supabase.from('investigations').select('id').eq('owner_id', user.id))
        ])

        // Calculate total likes for user's investigations
        let totalLikes = 0;
        if (investigationsRes.data && investigationsRes.data.length > 0) {
          const investIds = investigationsRes.data.map(i => i.id);
          const { count } = await supabase
            .from('research_likes')
            .select('*', { count: 'exact', head: true })
            .in('investigation_id', investIds);
          totalLikes = count || 0;
        }

        setSocialStats({
          followers: 0,
          following: 0,
          likes: totalLikes
        })

        if (authData.user) {
          setExtendedData({
            bio: authData.user.user_metadata?.bio || "",
            website: authData.user.user_metadata?.website || "",
            interests: authData.user.user_metadata?.interests || "",
            avatarUrl: authData.user.user_metadata?.avatar_url || user.avatarUrl || "",
            notifications: authData.user.user_metadata?.notifications ?? true,
            orcidId: authData.user.user_metadata?.orcid_id || null,
            isPublic: profileData?.is_public ?? true
          })
          setAvatarInput(authData.user.user_metadata?.avatar_url || user.avatarUrl || "")
        }
      } catch (e) {
        console.error("Error fetching metadata", e)
      }
      setLoadingMetadata(false)
    }
    fetchMetadata()
  }, [user])

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

  // -- HANDLERS --

  const handleSaveProfile = async () => {
    if (!isEditing) {
      setIsEditing(true)
      return
    }

    // Save logic
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          bio: extendedData.bio,
          website: extendedData.website,
          interests: extendedData.interests
        }
      })
      if (error) throw error

      // Also update 'profiles' table for public visibility
      await supabase.from('profiles').update({
        bio: extendedData.bio,
        website: extendedData.website,
        interests: extendedData.interests,
        full_name: `${user.firstName} ${user.lastName}`
      }).eq('id', user.id)

      await refreshUser() // Refresh context
      setIsEditing(false)
      toast.success("Perfil actualizado correctamente")
    } catch (err) {
      console.error("Error updating profile", err)
      toast.error("Error al guardar cambios")
    }
  }

  const handleAvatarUpdate = async () => {
    if (!avatarInput) return
    try {
      const { error } = await supabase.auth.updateUser({
        data: { avatar_url: avatarInput }
      })
      if (error) throw error

      await supabase.from('profiles').update({
        avatar_url: avatarInput
      }).eq('id', user.id)

      setExtendedData(prev => ({ ...prev, avatarUrl: avatarInput }))
      await refreshUser()
      setIsAvatarModalOpen(false)
      toast.success("Avatar actualizado")
    } catch (error) {
      console.error("Avatar update error", error)
      toast.error("No se pudo actualizar el avatar")
    }
  }

  const handleRandomizeAvatar = () => {
    const seed = Math.random().toString(36).substring(7)
    setAvatarInput(`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`)
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError("")
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Las contraseñas no coinciden.")
      return
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres.")
      return
    }
    setPasswordLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword })
      if (error) throw error
      setIsPasswordModalOpen(false)
      setPasswordData({ newPassword: "", confirmPassword: "" })
      alert("Contraseña actualizada correctamente.")
    } catch (err: any) {
      setPasswordError(err.message || "Error al actualizar contraseña")
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleCloseSessions = async () => {
    setSessionLoading(true)
    try {
      await supabase.auth.signOut({ scope: 'global' })
      window.location.href = '/login'
    } catch (error) {
      console.error("Error closing sessions:", error)
      await logout()
    } finally {
      setSessionLoading(false)
    }
  }

  const handleDownloadData = () => {
    const data = {
      user: user,
      metadata: extendedData,
      stats: stats,
      submissions: items
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `unis-profile-data-${user.id}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Mi Perfil
          </h1>
          <p className="text-muted-foreground text-lg">
            Gestiona tu identidad académica y preferencias.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button variant="outline" className="rounded-xl font-bold border-destructive/20 text-destructive hover:bg-destructive/5 gap-2" onClick={() => logout()}>
            <LogOut className="h-4 w-4" /> Cerrar Sesión
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column: Identity Card (4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-0 shadow-lg ring-1 ring-border/50 overflow-hidden relative rounded-3xl group">
            {/* Decorative background gradient */}
            <div className={`absolute top-0 inset-x-0 h-32 bg-gradient-to-b ${user.role === 'admin' ? 'from-red-500/10' : user.role === 'docente' ? 'from-amber-500/10' : 'from-blue-500/10'} to-transparent`} />

            <CardContent className="relative pt-12 px-6 pb-8 flex flex-col items-center text-center space-y-4">
              <div className="relative group/avatar cursor-pointer" onClick={() => setIsAvatarModalOpen(true)}>
                <Avatar className="h-32 w-32 border-4 border-background shadow-2xl ring-4 ring-border/20 transition-transform group-hover/avatar:scale-105">
                  <AvatarImage src={extendedData.avatarUrl || user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                  <AvatarFallback className="text-3xl bg-primary/10 text-primary font-bold">
                    {user.fullName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="h-8 w-8 text-white" />
                </div>
                <div className="absolute bottom-1 right-1 bg-background rounded-full p-1 shadow-md pointer-events-none">
                  <div className={cn("p-1.5 rounded-full", role.class)}>
                    <role.icon className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <div className="space-y-1 w-full">
                <h2 className="text-2xl font-black tracking-tight">{user.fullName}</h2>
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
                  <Mail className="h-3 w-3" /> {user.email}
                </div>
                {extendedData.website && (
                  <a href={extendedData.website} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1 text-xs text-primary hover:underline pt-1">
                    <Globe className="h-3 w-3" /> {new URL(extendedData.website).hostname}
                  </a>
                )}
                <div className="pt-2">
                  <Badge variant="secondary" className={cn("font-bold uppercase tracking-wider text-[10px] px-3 py-1", role.class)}>
                    {role.label}
                  </Badge>
                </div>
              </div>

              {/* Bio Preview */}
              {extendedData.bio && (
                <div className="w-full text-xs text-muted-foreground italic line-clamp-3 px-4">
                  "{extendedData.bio}"
                </div>
              )}

              <div className="grid grid-cols-1 gap-2 w-full pt-4">
                {/* 
                <div className="text-center p-2 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-default group/stat">
                  <p className="text-lg font-black group-hover/stat:scale-110 transition-transform duration-300">{socialStats.followers}</p>
                  <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Seguidores</p>
                </div>
                <div className="text-center p-2 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-default group/stat">
                  <p className="text-lg font-black group-hover/stat:scale-110 transition-transform duration-300">{socialStats.following}</p>
                  <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Seguidos</p>
                </div>
                */}
                <div className="text-center p-2 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-default group/stat">
                  <p className="text-lg font-black text-pink-500 group-hover/stat:scale-110 transition-transform duration-300">{socialStats.likes}</p>
                  <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Me Gusta</p>
                </div>
              </div>

              <div className="w-full pt-6 mt-6 border-t border-dashed space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground text-center">Investigaciones</h4>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="flex flex-col gap-1">
                    <span className="text-2xl font-black">{stats.total}</span>
                    <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Total</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-2xl font-black text-emerald-600">{stats.approved}</span>
                    <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Aprobadas</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-2xl font-black text-amber-600">{stats.pending}</span>
                    <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Pendientes</span>
                  </div>
                </div>
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Sparkles className="h-3 w-3 text-primary" /> Eficiencia</span>
                    <span>{completionRate}%</span>
                  </div>
                  <Progress value={completionRate} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md ring-1 ring-border/50 rounded-3xl overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4 border-b">
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Building className="h-4 w-4" /> Institución
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/40">
                <div className="p-4 flex items-center gap-4 hover:bg-muted/20 transition-colors">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Building className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Facultad</p>
                    <p className="text-sm font-bold">Universidad del Istmo</p>
                  </div>
                </div>
                <div className="p-4 flex items-center gap-4 hover:bg-muted/20 transition-colors">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Miembro desde</p>
                    <p className="text-sm font-bold">Enero 2026</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Details & Settings (8 columns) */}
        <div className="lg:col-span-8 space-y-8">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="bg-card border shadow-sm p-1 h-14 w-full justify-start rounded-2xl gap-1 overflow-x-auto">
              <TabsTrigger value="info" className="h-11 rounded-xl font-bold gap-2 min-w-[140px] px-4 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"><User className="h-4 w-4" /> Información Personal</TabsTrigger>
              <TabsTrigger value="activity" className="h-11 rounded-xl font-bold gap-2 min-w-[140px] px-4 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"><FileText className="h-4 w-4" /> Historial</TabsTrigger>
              <TabsTrigger value="security" className="h-11 rounded-xl font-bold gap-2 min-w-[140px] px-4 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"><Shield className="h-4 w-4" /> Ajustes de Cuenta</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-6 animate-in slide-in-from-bottom-2 space-y-6">
              <Card className="border-0 shadow-lg ring-1 ring-border/50 rounded-3xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
                  <div>
                    <CardTitle className="text-lg font-black uppercase tracking-tight">Datos de Contacto</CardTitle>
                    <CardDescription>Información pública y privada.</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleSaveProfile} className={cn("font-bold gap-2 rounded-xl transition-all", isEditing ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-primary/10 hover:text-primary")}>
                    {isEditing ? <CheckCircle className="h-4 w-4" /> : <PenLine className="h-4 w-4" />}
                    {isEditing ? "Guardar Cambios" : "Editar Información"}
                  </Button>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {loadingMetadata ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground" /></div>
                  ) : (
                    <>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Nombre</Label>
                          <Input defaultValue={user.firstName} disabled className="h-12 rounded-xl font-medium bg-muted/20" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Apellido</Label>
                          <Input defaultValue={user.lastName} disabled className="h-12 rounded-xl font-medium bg-muted/20" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Biografía</Label>
                        <Textarea
                          placeholder="Escribe algo sobre ti..."
                          className="rounded-xl resize-none min-h-[100px]"
                          disabled={!isEditing}
                          value={extendedData.bio}
                          onChange={(e) => setExtendedData(prev => ({ ...prev, bio: e.target.value }))}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Sitio Web / LinkedIn</Label>
                          <div className="relative">
                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              className="pl-11 h-12 rounded-xl"
                              placeholder="https://..."
                              disabled={!isEditing}
                              value={extendedData.website}
                              onChange={(e) => setExtendedData(prev => ({ ...prev, website: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Áreas de Interés</Label>
                          <div className="relative">
                            <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              className="pl-11 h-12 rounded-xl"
                              placeholder="Investigación, IA, Diseño..."
                              disabled={!isEditing}
                              value={extendedData.interests}
                              onChange={(e) => setExtendedData(prev => ({ ...prev, interests: e.target.value }))}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-dashed">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Identidad Académica</Label>
                        <div className="flex items-center justify-between p-4 bg-muted/20 border border-muted/50 rounded-xl">
                          <div className="flex items-center gap-3">
                            {extendedData.orcidId ? (
                              <div className="h-10 w-10 bg-[#A6CE39]/10 rounded-lg flex items-center justify-center animate-in zoom-in duration-300">
                                <svg viewBox="0 0 256 256" className="h-6 w-6 text-[#A6CE39] fill-current">
                                  <path d="M128,0C57.307,0,0,57.307,0,128s57.307,128,128,128s128-57.307,128-128S198.693,0,128,0z M128,245.024 c-64.53,0-117.024-52.494-117.024-117.024S63.47,10.976,128,10.976S245.024,63.47,245.024,128S192.53,245.024,128,245.024z M70.627,87.489c0-8.627,6.993-15.62,15.62-15.62c8.631,0,15.624,6.992,15.624,15.62c0,8.627-6.993,15.62-15.624,15.62 C77.62,103.11,70.627,96.116,70.627,87.489z M76.224,204.032h20.457V121.78H76.224V204.032z M171.491,121.78h-55.83v82.253h20.457 v-30.82h35.373c19.168,0,32.073-12.783,32.073-25.717C203.565,134.563,190.658,121.78,171.491,121.78z M156.401,155.86h-19.663v-17.727 h19.663c7.749,0,12.721,4.406,12.721,8.863C169.122,151.454,164.151,155.86,156.401,155.86z" />
                                </svg>
                              </div>
                            ) : (
                              <div className="h-10 w-10 bg-muted/50 rounded-lg flex items-center justify-center">
                                <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/20" />
                              </div>
                            )}
                            <div className="space-y-0.5">
                              <p className="text-sm font-bold flex items-center gap-2">
                                ORCID iD
                                {extendedData.orcidId &&
                                  <Badge variant="outline" className="text-[9px] bg-[#A6CE39]/10 text-[#A6CE39] border-[#A6CE39]/20 animate-in fade-in slide-in-from-left-2 duration-500">
                                    CONECTADO
                                  </Badge>
                                }
                              </p>
                              <p className="text-xs text-muted-foreground transition-all duration-300">
                                {extendedData.orcidId ? (
                                  <span className="font-mono text-[10px] tracking-wide">{extendedData.orcidId}</span>
                                ) : (
                                  "Conecta tu perfil investigador para mayor visibilidad."
                                )}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant={extendedData.orcidId ? "outline" : "default"}
                            className={cn(
                              "text-xs font-bold h-9 transition-all duration-300",
                              !extendedData.orcidId && "bg-[#A6CE39] hover:bg-[#A6CE39]/90 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5",
                              extendedData.orcidId && "hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                            )}
                            onClick={async () => {
                              if (extendedData.orcidId) {
                                // Disconnect logic
                                setExtendedData(prev => ({ ...prev, orcidId: null }))
                                await supabase.auth.updateUser({
                                  data: { orcid_id: null }
                                })
                                toast.success("Perfil desconectado", {
                                  description: "Se ha desvinculado tu cuenta ORCID."
                                })
                              } else {
                                // Connect logic
                                const loadingToast = toast.loading("Conectando con ORCID...")
                                try {
                                  const { connectOrcidProfile } = await import('@/lib/integrations');
                                  const result = await connectOrcidProfile();

                                  setExtendedData(prev => ({ ...prev, orcidId: result.orcidId }))
                                  // Update supabase user metadata
                                  await supabase.auth.updateUser({
                                    data: { orcid_id: result.orcidId }
                                  })

                                  toast.dismiss(loadingToast)
                                  toast.success("¡Conexión Exitosa!", {
                                    description: `Bienvenido, ${result.name}. Tu perfil académico ahora está verificado.`,
                                    icon: "✨"
                                  })
                                } catch (e) {
                                  console.error(e)
                                  toast.dismiss(loadingToast)
                                  toast.error("Error de conexión", {
                                    description: "No se pudo verificar tu cuenta ORCID."
                                  })
                                }
                              }
                            }}
                          >
                            {extendedData.orcidId ? "Desconectar" : "Conectar ORCID"}
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="mt-6 animate-in slide-in-from-bottom-2">
              <Card className="border-0 shadow-lg ring-1 ring-border/50 rounded-3xl overflow-hidden">
                <CardHeader className="bg-muted/30 border-b pb-4">
                  <CardTitle className="text-lg font-black uppercase tracking-tight">Actividad Reciente</CardTitle>
                  <CardDescription>Registro de tus investigaciones enviadas.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {loadingItems ? (
                    <div className="py-20 flex flex-col items-center gap-4">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Cargando historial...</p>
                    </div>
                  ) : items.length > 0 ? (
                    <div className="divide-y divide-border/40">
                      {items.map((item: any) => (
                        <div key={item.id} className="group flex items-center justify-between p-6 hover:bg-muted/30 transition-all">
                          <div className="flex items-start gap-4">
                            <div className="mt-1 h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold shadow-sm group-hover:scale-110 transition-transform">
                              {item.status === 'aprobado' ? <CheckCircle className="h-5 w-5" /> :
                                item.status === 'rechazado' ? <ShieldCheck className="h-5 w-5" /> :
                                  <Clock className="h-5 w-5" />}
                            </div>
                            <div className="space-y-1">
                              <Link href={`/dashboard/research/${item.id}`} className="block font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                {item.title}
                              </Link>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1 font-medium"><Calendar className="h-3 w-3" /> {new Date(item.created_at).toLocaleDateString()}</span>
                                <span className="font-bold">•</span>
                                <span className="uppercase font-bold tracking-wider text-[10px]">{item.work_type || "Investigación"}</span>
                              </div>
                            </div>
                          </div>
                          <Badge variant={item.status === 'aprobado' ? 'default' : 'secondary'} className="hidden sm:flex h-7 px-3 rounded-lg font-bold text-[10px] shrink-0 uppercase tracking-wide">
                            {item.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-20 text-center space-y-4">
                      <div className="mx-auto h-16 w-16 bg-muted rounded-full flex items-center justify-center opacity-50">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-lg font-bold">Sin actividad</p>
                        <p className="text-sm text-muted-foreground max-w-xs mx-auto">No has enviado ninguna investigación todavía.</p>
                      </div>
                      <Button asChild className="rounded-xl font-bold">
                        <Link href="/dashboard/submit">Crear Nueva</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="mt-6 animate-in slide-in-from-bottom-2 space-y-6">
              <Card className="border-0 shadow-lg ring-1 ring-border/50 rounded-3xl overflow-hidden">
                <CardHeader className="bg-muted/30 border-b pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <Bell className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-black uppercase tracking-tight">Notificaciones</CardTitle>
                      <CardDescription>Controla qué alertas recibes.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="divide-y divide-border/40 p-0">
                  <div className="flex items-center justify-between p-6 hover:bg-muted/20 transition-colors">
                    <div className="space-y-0.5">
                      <p className="font-bold text-sm flex items-center gap-2">
                        {extendedData.isPublic ? <Globe className="h-4 w-4 text-emerald-500" /> : <Lock className="h-4 w-4 text-amber-500" />}
                        Visibilidad del Perfil
                      </p>
                      <p className="text-xs text-muted-foreground font-medium">
                        {extendedData.isPublic ? "Tu perfil es público para todos." : "Solo tú puedes ver tu perfil completo."}
                      </p>
                    </div>
                    <Switch
                      checked={extendedData.isPublic}
                      onCheckedChange={async (val) => {
                        setExtendedData(prev => ({ ...prev, isPublic: val }));
                        try {
                          // Update profiles table
                          await supabase.from('profiles').update({ is_public: val }).eq('id', user.id);
                          toast.success(val ? "Perfil ahora es público" : "Perfil ahora es privado", {
                            icon: val ? "🌍" : "🔒"
                          });
                        } catch (err) {
                          console.error("Error updating visibility", err);
                          setExtendedData(prev => ({ ...prev, isPublic: !val })); // Revert
                          toast.error("Error al actualizar visibilidad");
                        }
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between p-6 hover:bg-muted/20 transition-colors">
                    <div className="space-y-0.5">
                      <p className="font-bold text-sm">Alertas de Revisión</p>
                      <p className="text-xs text-muted-foreground font-medium">Recibir email cuando evalúen mi tesis.</p>
                    </div>
                    <Switch
                      checked={extendedData.notifications}
                      onCheckedChange={async (val) => {
                        setExtendedData(prev => ({ ...prev, notifications: val }));
                        try {
                          const { error } = await supabase.auth.updateUser({
                            data: { notifications: val }
                          });
                          if (error) throw error;
                        } catch (err) {
                          console.error("Error updating notifications", err);
                          // Revert on error
                          setExtendedData(prev => ({ ...prev, notifications: !val }));
                        }
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between p-6 hover:bg-muted/20 transition-colors">
                    <div className="space-y-0.5">
                      <p className="font-bold text-sm">Copia de Seguridad de Datos</p>
                      <p className="text-xs text-muted-foreground font-medium">Descargar una copia de toda mi actividad.</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleDownloadData} className="gap-2 font-bold rounded-lg h-9">
                      <Download className="h-3.5 w-3.5" /> Descargar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg ring-1 ring-border/50 rounded-3xl overflow-hidden bg-destructive/5 hover:bg-destructive/10 transition-colors border-destructive/10">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 text-destructive">
                    <div className="p-2 bg-destructive/10 rounded-lg">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-black uppercase tracking-tight">Zona de Seguridad</CardTitle>
                      <CardDescription className="text-destructive/70">Opciones avanzadas de cuenta.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 p-6 pt-0">
                  <Button
                    variant="outline"
                    className="w-full justify-between font-bold h-12 rounded-xl border-destructive/20 text-destructive bg-background hover:bg-destructive hover:text-white transition-all shadow-sm group"
                    onClick={() => setIsPasswordModalOpen(true)}
                  >
                    Cambiar Contraseña
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-between font-bold h-12 rounded-xl border-destructive/20 text-destructive bg-background hover:bg-destructive hover:text-white transition-all shadow-sm group"
                    onClick={() => setIsSessionAlertOpen(true)}
                  >
                    Cerrar Sesiones Activas
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Password Change Dialog */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Cambiar Contraseña</DialogTitle>
            <DialogDescription>
              Ingresa tu nueva contraseña. Esta acción cerrará tu sesión actual.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordChange} className="space-y-4 pt-4">
            {passwordError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-destructive text-sm font-medium">
                <AlertTriangle className="h-4 w-4" /> {passwordError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nueva Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="pl-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsPasswordModalOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={passwordLoading}>
                {passwordLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Actualizar Contraseña
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change Avatar Dialog */}
      <Dialog open={isAvatarModalOpen} onOpenChange={setIsAvatarModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Actualizar Foto de Perfil</DialogTitle>
            <DialogDescription>
              Ingresa la URL de tu imagen o genera un avatar aleatorio.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="flex justify-center">
              <Avatar className="h-24 w-24 border-4 border-background shadow-xl ring-2 ring-border/20">
                <AvatarImage src={avatarInput} />
                <AvatarFallback className="text-xl font-bold">PV</AvatarFallback>
              </Avatar>
            </div>
            <div className="space-y-2">
              <Label>URL de la Imagen</Label>
              <div className="flex gap-2">
                <Input
                  value={avatarInput}
                  onChange={(e) => setAvatarInput(e.target.value)}
                  placeholder="https://..."
                  className="rounded-xl"
                />
                <Button variant="outline" size="icon" onClick={handleRandomizeAvatar} title="Generar Aleatorio" className="rounded-xl shrink-0">
                  <Sparkles className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">Sugerencia: Usa imágenes cuadradas para mejor resultado.</p>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsAvatarModalOpen(false)}>Cancelar</Button>
              <Button type="button" onClick={handleAvatarUpdate}>
                Guardar Foto
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>


      {/* Close Sessions Alert */}
      <AlertDialog open={isSessionAlertOpen} onOpenChange={setIsSessionAlertOpen}>
        <AlertDialogContent className="rounded-2xl border-0 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-destructive flex items-center gap-2">
              <Shield className="h-5 w-5" /> Cerrar Todas las Sesiones
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción cerrará tu sesión en todos los dispositivos donde hayas iniciado. ¿Estás seguro de continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl font-bold">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleCloseSessions(); }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl font-bold"
              disabled={sessionLoading}
            >
              {sessionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Cerrar Sesiones
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
