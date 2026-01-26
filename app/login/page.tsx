// app/login/page.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Eye, EyeOff, Mail, Lock, AlertCircle, ShieldCheck, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { UniversityLogo } from "@/components/university-logo"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading: authLoading, isAuthenticated } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Auto-redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!email || !password) {
      setError("Por favor, ingresa tu email y contraseña")
      setIsLoading(false)
      return
    }

    try {
      const result = await login(email, password)

      if (result.success) {
        router.push("/dashboard")
      } else {
        setError(result.error || "Credenciales inválidas. Verifica tu email y contraseña.")
      }
    } catch (err) {
      setError("Ocurrió un error inesperado. Por favor, inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const isButtonLoading = isLoading || authLoading

  return (
    <div className="min-h-screen flex bg-background selection:bg-primary/20">
      {/* Panel izquierdo - Branding Premium */}
      <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden flex-col justify-between p-16">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-sidebar" />
        <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[100px]" />

        <div className="relative z-10 animate-in fade-in slide-in-from-left-4 duration-700">
          <UniversityLogo variant="light" />
        </div>

        <div className="relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <div className="space-y-4">
            <Badge className="bg-white/10 text-white border-white/20 px-4 py-1.5 backdrop-blur-md">
              Plataforma de Investigación 2.0
            </Badge>
            <h1 className="text-6xl font-extrabold text-white leading-[1.1] tracking-tighter">
              Repositorio <br />
              <span className="text-primary-foreground/60">Institucional UNIS</span>
            </h1>
          </div>
          <p className="text-xl text-white/70 leading-relaxed max-w-xl font-medium">
            Saber para Servir. Gestiona investigaciones académicas con la infraestructura más avanzada y segura de la región.
          </p>
          <div className="grid grid-cols-3 gap-12 pt-8">
            <div className="space-y-2">
              <p className="text-4xl font-black text-white tracking-tighter">Safe</p>
              <p className="text-xs font-bold uppercase tracking-widest text-white/40">Encryption</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-black text-white tracking-tighter">Fast</p>
              <p className="text-xs font-bold uppercase tracking-widest text-white/40">Response</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-black text-white tracking-tighter">Open</p>
              <p className="text-xs font-bold uppercase tracking-widest text-white/40">Knowledge</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-6 animate-in fade-in duration-1000 delay-500">
          <p className="text-xs font-bold tracking-widest text-white/30 uppercase italic">© 2026 Universidad del Istmo</p>
          <div className="h-px w-12 bg-white/10" />
          <p className="text-xs font-bold tracking-widest text-white/30 uppercase">Guatemala</p>
        </div>
      </div>

      {/* Panel derecho - Formulario Limpio */}
      <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
        {/* Subtle background decoration for light mode */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -ml-32 -mb-32" />

        <div className="w-full max-w-sm space-y-10 relative z-10 animate-in fade-in zoom-in-95 duration-500">
          <div className="lg:hidden flex justify-center items-center">
            <UniversityLogo />
          </div>

          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-black tracking-tighter text-foreground">Bienvenido de nuevo</h2>
            <p className="text-muted-foreground font-medium">Ingresa a tu cuenta para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 animate-in fade-in slide-in-from-top-1 rounded-2xl">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="font-bold text-xs">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2.5">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest ml-1 opacity-70">Correo Institucional</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@unis.edu.gt"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-14 bg-muted/30 border-0 focus:bg-background ring-offset-background transition-all rounded-2xl font-medium"
                  required
                  disabled={isButtonLoading}
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest opacity-70">Contraseña</Label>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 pr-12 h-14 bg-muted/30 border-0 focus:bg-background ring-offset-background transition-all rounded-2xl font-medium"
                  required
                  disabled={isButtonLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button type="button" className="text-xs font-bold text-primary hover:text-primary/70 transition-colors uppercase tracking-widest">
                Recuperar Contraseña
              </button>
            </div>

            <Button type="submit" className="w-full h-14 text-base font-bold shadow-xl shadow-primary/20 rounded-2xl transition-all active:scale-[0.98]" disabled={isButtonLoading}>
              {isButtonLoading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Conectando con Supabase...
                </div>
              ) : "Entrar al Repositorio"}
            </Button>
          </form>

          <div className="pt-8 mt-4 border-t border-dashed text-center">
            <p className="text-xs font-medium text-muted-foreground">
              ¿Nuevo en la comunidad?{" "}
              <Link href="/register" className="font-bold text-primary hover:underline underline-offset-4 decoration-2">
                Crea tu cuenta aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
