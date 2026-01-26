// app/register/page.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import NextLink from "next/link"
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle2, ShieldCheck, GraduationCap, School, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UniversityLogo } from "@/components/university-logo"
import { useAuth } from "@/lib/auth-context"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function RegisterPage() {
    const router = useRouter()
    const { register, isLoading: authLoading, isAuthenticated } = useAuth()
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "estudiante" as "admin" | "docente" | "estudiante"
    })

    // Auto-redirect if already logged in
    useEffect(() => {
        if (isAuthenticated) {
            router.push("/dashboard")
        }
    }, [isAuthenticated, router])
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target
        setFormData((prev) => ({ ...prev, [id]: value }))
    }

    const handleRoleChange = (role: string) => {
        setFormData((prev) => ({ ...prev, role: role as any }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
            setError("Por favor, completa todos los campos.")
            setIsLoading(false)
            return
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Las contraseñas no coinciden.")
            setIsLoading(false)
            return
        }

        try {
            const result = await register({
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                role: formData.role
            })

            if (result.success) {
                setSuccess(true)
            } else {
                setError(result.error || "Ocurrió un error al intentar registrarse.")
            }
        } catch (err) {
            setError("Ocurrió un error de conexión. Inténtalo de nuevo.")
        } finally {
            setIsLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
                <Card className="w-full max-w-md border-0 shadow-2xl text-center p-6 animate-in zoom-in-95 duration-300">
                    <CardHeader>
                        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <CheckCircle2 className="h-10 w-10 text-green-600" />
                        </div>
                        <CardTitle className="text-3xl font-bold text-foreground">¡Bienvenido!</CardTitle>
                        <CardDescription className="text-lg">Tu cuenta ha sido creada correctamente.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-muted-foreground leading-relaxed">
                            Hemos enviado un enlace de confirmación a <br />
                            <strong className="text-foreground">{formData.email}</strong>.<br />
                            Verifica tu correo para activar tu acceso.
                        </p>
                        <Button asChild className="w-full py-6 text-lg font-semibold" size="lg">
                            <NextLink href="/login">Ir a Iniciar Sesión</NextLink>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const isButtonLoading = isLoading || authLoading

    return (
        <div className="min-h-screen flex">
            {/* Panel izquierdo - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-sidebar flex-col justify-between p-12 relative overflow-hidden text-white">
                <div className="absolute top-0 left-0 w-full h-full bg-[conic-gradient(from_225deg_at_50%_50%,#00000000_0deg,#00000020_360deg)] pointer-events-none" />

                <UniversityLogo variant="light" />

                <div className="space-y-8 relative z-10">
                    <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-balance">
                        Tu Futuro Académico <br />
                        <span className="text-primary-foreground/80">Comienza Aquí</span>
                    </h1>
                    <p className="text-xl text-white/80 leading-relaxed max-w-md">
                        Crea tu perfil y accede a la red de investigación más importante de la región.
                    </p>

                    <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-md">
                            <div className="bg-primary/20 p-2 rounded-lg">
                                <GraduationCap className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Perfil Estudiantil</h3>
                                <p className="text-white/60 text-sm">Gestiona tus tesis y recursos de estudio.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-md">
                            <div className="bg-primary/20 p-2 rounded-lg">
                                <School className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Perfil Docente</h3>
                                <p className="text-white/60 text-sm">Evalúa investigaciones y publica tus avances.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10">
                    <p className="text-sm text-white/50 font-light italic">Saber para Servir • Universidad del Istmo</p>
                </div>
            </div>

            {/* Panel derecho - Formulario */}
            <div className="flex-1 flex items-center justify-center p-8 bg-background overflow-y-auto">
                <div className="w-full max-w-md space-y-8 my-auto">
                    <div className="lg:hidden flex justify-center mb-8">
                        <UniversityLogo />
                    </div>

                    <Card className="border-0 shadow-2xl ring-1 ring-border/50">
                        <CardHeader className="space-y-2 text-center pb-2">
                            <CardTitle className="text-2xl font-bold tracking-tight">Crear Cuenta</CardTitle>
                            <CardDescription>Completa el formulario para registrarte</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {error && (
                                    <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 animate-in shake-1 duration-300">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <div className="space-y-3">
                                    <Label className="text-sm font-semibold">Tipo de Usuario</Label>
                                    <RadioGroup
                                        defaultValue="estudiante"
                                        onValueChange={handleRoleChange}
                                        className="grid grid-cols-3 gap-2"
                                    >
                                        <div>
                                            <RadioGroupItem value="estudiante" id="r-estudiante" className="sr-only" />
                                            <Label
                                                htmlFor="r-estudiante"
                                                className={`flex flex-col items-center justify-center rounded-lg border-2 p-3 hover:bg-muted cursor-pointer transition-all ${formData.role === 'estudiante' ? 'border-primary bg-primary/5 text-primary' : 'border-muted'}`}
                                            >
                                                <GraduationCap className="h-5 w-5 mb-1" />
                                                <span className="text-xs font-medium">Estudiante</span>
                                            </Label>
                                        </div>
                                        <div>
                                            <RadioGroupItem value="docente" id="r-docente" className="sr-only" />
                                            <Label
                                                htmlFor="r-docente"
                                                className={`flex flex-col items-center justify-center rounded-lg border-2 p-3 hover:bg-muted cursor-pointer transition-all ${formData.role === 'docente' ? 'border-primary bg-primary/5 text-primary' : 'border-muted'}`}
                                            >
                                                <School className="h-5 w-5 mb-1" />
                                                <span className="text-xs font-medium">Docente</span>
                                            </Label>
                                        </div>
                                        <div>
                                            <RadioGroupItem value="admin" id="r-admin" className="sr-only" />
                                            <Label
                                                htmlFor="r-admin"
                                                className={`flex flex-col items-center justify-center rounded-lg border-2 p-3 hover:bg-muted cursor-pointer transition-all ${formData.role === 'admin' ? 'border-primary bg-primary/5 text-primary' : 'border-muted'}`}
                                            >
                                                <Settings className="h-5 w-5 mb-1" />
                                                <span className="text-xs font-medium">Admin</span>
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName" className="text-sm font-medium">Nombre</Label>
                                        <div className="relative group">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            <Input
                                                id="firstName"
                                                placeholder="Juan"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                className="pl-10 h-11"
                                                required
                                                disabled={isButtonLoading}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName" className="text-sm font-medium">Apellido</Label>
                                        <Input
                                            id="lastName"
                                            placeholder="Pérez"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className="h-11"
                                            required
                                            disabled={isButtonLoading}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium">Correo electrónico</Label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="usuario@unis.edu.gt"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="pl-10 h-11"
                                            required
                                            disabled={isButtonLoading}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password" id="password-label" className="text-sm font-medium">Contraseña</Label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="pl-10 pr-10 h-11"
                                            required
                                            disabled={isButtonLoading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" id="confirmPassword-label" className="text-sm font-medium">Confirmar Contraseña</Label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <Input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="pl-10 pr-10 h-11"
                                            required
                                            disabled={isButtonLoading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            tabIndex={-1}
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <Button type="submit" className="w-full h-12 text-lg font-bold" size="lg" disabled={isButtonLoading}>
                                        {isButtonLoading ? "Procesando..." : "Registrarse Ahora"}
                                    </Button>
                                </div>
                            </form>

                            <div className="mt-8 text-center text-sm">
                                <span className="text-muted-foreground">¿Ya tienes una cuenta? </span>
                                <NextLink href="/login" className="font-bold text-primary hover:underline underline-offset-8">
                                    Iniciar sesión
                                </NextLink>
                            </div>

                            <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                                <ShieldCheck className="h-3 w-3" />
                                Protected by Supabase Cloud
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
