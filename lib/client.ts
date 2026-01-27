// lib/dspace/client.ts

import { DSPACE_CONFIG } from "./config"
import type {
  DSpaceHALResponse,
  DSpaceCommunity,
  DSpaceCollection,
  DSpaceItem,
  DSpaceSearchResult,
  DSpaceAuthStatus,
  DSpaceWorkspaceItem,
  DSpaceEPerson,
  DSpaceGroup,
} from "./types"

const DEBUG = process.env.NODE_ENV === 'development';

class DSpaceClient {
  private baseUrl: string
  private csrfToken: string | null = null
  private csrfCookieName: string = "DSPACE-XSRF-COOKIE"
  private sessionInitialized: boolean = false

  constructor() {
    this.baseUrl = DSPACE_CONFIG.baseUrl
    if (DEBUG) console.log("[DSpace] Client initialized with baseUrl:", this.baseUrl)
  }

  // ============ Core Fetch Methods ============

  private getHeaders(contentType: string = "application/json"): HeadersInit {
    const headers: HeadersInit = {
      "Accept": "application/json",
    }

    if (contentType) {
      headers["Content-Type"] = contentType
    }

    // Solo enviar CSRF token si tenemos uno
    if (this.csrfToken) {
      headers["X-XSRF-TOKEN"] = this.csrfToken
    }

    return headers
  }

