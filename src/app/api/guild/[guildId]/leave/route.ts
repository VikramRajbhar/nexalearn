export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request, props: { params: Promise<{ guildId: string }> }) {
    try {
        const params = await props.params;
        const { userId } = await request.json();

        const { data: member } = await supabaseAdmin.from('guild_members').select('role').eq('guild_id', params.guildId).eq('user_id', userId).single();
        if (!member) return NextResponse.json({ error: 'Not a member' }, { status: 400 });

        await supabaseAdmin.from('guild_members').delete().eq('guild_id', params.guildId).eq('user_id', userId);

        const { data: guild } = await supabaseAdmin.from('guilds').select('member_count').eq('id', params.guildId).single();
        if (!guild) return NextResponse.json({ error: 'Guild not found' }, { status: 404 });

        const newCount = Math.max(0, guild.member_count - 1);

        if (newCount === 0) {
            await supabaseAdmin.from('guilds').delete().eq('id', params.guildId);
        } else {
            await supabaseAdmin.from('guilds').update({ member_count: newCount }).eq('id', params.guildId);

            if (member.role === 'leader') {
                const { data: newLeader } = await supabaseAdmin.from('guild_members').select('user_id').eq('guild_id', params.guildId).order('joined_at', { ascending: true }).limit(1).single();
                if (newLeader) {
                    await supabaseAdmin.from('guild_members').update({ role: 'leader' }).eq('guild_id', params.guildId).eq('user_id', newLeader.user_id);
                    await supabaseAdmin.from('guilds').update({ leader_id: newLeader.user_id }).eq('id', params.guildId);
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
