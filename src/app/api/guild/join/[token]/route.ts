import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request, props: { params: Promise<{ token: string }> }) {
    try {
        const params = await props.params;
        const token = params.token;
        const { userId } = await request.json();

        const { data: guild } = await supabaseAdmin.from('guilds').select('*').eq('invite_token', token).single();
        if (!guild) return NextResponse.json({ error: 'Invalid invite link' }, { status: 404 });

        if (new Date(guild.invite_expires_at) < new Date()) {
            return NextResponse.json({ error: 'Invite link expired' }, { status: 400 });
        }

        if (guild.member_count >= 10) {
            return NextResponse.json({ error: 'Guild is full' }, { status: 400 });
        }

        const { data: existing } = await supabaseAdmin.from('guild_members').select('id').eq('user_id', userId).single();
        if (existing) return NextResponse.json({ error: 'Already in a guild' }, { status: 400 });

        await supabaseAdmin.from('guild_members').insert({
            guild_id: guild.id,
            user_id: userId,
            role: 'member'
        });

        await supabaseAdmin.from('guilds').update({ member_count: guild.member_count + 1 }).eq('id', guild.id);

        return NextResponse.json(guild);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
