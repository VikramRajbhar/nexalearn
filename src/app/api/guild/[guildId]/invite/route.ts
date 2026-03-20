import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request, props: { params: Promise<{ guildId: string }> }) {
    try {
        const params = await props.params;
        const { userId } = await request.json();

        const { data: guild } = await supabaseAdmin.from('guilds').select('leader_id').eq('id', params.guildId).single();
        if (!guild) return NextResponse.json({ error: 'Guild not found' }, { status: 404 });
        if (guild.leader_id !== userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const token = uuidv4();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 48);

        await supabaseAdmin.from('guilds').update({
            invite_token: token,
            invite_expires_at: expiresAt.toISOString(),
        }).eq('id', params.guildId);

        return NextResponse.json({ invite_token: token });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
