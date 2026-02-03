// app/dashboard/admin/users/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Search, Shield, GraduationCap, User, Loader2, ShieldAlert, TrendingUp, Lock, Unlock, AlertTriangle, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { getAdminUsersList } from "./actions"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface UserProfile {
    id: string
    email: string
    full_name: string
    role: string
    updated_at: string
    can_upload?: boolean
    investigation_count?: number
}

export default function AdminUsersPage() {
    const { user } = useAuth()
    const { toast } = useToast()
    const [users, setUsers] = useState<UserProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [roleFilter, setRoleFilter] = useState<string>("all")
    const [updatingUser, setUpdatingUser] = useState<string | null>(null)

    const isAdmin = user?.role === "admin"

    useEffect(() => {
        if (isAdmin) {
            fetchUsers()
        }
    }, [isAdmin])

    async function fetchUsers() {
        setLoading(true)
        try {
            // Fetch users via Server Action to get real Emails (requires Admin privileges)
            const data = await getAdminUsersList()
            setUsers(data)
        } catch (error) {
            console.error("Error fetching users:", error)
            toast({
                variant: "destructive",
                title: "Error de conexión",
                description: "No se pudieron cargar los usuarios."
            })
        } finally {
            setLoading(false)
        }
    }

    async function updateUserRole(userId: string, newRole: string) {
        const targetUser = users.find(u => u.id === userId)

        // Prevent changing other admins
        if (targetUser?.role === 'admin' && targetUser.id !== user?.id) {
            toast({
                variant: "destructive",
                title: "Acción Denegada",
                description: "Por seguridad, no puedes modificar el rol de otro administrador.",
            })
            return
        }

        setUpdatingUser(userId)
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId)

            if (error) throw error

            // Update local state optimistically or refresh
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))

            toast({
                title: "Rol Actualizado",
                description: (
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>El usuario ahora es <strong>{newRole}</strong></span>
                    </div>
                ),
            })
        } catch (error) {
            console.error("Error updating role:", error)
            toast({
                variant: "destructive",
                title: "Error al actualizar",
                description: "No se pudo cambiar el rol del usuario.",
            })
            // Revert changes if necessary (logic needs fetchUsers or deep state management to revert perfectly, 
            // but for role we usually rely on UI selector value matching state)
            await fetchUsers()
        } finally {
            setUpdatingUser(null)
        }
    }

    async function toggleUserUpload(userId: string, currentStatus: boolean = true) {
        const targetUser = users.find(u => u.id === userId)

        // Prevent blocking other admins
        if (targetUser?.role === 'admin' && targetUser.id !== user?.id) {
            toast({
                variant: "destructive",
                title: "Acción Denegada",
                description: "No es posible bloquear las subidas de un administrador.",
            })
            return
        }

        const oldStatus = users.find(u => u.id === userId)?.can_upload

        try {
            // Optimistic update
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, can_upload: !currentStatus } : u))

            const { error } = await supabase
                .from('profiles')
                .update({ can_upload: !currentStatus })
                .eq('id', userId)

            if (error) {
                // Revert on error
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, can_upload: oldStatus } : u))
                console.error("Error updating permissions:", error)
                toast({
                    variant: "destructive",
                    title: "Error al actualizar",
                    description: "Verifique permisos de base de datos.",
                })
                return
            }

            toast({
                // variant: !currentStatus ? "destructive" : "default", // Maybe simple default is better for success
                title: !currentStatus ? "Usuario Bloqueado" : "Usuario Habilitado",
                description: (
                    <div className="flex items-center gap-2">
                        {!currentStatus ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                        <span>{!currentStatus ? "El usuario ya no puede subir archivos." : "El usuario puede subir archivos nuevamente."}</span>
                    </div>
                )
            })
        } catch (error) {
            console.error("Error updating permissions:", error)
            // Revert
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, can_upload: oldStatus } : u))
            toast({
                variant: "destructive",
                title: "Error Inesperado",
                description: "Ocurrió un error al procesar la solicitud."
            })
        }
    }

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesRole = roleFilter === "all" || u.role === roleFilter
        return matchesSearch && matchesRole
    })

    const stats = {
        total: users.length,
        admins: users.filter(u => u.role === 'admin').length,
        publicadores: users.filter(u => u.role === 'publicador').length,
        usuarios: users.filter(u => u.role === 'usuario').length,
    }

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <div className="bg-destructive/10 p-6 rounded-full">
                    <ShieldAlert className="h-12 w-12 text-destructive" />
                </div>
                <h1 className="text-2xl font-bold">Acceso Restringido</h1>
                <p className="text-muted-foreground max-w-md">
                    Solo administradores pueden acceder a la gestión de usuarios.
                </p>
                <Button asChild variant="outline">
                    <Link href="/dashboard">Volver al Inicio</Link>
                </Button>
            </div>
        )
    }

    return (
        <TooltipProvider>
            <div className="space-y-8 animate-in fade-in duration-500 pb-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black tracking-tighter text-foreground">Gestión de Usuarios</h1>
                        <p className="text-muted-foreground font-medium text-lg">Administra roles y permisos del sistema.</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-0 shadow-sm bg-card/40 backdrop-blur-md ring-1 ring-border/50">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Total Usuarios</p>
                                <p className="text-3xl font-black text-foreground">{stats.total}</p>
                            </div>
                            <div className="h-12 w-12 rounded-xl flex items-center justify-center shadow-inner bg-primary/10 text-primary">
                                <Users className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm bg-card/40 backdrop-blur-md ring-1 ring-border/50">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Admins</p>
                                <p className="text-3xl font-black text-foreground">{stats.admins}</p>
                            </div>
                            <div className="h-12 w-12 rounded-xl flex items-center justify-center shadow-inner bg-red-500/10 text-red-600">
                                <Shield className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm bg-card/40 backdrop-blur-md ring-1 ring-border/50">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Publicadores</p>
                                <p className="text-3xl font-black text-foreground">{stats.publicadores}</p>
                            </div>
                            <div className="h-12 w-12 rounded-xl flex items-center justify-center shadow-inner bg-blue-500/10 text-blue-600">
                                <GraduationCap className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm bg-card/40 backdrop-blur-md ring-1 ring-border/50">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Usuarios</p>
                                <p className="text-3xl font-black text-foreground">{stats.usuarios}</p>
                            </div>
                            <div className="h-12 w-12 rounded-xl flex items-center justify-center shadow-inner bg-gray-500/10 text-gray-600">
                                <User className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="border-0 shadow-lg ring-1 ring-border/50 bg-card/40 backdrop-blur-md rounded-3xl">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por nombre o email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-12 h-12 rounded-2xl border-border/40 bg-background/50"
                                />
                            </div>
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger className="w-full md:w-[200px] h-12 rounded-2xl border-border/40 bg-background/50 font-bold">
                                    <SelectValue placeholder="Filtrar por rol" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="all" className="font-bold">Todos los roles</SelectItem>
                                    <SelectItem value="admin" className="font-bold">Administradores</SelectItem>
                                    <SelectItem value="publicador" className="font-bold">Publicadores</SelectItem>
                                    <SelectItem value="usuario" className="font-bold">Usuarios</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Users Table */}
                <Card className="border-0 shadow-lg ring-1 ring-border/50 bg-card/40 backdrop-blur-md rounded-3xl overflow-hidden">
                    <CardHeader className="border-b bg-muted/20">
                        <CardTitle className="text-lg font-black uppercase tracking-tight">Lista de Usuarios</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent border-b">
                                            <TableHead className="font-black uppercase text-[10px] tracking-widest pl-6">Usuario</TableHead>
                                            <TableHead className="font-black uppercase text-[10px] tracking-widest">Email</TableHead>
                                            <TableHead className="font-black uppercase text-[10px] tracking-widest">Rol</TableHead>
                                            <TableHead className="font-black uppercase text-[10px] tracking-widest">Investigaciones</TableHead>
                                            <TableHead className="font-black uppercase text-[10px] tracking-widest text-center">Subidas</TableHead>
                                            <TableHead className="font-black uppercase text-[10px] tracking-widest">Registrado</TableHead>
                                            <TableHead className="font-black uppercase text-[10px] tracking-widest text-right pr-6">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredUsers.map((u) => (
                                            <TableRow key={u.id} className="hover:bg-muted/30 transition-all">
                                                <TableCell className="font-bold pl-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "h-8 w-8 rounded-full flex items-center justify-center text-xs font-black ring-2 ring-background",
                                                            u.role === 'admin' ? "bg-red-100 text-red-600" :
                                                                u.role === 'publicador' ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                                                        )}>
                                                            {u.full_name?.substring(0, 2).toUpperCase() || "??"}
                                                        </div>
                                                        {u.full_name || 'Sin nombre'}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground font-medium text-xs">{u.email}</TableCell>
                                                <TableCell>
                                                    <Select
                                                        value={u.role}
                                                        onValueChange={(newRole) => updateUserRole(u.id, newRole)}
                                                        disabled={updatingUser === u.id}
                                                    >
                                                        <SelectTrigger className={cn(
                                                            "w-[140px] h-9 rounded-xl border-transparent font-bold transition-all focus:ring-2",
                                                            u.role === 'admin' ? "bg-red-50 text-red-700 hover:bg-red-100 focus:ring-red-200" :
                                                                u.role === 'publicador' ? "bg-blue-50 text-blue-700 hover:bg-blue-100 focus:ring-blue-200" :
                                                                    "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-300"
                                                        )}>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-xl shadow-xl">
                                                            <SelectItem value="usuario" className="font-bold">
                                                                <div className="flex items-center gap-2">
                                                                    <User className="h-4 w-4 text-gray-500" /> Usuario
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value="publicador" className="font-bold">
                                                                <div className="flex items-center gap-2">
                                                                    <GraduationCap className="h-4 w-4 text-blue-500" /> Publicador
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value="admin" className="font-bold">
                                                                <div className="flex items-center gap-2">
                                                                    <Shield className="h-4 w-4 text-red-500" /> Admin
                                                                </div>
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="font-bold rounded-lg ml-4">
                                                        {u.investigation_count || 0}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="flex justify-center items-center gap-3 p-1 rounded-full hover:bg-muted transition-colors w-fit mx-auto pr-3">
                                                                <Switch
                                                                    checked={u.can_upload !== false}
                                                                    onCheckedChange={() => toggleUserUpload(u.id, u.can_upload !== false)}
                                                                />
                                                                {u.can_upload !== false ?
                                                                    <Unlock className="h-4 w-4 text-emerald-500" /> :
                                                                    <Lock className="h-4 w-4 text-destructive" />
                                                                }
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="font-bold bg-foreground text-background rounded-xl">
                                                            {u.can_upload !== false ? <p>Habilitado para subir archivos</p> : <p>Bloqueado: No puede subir archivos</p>}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-xs font-mono">
                                                    {new Date(u.updated_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <Button variant="ghost" size="sm" className="font-bold rounded-xl h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-colors" asChild>
                                                        <Link href={`/dashboard/user/${u.id}`}><TrendingUp className="h-4 w-4" /></Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </TooltipProvider>
    )
}
