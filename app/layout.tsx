import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProviderWrapper } from "@/components/auth-provider-wrapper"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Repositorio Institucional UNIS - Universidad del Istmo",
  description: "Plataforma de gestión de investigaciones académicas de la Universidad del Istmo, Guatemala. Saber para Servir.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} font-sans antialiased`}>
        <AuthProviderWrapper>{children}</AuthProviderWrapper>
        <Analytics />
      </body>
    </html>
  )
}
