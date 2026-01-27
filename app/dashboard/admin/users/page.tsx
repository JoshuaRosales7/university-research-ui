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
import { Users, Search, Shield, GraduationCap, User, Loader2, ShieldAlert, TrendingUp } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface UserProfile {
    id: string
    email: string
    full_name: string
    role: string
    updated_at: string
    investigation_count?: number
}

export default function AdminUsersPage() {
    const { user } = useAuth()
    const [users, setUsers] = useState<UserProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [roleFilter, setRoleFilter] = useState<string>("all")

    const isAdmin = user?.role === "admin"

    useEffect(() => {
        if (isAdmin) {
            fetchUsers()
        }
    }, [isAdmin])

    async function fetchUsers() {
        setLoading(true)
        try {
            // Fetch profiles
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('*')
                .order('updated_at', { ascending: false })

            if (profilesError) throw profilesError

            // Add placeholder email (not available in profiles table)
            const mergedUsers = profilesData.map(profile => ({
                ...profile,
                email: 'Ver en Supabase Auth'
            }))

            // Get investigation counts
            const { data: investigations } = await supabase
                .from('investigations')
                .select('owner_id')

            const investigationCounts = investigations?.reduce((acc: any, inv: any) => {
                acc[inv.owner_id] = (acc[inv.owner_id] || 0) + 1
                return acc
            }, {})

            const usersWithCounts = mergedUsers.map(u => ({
                ...u,
                investigation_count: investigationCounts?.[u.id] || 0
            }))

            setUsers(usersWithCounts)
        } catch (error) {
            console.error("Error fetching users:", error)
        } finally {
            setLoading(false)
        }
    }

    async function updateUserRole(userId: string, newRole: string) {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId)

            if (error) throw error

            // Refresh users list
            await fetchUsers()
        } catch (error) {
            console.error("Error updating role:", error)
            alert("Error al actualizar el rol")
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
        docentes: users.filter(u => u.role === 'docente').length,
        estudiantes: users.filter(u => u.role === 'estudiante').length,
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
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Docentes</p>
                            <p className="text-3xl font-black text-foreground">{stats.docentes}</p>
                        </div>
                        <div className="h-12 w-12 rounded-xl flex items-center justify-center shadow-inner bg-blue-500/10 text-blue-600">
                            <GraduationCap className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-card/40 backdrop-blur-md ring-1 ring-border/50">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Estudiantes</p>
                            <p className="text-3xl font-black text-foreground">{stats.estudiantes}</p>
                        </div>
                        <div className="h-12 w-12 rounded-xl flex items-center justify-center shadow-inner bg-green-500/10 text-green-600">
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
                                <SelectItem value="docente" className="font-bold">Docentes</SelectItem>
                                <SelectItem value="estudiante" className="font-bold">Estudiantes</SelectItem>
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
                                        <TableHead className="font-black uppercase text-[10px] tracking-widest">Usuario</TableHead>
                                        <TableHead className="font-black uppercase text-[10px] tracking-widest">Email</TableHead>
                                        <TableHead className="font-black uppercase text-[10px] tracking-widest">Rol</TableHead>
                                        <TableHead className="font-black uppercase text-[10px] tracking-widest">Investigaciones</TableHead>
                                        <TableHead className="font-black uppercase text-[10px] tracking-widest">Registrado</TableHead>
                                        <TableHead className="font-black uppercase text-[10px] tracking-widest text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map((u) => (
                                        <TableRow key={u.id} className="hover:bg-muted/30 transition-colors">
                                            <TableCell className="font-bold">{u.full_name || 'Sin nombre'}</TableCell>
                                            <TableCell className="text-muted-foreground font-medium">{u.email}</TableCell>
                                            <TableCell>
                                                <Select
                                                    value={u.role}
                                                    onValueChange={(newRole) => updateUserRole(u.id, newRole)}
                                                >
                                                    <SelectTrigger className="w-[140px] h-9 rounded-xl border-border/40 font-bold">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl">
                                                        <SelectItem value="estudiante" className="font-bold">
                                                            <div className="flex items-center gap-2">
                                                                <User className="h-4 w-4" /> Estudiante
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="docente" className="font-bold">
                                                            <div className="flex items-center gap-2">
                                                                <GraduationCap className="h-4 w-4" /> Docente
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="admin" className="font-bold">
                                                            <div className="flex items-center gap-2">
                                                                <Shield className="h-4 w-4" /> Admin
                                                            </div>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-bold">
                                                    {u.investigation_count || 0}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {new Date(u.updated_at).toLocaleDateString('es-GT')}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" className="font-bold rounded-xl" asChild>
                                                    <Link href={`/dashboard/user/${u.id}`}>Ver Perfil</Link>
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
    )
}