  // Obtener CSRF token de las cookies del navegador
  private getCsrfFromCookies(): string | null {
    if (typeof document === 'undefined') return null

    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=')
      if (name === this.csrfCookieName || name === 'XSRF-TOKEN') {
        return decodeURIComponent(value)
      }
    }
    return null
  }

  private async fetchRaw(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`

    // Antes de cada request, verificar si tenemos CSRF token en cookies
    const cookieCsrf = this.getCsrfFromCookies()
    if (cookieCsrf && cookieCsrf !== this.csrfToken) {
      this.csrfToken = cookieCsrf
    }

    const headers = new Headers(this.getHeaders())

    // Override Content-Type if specified in options
    if (options.headers) {
      const customHeaders = new Headers(options.headers)
      customHeaders.forEach((value, key) => {
        if (value !== null && value !== undefined) {
          headers.set(key, String(value))
        }
      })
    }

    const fetchOptions: RequestInit = {
      ...options,
      headers,
    }

    if (DEBUG) console.log(`[DSpace] ${options.method || 'GET'} ${endpoint}`)

    try {
      const response = await fetch(url, fetchOptions)

      // Extract CSRF token from response headers
      const newCsrf = response.headers.get("DSPACE-XSRF-TOKEN") ||
        response.headers.get("X-XSRF-TOKEN")

      if (newCsrf && newCsrf !== this.csrfToken) {
        this.csrfToken = newCsrf
      }

      return response
    } catch (error) {
      console.error(`[DSpace] Network error for ${endpoint}:`, error)
      throw error
    }
  }

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await this.fetchRaw(endpoint, options)

    if (!response.ok) {
      let errorMessage = `DSpace API Error: ${response.status}`

      try {
        const errorText = await response.text()
        if (errorText) {
          try {
            const errorJson = JSON.parse(errorText)
            errorMessage += ` - ${errorJson.message || errorJson.detail || errorText}`
          } catch {
            errorMessage += ` - ${errorText.substring(0, 100)}`
          }
        }
      } catch {
        // Ignore if we can't read response
      }

      throw new Error(errorMessage)
    }

    const contentType = response.headers.get("content-type")
    if (contentType?.includes("application/json")) {
      return response.json()
    }

    // Para respuestas vacías (como CSRF endpoint que devuelve 204)
    if (response.status === 204 || response.status === 200) {
      try {
        const text = await response.text()
        if (text) {
          return JSON.parse(text) as T
        }
      } catch {
        // Respuesta vacía, devolver objeto vacío
      }
    }

    return {} as T
  }

  // ============ Authentication ============

  async getAuthStatus(): Promise<DSpaceAuthStatus> {
    try {
      const response = await this.fetchRaw(DSPACE_CONFIG.endpoints.auth.status)

      if (response.status === 401 || response.status === 403) {
        return {
          okay: false,
          authenticated: false,
          type: "status",
          _links: { self: { href: "" } }
        }
      }

      if (!response.ok) {
        return {
          okay: false,
          authenticated: false,
          type: "status",
          _links: { self: { href: "" } }
        }
      }

      const data = await response.json()

      return {
        ...data,
        okay: true,
        authenticated: data.authenticated === true
      }
    } catch (error) {
      console.error("[DSpace] Auth status error:", error)
      return {
        okay: false,
        authenticated: false,
        type: "status",
        _links: { self: { href: "" } }
      }
    }
  }

  async ensureCsrfToken(): Promise<string | null> {
    // Primero intentar obtener de cookies
    const cookieCsrf = this.getCsrfFromCookies()
    if (cookieCsrf) {
      this.csrfToken = cookieCsrf
      return this.csrfToken
    }

    // Si no hay en cookies, intentar obtener del endpoint
    if (this.csrfToken) {
      return this.csrfToken
    }

    try {
      const response = await this.fetchRaw(DSPACE_CONFIG.endpoints.security.csrf)

      if (!response.ok) {
        // Para respuestas 204 (No Content), es normal
        if (response.status === 204) {
          // Verificar si tenemos token en headers
          const headerCsrf = response.headers.get("DSPACE-XSRF-TOKEN")
          if (headerCsrf) {
            this.csrfToken = headerCsrf
            return this.csrfToken
          }
        }

        return null
      }

      // Extraer token de headers
      let token = response.headers.get("DSPACE-XSRF-TOKEN") ||
        response.headers.get("X-XSRF-TOKEN")

      if (token) {
        this.csrfToken = token
        return token
      }

      return null
    } catch (error) {
      console.warn("[DSpace] Failed to get CSRF token:", error)
      return null
    }
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ success: boolean; user?: DSpaceEPerson; error?: string }> {
    try {
      if (DEBUG) console.log(`[DSpace] Attempting login for: ${email}`)

      // 1. Obtener CSRF token ANTES del login
      await this.ensureCsrfToken()

      // 2. Intentar login con el token CSRF que tenemos
      const loginResponse = await this.fetchRaw(DSPACE_CONFIG.endpoints.auth.login, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Proxy converts this
        },
        body: JSON.stringify({
          user: email.trim(),
          password: password.trim()
        })
      })

      if (loginResponse.ok) {
        // 3. Después del login exitoso, actualizar CSRF token
        const newCsrf = loginResponse.headers.get("DSPACE-XSRF-TOKEN")
        if (newCsrf) {
          this.csrfToken = newCsrf
        }

        // 4. Esperar y verificar autenticación
        await new Promise(resolve => setTimeout(resolve, 800))

        const authStatus = await this.getAuthStatus()

        if (authStatus.authenticated && authStatus._embedded?.eperson) {
          return {
            success: true,
            user: authStatus._embedded.eperson,
          }
        } else {
          console.warn("[DSpace] ❌ Login succeeded but session not established")

          // Intentar una vez más
          await new Promise(resolve => setTimeout(resolve, 1200))
          const retryStatus = await this.getAuthStatus()

          if (retryStatus.authenticated && retryStatus._embedded?.eperson) {
            return {
              success: true,
              user: retryStatus._embedded.eperson,
            }
          }

          return {
            success: false,
            error: "La sesión no se estableció correctamente. Por favor, recarga la página."
          }
        }
      } else {
        let errorMessage = "Credenciales inválidas"

        try {
          const errorText = await loginResponse.text()
          if (errorText) {
            try {
              const errorJson = JSON.parse(errorText)
              errorMessage = errorJson.message || errorJson.detail || errorMessage

              // Si es error CSRF, limpiar token y reintentar
              if (errorMessage.includes("CSRF") || errorMessage.includes("csrf")) {
                console.log("[DSpace] CSRF error detected, clearing token and retrying...")
                this.csrfToken = null

                // Obtener nuevo token CSRF
                await this.ensureCsrfToken()

                // Reintentar login una vez
                return this.login(email, password)
              }
            } catch {
              errorMessage = errorText.substring(0, 200) || errorMessage
            }
          }
        } catch {
          // Could not read response
        }

        return {
          success: false,
          error: errorMessage
        }
      }
    } catch (error) {
      console.error("[DSpace] Login exception:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error de conexión con el servidor."
      }
    }
  }

  async logout(): Promise<void> {
    try {
      await this.fetchRaw(DSPACE_CONFIG.endpoints.auth.logout, {
        method: "POST"
      })
    } catch (error) {
      console.error("[DSpace] Logout error:", error)
    } finally {
      this.csrfToken = null
      this.sessionInitialized = false
    }
  }

  // ... resto de los métodos permanecen igual ...

  async debugCookies(): Promise<void> {
    if (!DEBUG) return;
    console.log("[DSpace] === COOKIE DEBUG ===")

    if (typeof document !== 'undefined') {
      console.log("[DSpace] Document cookies:", document.cookie)
    } else {
      console.log("[DSpace] No document object (server-side)")
    }

    console.log("[DSpace] CSRF Token in memory:", this.csrfToken)
    console.log("[DSpace] === END DEBUG ===")
  }
}

// Singleton instance
export const dspaceClient = new DSpaceClient()