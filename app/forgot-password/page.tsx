"use client"

import type React from "react"
import { useState } from "react"
import NextLink from "next/link"
import { Mail, CheckCircle2, ArrowLeft, ShieldCheck, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UniversityLogo } from "@/components/university-logo"
import { useAuth } from "@/lib/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ForgotPasswordPage() {
    const { resetPassword } = useAuth()
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        if (!email) {
            setError("Por favor, ingresa tu correo electrónico.")
            setIsLoading(false)
            return
        }

        try {
            const result = await resetPassword(email)

            if (result.success) {
                setSuccess(true)
            } else {
                setError(result.error || "Ocurrió un error al enviar el enlace.")
            }
        } catch (err) {
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
                        <CardTitle className="text-2xl md:text-3xl font-bold text-foreground">¡Correo Enviado!</CardTitle>
                        <CardDescription className="text-base md:text-lg">Revisa tu bandeja de entrada.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                            Hemos enviado un enlace de recuperación a <br />
                            <strong className="text-foreground text-xs md:text-sm break-all">{email}</strong>.<br />
                            Sigue las instrucciones para restablecer tu contraseña.
                        </p>
                        <Button asChild className="w-full py-4 md:py-6 text-sm md:text-base font-semibold" size="lg">
                            <NextLink href="/login">Volver a Iniciar Sesión</NextLink>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background selection:bg-primary/20 p-4">
            {/* Background Effects */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background -z-10" />

            <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col items-center justify-center gap-6">
                    <UniversityLogo />
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-black tracking-tighter">Recuperar Acceso</h1>
                        <p className="text-muted-foreground font-medium">Ingresa tu correo para buscar tu cuenta</p>
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
                                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest ml-1">Correo Institucional</Label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="usuario@unis.edu.gt"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
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
                                        Enviando...
                                    </div>
                                ) : "Enviar Enlace de Recuperación"}
                            </Button>

                            <div className="text-center">
                                <Button variant="link" size="sm" asChild className="text-muted-foreground hover:text-foreground">
                                    <NextLink href="/login" className="gap-2">
                                        <ArrowLeft className="h-4 w-4" /> Volver al Inicio de Sesión
                                    </NextLink>
                                </Button>
                            </div>
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
