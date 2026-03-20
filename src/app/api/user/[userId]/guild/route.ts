import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, props: { params: Promise<{ userId: string }> }) {
    try {
        const params = await props.params;
        const { data } = await supabaseAdmin.from('guild_members').select('guild_id').eq('user_id', params.userId).single();
        return NextResponse.json({ guildId: data?.guild_id || null });
    } catch {
        return NextResponse.json({ guildId: null });
    }
}
