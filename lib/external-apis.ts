
export interface OpenAlexResult {
    id: string
    display_name: string
    publication_date: string
    doi: string | null
    primary_location: {
        source: {
            display_name: string
        } | null
        landing_page_url: string | null
        pdf_url: string | null
    } | null
    authorships: Array<{
        author: {
            display_name: string
        }
    }>
    concepts: Array<{
        display_name: string
    }>
    cited_by_count: number
}

interface OpenAlexResponse {
    results: OpenAlexResult[]
    meta: {
        count: number
        page: number
        per_page: number
    }
}

export async function searchOpenAlex(query: string, page = 1, perPage = 10): Promise<OpenAlexResponse> {
    try {
        let url = `https://api.openalex.org/works?page=${page}&per_page=${perPage}&select=id,display_name,publication_date,doi,primary_location,authorships,concepts,cited_by_count`

        if (query && query.trim() !== "") {
            url += `&search=${encodeURIComponent(query)}`
        } else {
            // Default: Most cited/relevant recent works if no query
            url += `&sort=cited_by_count:desc`
        }

        const response = await fetch(url)

        if (!response.ok) {
            throw new Error(`OpenAlex API error: ${response.statusText}`)
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.error("Failed to fetch from OpenAlex:", error)
        return { results: [], meta: { count: 0, page: 1, per_page: perPage } }
    }
}
