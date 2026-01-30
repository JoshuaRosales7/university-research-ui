import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { AuthProviderWrapper } from "@/components/auth-provider-wrapper"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL("https://unisrepo.netlify.app"),
  title: {
    default: "Repositorio Institucional UNIS",
    template: "%s | UNIS Repositorio",
  },
  description: "Plataforma de gestión de investigaciones académicas de la Universidad del Istmo, Guatemala. Saber para Servir.",
  applicationName: "Repositorio UNIS",
  authors: [{ name: "Universidad del Istmo", url: "https://unis.edu.gt" }],
  generator: "Next.js",
  keywords: ["UNIS", "Universidad del Istmo", "Repositorio", "Investigación", "Tesis", "Guatemala", "Academia", "Saber para Servir"],
  referrer: "origin-when-cross-origin",
  creator: "Universidad del Istmo",
  publisher: "Universidad del Istmo",
  alternates: {
    canonical: "./",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Repositorio Institucional UNIS",
    description: "Accede a la producción académica y científica de la Universidad del Istmo.",
    url: "https://unisrepo.netlify.app",
    siteName: "Repositorio Institucional UNIS",
    locale: "es_GT",
    type: "website",
    images: [
      {
        url: "/unis-logo.png",
        width: 800,
        height: 600,
        alt: "Logo UNIS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Repositorio Institucional UNIS",
    description: "Descubre e investiga en el repositorio oficial de la UNIS.",
    creator: "@unisgt",
    images: ["/unis-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "boa-5Xj1MOr9EhdZnDsAD0cXrfLKvonLA3QWl3ZMjKY",
  },
  icons: {
    icon: "/unis-logo.png",
    shortcut: "/unis-logo.png",
    apple: "/unis-logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning data-scroll-behavior="smooth">
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
