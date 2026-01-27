import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { AuthProviderWrapper } from "@/components/auth-provider-wrapper"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Repositorio Institucional UNIS - Universidad del Istmo",
  description: "Plataforma de gestión de investigaciones académicas de la Universidad del Istmo, Guatemala. Saber para Servir.",
  generator: "v0.app",
  verification: {
    google: "boa-5Xj1MOr9EhdZnDsAD0cXrfLKvonLA3QWl3ZMjKY",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProviderWrapper>{children}</AuthProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  )
}
