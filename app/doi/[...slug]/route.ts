import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Init Supabase Client (Admin context if needed, but anon is fine for public fetch)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string[] }> }
) {
    const unwrappedParams = await params
    // Reconstruct DOI from slug segments (e.g. ['10.5555', 'udu.2026.b4ca84'] -> '10.5555/udu.2026.b4ca84')
    const doi = unwrappedParams.slug.join("/");

    if (!doi) {
        return NextResponse.json({ error: "Invalid DOI format" }, { status: 400 });
    }

    try {
        // Find investigation with this DOI
        const { data, error } = await supabase
            .from("investigations")
            .select("id")
            .eq("doi", doi)
            .single();

        if (error || !data) {
            return NextResponse.json(
                { error: "DOI not found", doi_queried: doi },
                { status: 404 }
            );
        }

        // Redirect to the research detail page
        const url = request.nextUrl.clone();
        url.pathname = `/dashboard/research/${data.id}`;
        return NextResponse.redirect(url);

    } catch (err) {
        console.error("DOI Resolution Error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
