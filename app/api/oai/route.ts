
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Helper to escape XML characters
function escapeXml(unsafe: string | any): string {
    if (typeof unsafe !== 'string') return ''
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;'
            case '>': return '&gt;'
            case '&': return '&amp;'
            case '\'': return '&apos;'
            case '"': return '&quot;'
            default: return c
        }
    })
}

export async function GET(req: NextRequest) {
    const url = new URL(req.url)
    const verb = url.searchParams.get('verb')
    const baseUrl = `${url.protocol}//${url.host}${url.pathname}`

    // Default to error if no verb
    if (!verb) {
        return new NextResponse('Missing verb argument', { status: 400 })
    }

    const responseDate = new Date().toISOString()

    let content = ''

    if (verb === 'Identify') {
        content = `
    <Identify>
      <repositoryName>University Research Repository</repositoryName>
      <baseURL>${baseUrl}</baseURL>
      <protocolVersion>2.0</protocolVersion>
      <adminEmail>admin@university.edu</adminEmail>
      <earliestDatestamp>2023-01-01T00:00:00Z</earliestDatestamp>
      <deletedRecord>transient</deletedRecord>
      <granularity>YYYY-MM-DDThh:mm:ssZ</granularity>
    </Identify>`
    } else if (verb === 'ListRecords' || verb === 'ListIdentifiers') {
        const metadataPrefix = url.searchParams.get('metadataPrefix')

        if (verb === 'ListRecords' && metadataPrefix !== 'oai_dc') {
            content = `<error code="cannotDisseminateFormat">Metadata prefix '${metadataPrefix}' not supported</error>`
        } else {
            // Fetch approved investigations
            const { data: records, error } = await supabase
                .from('investigations')
                .select('*')
                .eq('status', 'aprobado')
                .order('created_at', { ascending: false })
                .limit(100) // Limit for demo purposes

            if (error) {
                console.error('OAI Error:', error)
                content = `<error code="noRecordsMatch">Internal Database Error</error>`
            } else {
                content = `<ListRecords>
              ${records?.map((r: any) => `
                <record>
                  <header>
                    <identifier>oai:repo:${r.id}</identifier>
                    <datestamp>${r.created_at}</datestamp>
                  </header>
                  ${verb === 'ListRecords' ? `
                  <metadata>
                    <oai_dc:dc 
                        xmlns:oai_dc="http://www.openarchives.org/OAI/2.0/oai_dc/" 
                        xmlns:dc="http://purl.org/dc/elements/1.1/" 
                        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
                        xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/oai_dc/ http://www.openarchives.org/OAI/2.0/oai_dc.xsd">
                      <dc:title>${escapeXml(r.title)}</dc:title>
                      ${Array.isArray(r.authors) ? r.authors.map((a: string) => `<dc:creator>${escapeXml(a)}</dc:creator>`).join('') : ''}
                      <dc:description>${escapeXml(r.abstract)}</dc:description>
                      <dc:date>${escapeXml(r.year?.toString())}</dc:date>
                      <dc:type>Text</dc:type>
                      <dc:identifier>${baseUrl.replace('/api/oai', '')}/dashboard/research/${r.id}</dc:identifier>
                      ${r.keywords ? r.keywords.map((k: string) => `<dc:subject>${escapeXml(k)}</dc:subject>`).join('') : ''}
                      <dc:publisher>University Repository</dc:publisher>
                    </oai_dc:dc>
                  </metadata>` : ''}
                </record>
              `).join('')}
            </ListRecords>`
            }
        }
    } else {
        content = `<error code="badVerb">Illegal OAI verb</error>`
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<OAI-PMH xmlns="http://www.openarchives.org/OAI/2.0/" 
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/ http://www.openarchives.org/OAI/2.0/OAI-PMH.xsd">
  <responseDate>${responseDate}</responseDate>
  <request verb="${verb}">${baseUrl}</request>
  ${content}
</OAI-PMH>`

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'text/xml',
            'Access-Control-Allow-Origin': '*'
        }
    })
}
