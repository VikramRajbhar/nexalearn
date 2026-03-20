import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, props: { params: Promise<{ token: string }> }) {
    try {
        const params = await props.params;
        const { data: guild, error } = await supabaseAdmin.from('guilds').select('*, users!leader_id(username)').eq('invite_token', params.token).single();
        if (error || !guild) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        if (new Date(guild.invite_expires_at) < new Date()) {
            return NextResponse.json({ error: 'Expired' }, { status: 400 });
        }

        return NextResponse.json(guild);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
