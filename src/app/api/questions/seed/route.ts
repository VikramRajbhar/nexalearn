import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { seedData } from '@/lib/seed-data';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    // Basic Auth Check
    const hasSession = req.cookies.has("better-auth.session_token") ||
        req.cookies.has("__Secure-better-auth.session_token") ||
        req.cookies.has("mock_session") ||
        req.headers.get("Authorization") === `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`;

    if (!hasSession) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Fetch existing questions by text to skip duplicates
        const { data: existing } = await supabase
            .from('questions')
            .select('question');

        const existingTexts = new Set(existing?.map(e => e.question) || []);

        // Filter out questions that already exist
        const uniqueToInsert = seedData.filter(q => !existingTexts.has(q.question));

        if (uniqueToInsert.length === 0) {
            return NextResponse.json({
                message: "Seeding skipped: Database already contains these questions.",
                inserted: 0
            });
        }

        // Insert new questions
        const { error } = await supabase
            .from('questions')
            .insert(uniqueToInsert);

        if (error) throw error;

        return NextResponse.json({
            message: "Seed successful",
            inserted: uniqueToInsert.length
        });
    } catch (error: any) {
        console.error("[Seed API Error]:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

