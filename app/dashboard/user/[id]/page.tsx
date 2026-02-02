
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
    Mail,
    Building,
    GraduationCap,
    Calendar,
    FileText,
    CheckCircle,
    Clock,
    ShieldCheck,
    Loader2,
    Globe,
    BookOpen,
    User,
    Lock
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { supabase, supabaseQuery } from "@/lib/supabase"
import { cn } from "@/lib/utils"

const roleConfigs: any = {
    estudiante: { label: "Estudiante", class: "bg-blue-100 text-blue-700 border-blue-200", icon: GraduationCap },
    docente: { label: "Docente", class: "bg-amber-100 text-amber-700 border-amber-200", icon: Building }, // Use Building as fallback
    admin: { label: "Administrador", class: "bg-red-100 text-red-700 border-red-200", icon: ShieldCheck },
}

export default function PublicProfilePage() {
    const params = useParams()
    const userId = params.id as string
    const { user: currentUser } = useAuth()

    const [profile, setProfile] = useState<any>(null)
    const [investigations, setInvestigations] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({ followers: 0, following: 0 })
    const [isFollowing, setIsFollowing] = useState(false)
    const [followLoading, setFollowLoading] = useState(false)

    async function fetchProfileData() {
        if (!userId) return

        setLoading(true)
        try {
            // 1. Fetch Profile Info
            const { data: profileData, error: profileError } = await supabaseQuery(() =>
                supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single()
            )

            if (profileError || !profileData) throw profileError || new Error("Profile not found")
            setProfile(profileData)

            // 2. Fetch Stats & Graph
            const [followersRes, followingRes, isFollowingRes] = await Promise.all([
                supabaseQuery(() => supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId)),
                supabaseQuery(() => supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId)),
                currentUser ? supabaseQuery(() => supabase.from('follows').select('*').eq('follower_id', currentUser.id).eq('following_id', userId).single()) : Promise.resolve({ data: null, error: null })
            ])

            setStats({
                followers: followersRes.count || 0,
                following: followingRes.count || 0
            })
            setIsFollowing(!!isFollowingRes.data)

            // 3. Fetch Public Investigations (only if public or isMe)
            if (profileData.is_public || currentUser?.id === userId) {
                const { data: items, error: researchError } = await supabaseQuery(() =>
                    supabase
                        .from('investigations')
                        .select('*')
                        .eq('owner_id', userId)
                        .eq('status', 'aprobado')
                        .order('created_at', { ascending: false })
                )

                if (researchError) throw researchError
                setInvestigations(items || [])
            }

        } catch (err) {
            console.error("Error fetching public profile", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProfileData()
    }, [userId, currentUser])

    const handleFollowToggle = async () => {
        if (!currentUser) return;
        setFollowLoading(true);
        try {
            if (isFollowing) {
                await supabase.from('follows').delete().eq('follower_id', currentUser.id).eq('following_id', userId);
                setStats(prev => ({ ...prev, followers: prev.followers - 1 }));
            } else {
                await supabase.from('follows').insert({ follower_id: currentUser.id, following_id: userId });
                setStats(prev => ({ ...prev, followers: prev.followers + 1 }));

                // Send Notification
                if (userId !== currentUser.id) {
                    await supabase.from('notifications').insert({
                        user_id: userId,
                        actor_id: currentUser.id,
                        type: 'follow',
                        title: 'Nuevo Seguidor',
                        message: `${currentUser.fullName || 'Un usuario'} ha comenzado a seguirte.`,
                        reference_id: currentUser.id // Link to follower profile
                    });
                }
            }
            setIsFollowing(!isFollowing);
        } catch (error) {
            console.error("Error toogling follow", error);
        } finally {
            setFollowLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Cargando perfil...</p>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <div className="bg-muted p-6 rounded-full">
                    <User className="h-12 w-12 text-muted-foreground" />
                </div>
                <h1 className="text-2xl font-bold">Perfil no encontrado</h1>
                <p className="text-muted-foreground max-w-md">El usuario que buscas no existe o no tiene un perfil público activo.</p>
                <Button asChild variant="outline">
                    <Link href="/dashboard">Volver al Inicio</Link>
                </Button>
            </div>
        )
    }

    const role = roleConfigs[profile.role] || roleConfigs.estudiante
    const isMe = currentUser?.id === profile.id
    const isPrivate = !profile.is_public && !isMe

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-16">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-2">
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                        Perfil Público
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Vista detallada del investigador.
                    </p>
                </div>
                <div className="flex gap-2">
                    {isMe ? (
                        <Button asChild className="rounded-xl font-bold gap-2">
                            <Link href="/dashboard/profile">Editar mi Perfil</Link>
                        </Button>
                    ) : (
                        <Button
                            onClick={handleFollowToggle}
                            disabled={followLoading}
                            variant={isFollowing ? "outline" : "default"}
                            className={cn("rounded-xl font-bold gap-2 min-w-[120px]", isFollowing && "border-destructive/30 hover:bg-destructive/10 hover:text-destructive hover:border-destructive")}
                        >
                            {followLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isFollowing ? "Dejar de seguir" : "Seguir"}
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-12">
                {/* Left Column: Identity Card (4 columns) */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="border-0 shadow-lg ring-1 ring-border/50 overflow-hidden relative rounded-3xl group">
                        {/* Decorative background gradient */}
                        <div className={`absolute top-0 inset-x-0 h-32 bg-gradient-to-b ${profile.role === 'admin' ? 'from-red-500/10' : profile.role === 'docente' ? 'from-amber-500/10' : 'from-blue-500/10'} to-transparent`} />

                        <CardContent className="relative pt-12 px-6 pb-8 flex flex-col items-center text-center space-y-4">
                            <div className="relative">
                                <Avatar className="h-32 w-32 border-4 border-background shadow-2xl ring-4 ring-border/20">
                                    <AvatarImage src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.email}`} />
                                    <AvatarFallback className="text-3xl bg-primary/10 text-primary font-bold">
                                        {(profile.full_name || "U")[0].toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute bottom-1 right-1 bg-background rounded-full p-1 shadow-md pointer-events-none">
                                    <div className={cn("p-1.5 rounded-full", role.class)}>
                                        <role.icon className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>

                            {/* Social Stats */}
                            <div className="grid grid-cols-2 gap-4 w-full pt-2">
                                <div className="text-center p-2 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                                    <p className="text-xl font-black">{stats.followers}</p>
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Seguidores</p>
                                </div>
                                <div className="text-center p-2 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                                    <p className="text-xl font-black">{stats.following}</p>
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Seguidos</p>
                                </div>
                            </div>

                            {isPrivate ? (
                                <div className="py-8 w-full">
                                    <div className="mx-auto h-16 w-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                                        <Lock className="h-8 w-8 text-amber-600" />
                                    </div>
                                    <h3 className="text-lg font-bold">Perfil Privado</h3>
                                    <p className="text-sm text-muted-foreground">Sigue a este usuario para ver su actividad.</p>
                                </div>
                            ) : (
                                <div className="space-y-1 w-full pt-4">
                                    <h2 className="text-2xl font-black tracking-tight">{profile.full_name || "Usuario"}</h2>
                                    {/* Email is typically private in public profiles unless explicitly shared, but let's show it if it's academic context */}
                                    <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
                                        <Mail className="h-3 w-3" /> {profile.email}
                                    </div>

                                    {profile.website && (
                                        <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1 text-xs text-primary hover:underline pt-1">
                                            <Globe className="h-3 w-3" /> {new URL(profile.website).hostname}
                                        </a>
                                    )}
                                    <div className="pt-2">
                                        <Badge variant="secondary" className={cn("font-bold uppercase tracking-wider text-[10px] px-3 py-1", role.class)}>
                                            {role.label}
                                        </Badge>
                                    </div>
                                </div>
                            )}

                            {/* Bio Preview */}
                            {!isPrivate && profile.bio && (
                                <div className="w-full text-xs text-muted-foreground italic line-clamp-3 px-4">
                                    "{profile.bio}"
                                </div>
                            )}

                            {/* ORCID badge if present */}
                            {!isPrivate && profile.orcid_id && (
                                <div className="pt-4 w-full">
                                    <div className="flex items-center justify-center p-3 bg-[#A6CE39]/5 border border-[#A6CE39]/20 rounded-xl gap-2">
                                        <svg viewBox="0 0 256 256" className="h-5 w-5 text-[#A6CE39] fill-current">
                                            <path d="M128,0C57.307,0,0,57.307,0,128s57.307,128,128,128s128-57.307,128-128S198.693,0,128,0z M128,245.024 c-64.53,0-117.024-52.494-117.024-117.024S63.47,10.976,128,10.976S245.024,63.47,245.024,128S192.53,245.024,128,245.024z M70.627,87.489c0-8.627,6.993-15.62,15.62-15.62c8.631,0,15.624,6.992,15.624,15.62c0,8.627-6.993,15.62-15.624,15.62 C77.62,103.11,70.627,96.116,70.627,87.489z M76.224,204.032h20.457V121.78H76.224V204.032z M171.491,121.78h-55.83v82.253h20.457 v-30.82h35.373c19.168,0,32.073-12.783,32.073-25.717C203.565,134.563,190.658,121.78,171.491,121.78z M156.401,155.86h-19.663v-17.727 h19.663c7.749,0,12.721,4.406,12.721,8.863C169.122,151.454,164.151,155.86,156.401,155.86z" />
                                        </svg>
                                        <div className="text-left">
                                            <p className="text-[10px] font-black text-[#A6CE39] uppercase tracking-wider">ORCID Verificado</p>
                                            <p className="text-[10px] font-mono text-muted-foreground">{profile.orcid_id}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {!isPrivate && (
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
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column: Research & Details (8 columns) */}
                <div className="lg:col-span-8 space-y-8">
                    {isPrivate ? (
                        <Card className="h-full border-0 shadow-none bg-transparent flex flex-col items-center justify-center p-12 text-center opacity-50">
                            <Lock className="h-16 w-16 text-muted-foreground mb-4" />
                            <h2 className="text-2xl font-bold">Contenido Privado</h2>
                            <p className="max-w-md mx-auto mt-2">Este usuario tiene su perfil configurado como privado. Debes solicitar seguirlo para ver su contenido.</p>
                        </Card>
                    ) : (
                        <Tabs defaultValue="activity" className="w-full">
                            <TabsList className="bg-card border shadow-sm p-1 h-14 w-full justify-start rounded-2xl gap-1 overflow-x-auto">
                                <TabsTrigger value="activity" className="h-11 rounded-xl font-bold gap-2 min-w-[140px] px-4 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"><FileText className="h-4 w-4" /> Publicaciones ({investigations.length})</TabsTrigger>
                                <TabsTrigger value="info" className="h-11 rounded-xl font-bold gap-2 min-w-[140px] px-4 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"><User className="h-4 w-4" /> Biografía y Detalles</TabsTrigger>
                            </TabsList>

                            <TabsContent value="activity" className="mt-6 animate-in slide-in-from-bottom-2">
                                <div className="space-y-4">
                                    {investigations.length > 0 ? (
                                        investigations.map((item) => (
                                            <Card key={item.id} className="border-0 shadow-md ring-1 ring-border/50 hover:ring-primary/30 transition-all rounded-2xl">
                                                <CardContent className="p-6">
                                                    <div className="flex items-start gap-4">
                                                        <div className="mt-1 h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 font-bold">
                                                            <CheckCircle className="h-5 w-5" />
                                                        </div>
                                                        <div className="space-y-2 flex-1">
                                                            <Link href={`/dashboard/research/${item.id}`} className="block text-lg font-bold hover:text-primary transition-colors">
                                                                {item.title}
                                                            </Link>
                                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                                {item.abstract}
                                                            </p>
                                                            <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground pt-2">
                                                                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(item.created_at).getFullYear()}</span>
                                                                {item.doi && (
                                                                    <span className="flex items-center gap-1 text-primary"><Globe className="h-3 w-3" /> DOI: {item.doi}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    ) : (
                                        <div className="py-20 text-center space-y-4 bg-muted/20 rounded-3xl border border-dashed">
                                            <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                                            <p className="text-muted-foreground font-medium">Este usuario no tiene investigaciones publicadas.</p>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="info" className="mt-6 animate-in slide-in-from-bottom-2 space-y-6">
                                <Card className="border-0 shadow-lg ring-1 ring-border/50 rounded-3xl">
                                    <CardHeader>
                                        <CardTitle>Sobre {profile.full_name}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {profile.bio ? (
                                            <p className="text-muted-foreground leading-relaxed">
                                                {profile.bio}
                                            </p>
                                        ) : (
                                            <p className="text-muted-foreground italic">Sin biografía disponible.</p>
                                        )}

                                        {profile.interests && (
                                            <div className="space-y-2">
                                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Intereses de Investigación</Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {profile.interests.split(',').map((tag: string, i: number) => (
                                                        <Badge key={i} variant="secondary" className="px-3 py-1 rounded-lg">
                                                            {tag.trim()}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    )}
                </div>
            </div>
        </div>
    )
}
