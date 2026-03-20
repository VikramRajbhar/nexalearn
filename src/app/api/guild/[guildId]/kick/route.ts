import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request, props: { params: Promise<{ guildId: string }> }) {
    try {
        const params = await props.params;
        const { leaderId, targetUserId } = await request.json();

        const { data: guild } = await supabaseAdmin.from('guilds').select('leader_id, member_count').eq('id', params.guildId).single();
        if (!guild) return NextResponse.json({ error: 'Guild not found' }, { status: 404 });
        if (guild.leader_id !== leaderId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        await supabaseAdmin.from('guild_members').delete().eq('guild_id', params.guildId).eq('user_id', targetUserId);
        await supabaseAdmin.from('guilds').update({ member_count: Math.max(0, guild.member_count - 1) }).eq('id', params.guildId);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
