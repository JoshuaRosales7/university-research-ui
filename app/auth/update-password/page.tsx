"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import NextLink from "next/link"
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle2, Loader2, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UniversityLogo } from "@/components/university-logo"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"

export default function UpdatePasswordPage() {
    const { user, isLoading: isAuthLoading } = useAuth()
    const router = useRouter()
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
    })
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    // Redirect if not authenticated (though we might need to wait for hash parsing)
    // However, Supabase client handles hash parsing automatically on load.
    // If we are here, we expect a session. But allow a grace period or check.
    useEffect(() => {
        // If we are definitely done loading and no user, maybe show error or redirect?
        // But for "Password Recovery", the session is established BY the link.
        // So we should be good.
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target
        setFormData((prev) => ({ ...prev, [id]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        if (formData.password !== formData.confirmPassword) {
            setError("Las contraseñas no coinciden.")
            setIsLoading(false)
            return
        }

        if (formData.password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres.")
            setIsLoading(false)
            return
        }

        try {
            const { data, error } = await supabase.auth.updateUser({
                password: formData.password,
            })

            if (error) {
                setError(error.message || "No se pudo actualizar la contraseña. Intenta solicitar un nuevo enlace.")
            } else {
                setSuccess(true)
            }
        } catch (err) {
            console.error("Password update error:", err)
            setError("Error de conexión. Inténtalo de nuevo.")
        } finally {
            setIsLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4 md:p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
                <Card className="w-full max-w-md border-0 shadow-2xl text-center p-4 md:p-8 animate-in zoom-in-95 duration-300">
                    <CardHeader>
                        <div className="mx-auto w-16 md:w-20 h-16 md:h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 md:mb-6 shadow-inner">
                            <CheckCircle2 className="h-8 md:h-10 w-8 md:w-10 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl md:text-3xl font-bold text-foreground">¡Contraseña Actualizada!</CardTitle>
                        <CardDescription className="text-base md:text-lg">Acceso seguro restablecido.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-muted-foreground leading-relaxed">
                            Tu contraseña ha sido cambiada correctamente. Ahora puedes navegar seguro.
                        </p>
                        <Button asChild className="w-full py-4 md:py-6 text-sm md:text-base font-bold shadow-lg" size="lg">
                            <NextLink href="/dashboard">Ir al Dashboard</NextLink>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background selection:bg-primary/20 p-4">
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background -z-10" />

            <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col items-center justify-center gap-6">
                    <UniversityLogo />
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-black tracking-tighter">Nueva Contraseña</h1>
                        <p className="text-muted-foreground font-medium">Establece una contraseña segura</p>
                    </div>
                </div>

                <Card className="border-0 shadow-2xl ring-1 ring-border/50 bg-card/80 backdrop-blur-sm">
                    <CardContent className="p-6 md:p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 rounded-xl">
                                    <AlertDescription className="font-bold text-xs">{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest ml-1">Nueva Contraseña</Label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Min. 6 caracteres"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="pl-12 pr-12 h-12 rounded-xl bg-muted/30 border-0 focus:bg-background transition-all"
                                        required
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-widest ml-1">Confirmar Contraseña</Label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="confirmPassword"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Repite la contraseña"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="pl-12 h-12 rounded-xl bg-muted/30 border-0 focus:bg-background transition-all"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full h-12 font-bold rounded-xl shadow-lg" size="lg" disabled={isLoading}>
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Actualizando...
                                    </div>
                                ) : "Actualizar Contraseña"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-60">
                    <ShieldCheck className="h-3 w-3" />
                    Plataforma Segura UNIS
                </div>
            </div>
        </div>
    )
}
