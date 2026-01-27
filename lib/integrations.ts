
// lib/integrations.ts
// Servicio simulado para integraciones con APIs externas (ORCID, Turnitin, DataCite)

/**
 * Simula la verificación de plagio con una API externa (Turnitin/Unicheck)
 */
export async function checkPlagiarism(fileUrl: string | null): Promise<{ score: number; status: string; reportUrl: string }> {
    // En una implementación real, aquí se enviaría el archivo a la API
    console.log(`[Integration] Enviando archivo a Turnitin: ${fileUrl}`)

    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulamos un resultado aleatorio pero realista
            const score = Math.floor(Math.random() * 25) // 0-25% es común
            resolve({
                score,
                status: score > 20 ? "warning" : "clean",
                reportUrl: "https://turnitin.com/report/simulated-123456"
            })
        }, 2000)
    })
}

/**
 * Simula la generación de un DOI a través de DataCite
 */
export async function generateDOI(researchId: string, metadata: any): Promise<string> {
    console.log(`[Integration] Generando DOI para investigación: ${researchId}`)

    return new Promise((resolve) => {
        setTimeout(() => {
            // Formato estándar de DOI: 10.Prefijo/Sufijo
            // Usamos el prefix de ejemplo y un ID único
            const prefix = process.env.DATACITE_PREFIX || "10.5555"
            const suffix = `udu.${new Date().getFullYear()}.${researchId.substring(0, 6)}`
            resolve(`${prefix}/${suffix}`)
        }, 1500)
    })
}

/**
 * Simula la conexión con ORCID
 */
export async function connectOrcidProfile(): Promise<{ orcidId: string; name: string }> {
    console.log(`[Integration] Iniciando OAuth flow con ORCID`)

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                orcidId: "0000-0002-1825-0097", // Ejemplo de formato ORCID real
                name: "Usuario Verificado ORCID"
            })
        }, 1000)
    })
}
