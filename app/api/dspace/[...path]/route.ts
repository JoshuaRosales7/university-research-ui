// app/api/dspace/[...path]/route.ts

import { NextRequest, NextResponse } from "next/server"

export async function handleProxy(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    try {
        const { path: pathArray } = await params
        const path = pathArray.join("/")
        const query = request.nextUrl.search
        const targetBase = process.env.DSPACE_BACKEND_URL || "http://localhost:8080/server/api/"
        const targetUrl = new URL(path + query, targetBase).toString()

        console.log(`[DSpace Proxy] ${request.method} ${path}${query}`)
        console.log(`[DSpace Proxy] Target URL: ${targetUrl}`)

        // 1. Preparar Headers para DSpace
        const headers = new Headers()

        // IMPORTANTE: Pasar CSRF token si existe
        const xsrfToken = request.headers.get("X-XSRF-TOKEN")
        if (xsrfToken) {
            headers.set("X-XSRF-TOKEN", xsrfToken)
            console.log(`[DSpace Proxy] Forwarding CSRF token: ${xsrfToken.substring(0, 20)}...`)
        }

        // Pasar cookies del frontend al backend
        const cookie = request.headers.get("cookie") || ""

        // Extraer cookies importantes
        const cookieParts = cookie.split(';').map(c => c.trim())
        const importantCookies = cookieParts.filter(c =>
            c.includes("JSESSIONID") ||
            c.includes("XSRF-TOKEN") ||
            c.includes("DSPACE-XSRF-COOKIE") ||
            c.includes("DSPACE-SESSION")
        )

        if (importantCookies.length > 0) {
            headers.set("cookie", importantCookies.join('; '))
            console.log(`[DSpace Proxy] Forwarding ${importantCookies.length} important cookies`)
        }

        // Headers necesarios para DSpace
        headers.set("Accept", "application/json")
        headers.set("X-Requested-With", "XMLHttpRequest")

        // Content-Type (manejado abajo según el endpoint)
        const contentType = request.headers.get("content-type") || ""
        if (contentType) {
            headers.set("Content-Type", contentType)
        }

        // 2. Manejar body basado en el tipo de contenido y endpoint
        let body: BodyInit | null = null
        const method = request.method.toUpperCase()

        if (!["GET", "HEAD"].includes(method)) {
            if (path === "authn/login") {
                // Para login, convertir JSON a form-urlencoded
                try {
                    const json = await request.json()
                    console.log(`[DSpace Proxy] Login request for: ${json.user || json.email}`)

                    const formData = new URLSearchParams()
                    formData.append("user", json.user || json.email || "")
                    formData.append("password", json.password || "")

                    body = formData.toString()
                    headers.set("Content-Type", "application/x-www-form-urlencoded")

                    console.log("[DSpace Proxy] Converted login JSON to form-urlencoded")
                } catch (e) {
                    console.error("[DSpace Proxy] Error parsing login JSON:", e)
                    // Fallback: usar body original
                    body = await request.text()
                }
            } else {
                // Para otras peticiones POST/PUT/PATCH/DELETE
                body = await request.text()
                console.log(`[DSpace Proxy] Body length: ${body?.length || 0} chars`)
            }
        }

        // 3. Llamada al backend DSpace
        console.log(`[DSpace Proxy] Making request to DSpace backend...`)
        const response = await fetch(targetUrl, {
            method: request.method,
            headers: headers,
            body: body,
            cache: "no-store",
            redirect: "manual",
        })

        console.log(`[DSpace Proxy] Response: ${response.status} ${response.statusText}`)

        // 4. Procesar respuesta
        const responseHeaders = new Headers()

        // Copy important headers from DSpace response
        const headersToCopy = [
            "content-type",
            "content-length",
            "cache-control",
            "pragma",
            "expires",
            "location"
        ]

        response.headers.forEach((value, key) => {
            if (headersToCopy.includes(key.toLowerCase())) {
                responseHeaders.set(key, value)
            }
        })

        // A) Extraer y manejar CSRF token de la respuesta
        const csrfTokenFromDSpace = response.headers.get("DSPACE-XSRF-TOKEN") ||
            response.headers.get("X-XSRF-TOKEN")

        if (csrfTokenFromDSpace) {
            responseHeaders.set("DSPACE-XSRF-TOKEN", csrfTokenFromDSpace)
            console.log(`[DSpace Proxy] CSRF token from DSpace: ${csrfTokenFromDSpace.substring(0, 20)}...`)
        }

        // B) Manejar cookies de DSpace
        const setCookieHeader = response.headers.getSetCookie()
        if (setCookieHeader && setCookieHeader.length > 0) {
            console.log(`[DSpace Proxy] Found ${setCookieHeader.length} cookies from DSpace`)

            const cookiesToSet: string[] = []

            setCookieHeader.forEach((cookie, index) => {
                console.log(`[DSpace Proxy] Cookie ${index + 1} from DSpace: ${cookie.substring(0, 50)}...`)

                // Modificar cookie para que funcione en el frontend
                let modifiedCookie = cookie
                    // Ajustar path para que funcione en /api/dspace
                    .replace(/Path=\/server\/api/gi, "Path=/api/dspace")
                    .replace(/Path=\/server/gi, "Path=/")
                    // Para desarrollo local, no requerir Secure
                    .replace(/;\s*Secure/gi, "")
                    // Ajustar SameSite
                    .replace(/SameSite=None/gi, "SameSite=Lax")
                    // Quitar dominio específico
                    .replace(/;\s*Domain=[^;]+/gi, "")
                    // Asegurar HttpOnly para cookies de sesión
                    .replace(/^([^;]+)(;|$)/, (match, cookieValue) => {
                        if (cookieValue.includes("JSESSIONID") ||
                            cookieValue.includes("DSPACE-XSRF-COOKIE")) {
                            return match + "; HttpOnly"
                        }
                        return match
                    })

                // Para CSRF cookie, también establecerla como cookie normal
                if (modifiedCookie.includes("XSRF-TOKEN") || modifiedCookie.includes("DSPACE-XSRF-COOKIE")) {
                    const csrfValue = modifiedCookie.split(';')[0].split('=')[1]
                    if (csrfValue && !responseHeaders.has("DSPACE-XSRF-TOKEN")) {
                        responseHeaders.set("DSPACE-XSRF-TOKEN", csrfValue)
                    }
                }

                cookiesToSet.push(modifiedCookie)
            })

            // Aplicar cookies modificadas al frontend
            cookiesToSet.forEach(cookie => {
                responseHeaders.append("Set-Cookie", cookie)
            })
        }

        // C) Headers CORS importantes
        responseHeaders.set("Access-Control-Expose-Headers", "DSPACE-XSRF-TOKEN, X-XSRF-TOKEN, Content-Type")
        responseHeaders.set("Access-Control-Allow-Credentials", "true")

        // 5. Crear respuesta para el frontend - MANEJO ESPECIAL PARA 204
        let responseBody: BodyInit | null = null
        let status = response.status

        // Para respuestas 204 (No Content), crear un cuerpo vacío
        if (response.status === 204) {
            console.log("[DSpace Proxy] Handling 204 No Content response")
            responseBody = ""

            // Asegurar que tenemos un content-type para 204
            if (!responseHeaders.has("content-type")) {
                responseHeaders.set("content-type", "text/plain")
            }
        } else {
            // Para otras respuestas, leer el cuerpo normalmente
            responseBody = await response.text()
        }

        // Debug para login
        if (path === "authn/login") {
            console.log(`[DSpace Proxy] Login response status: ${status}`)
            if (responseBody && typeof responseBody === 'string') {
                console.log(`[DSpace Proxy] Login response body (first 200 chars):`, responseBody.substring(0, 200))
            }
        }

        // Debug para auth status
        if (path === "authn/status" && responseHeaders.get("content-type")?.includes("application/json")) {
            try {
                if (responseBody && typeof responseBody === 'string') {
                    const json = JSON.parse(responseBody)
                    console.log(`[DSpace Proxy] Auth status:`, {
                        authenticated: json.authenticated,
                        hasUser: !!json._embedded?.eperson,
                        status: status
                    })
                }
            } catch {
                // Ignore parse errors
            }
        }

        // Debug para CSRF endpoint
        if (path === "security/csrf") {
            console.log(`[DSpace Proxy] CSRF endpoint response:`, {
                status: status,
                hasCsrfHeader: !!csrfTokenFromDSpace,
                hasCookies: setCookieHeader?.length || 0
            })
        }

        // Crear la respuesta con manejo seguro del estado
        return new NextResponse(responseBody, {
            status: status === 204 ? 200 : status, // Convertir 204 a 200 para NextResponse
            statusText: status === 204 ? "OK" : response.statusText,
            headers: responseHeaders,
        })

    } catch (error: any) {
        console.error("[DSpace Proxy Error]:", error)
        console.error("[DSpace Proxy] Error stack:", error.stack)

        return NextResponse.json(
            {
                error: "Proxy Error",
                message: error.message,
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        )
    }
}

export const GET = handleProxy
export const POST = handleProxy
export const PUT = handleProxy
export const DELETE = handleProxy
export const PATCH = handleProxy
export const HEAD = handleProxy
export const OPTIONS = handleProxy