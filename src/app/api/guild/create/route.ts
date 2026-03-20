import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
    try {
        const { name, description, userId } = await request.json();
        if (!name || !userId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

        const { data: existing } = await supabaseAdmin.from('guild_members').select('id').eq('user_id', userId).single();
        if (existing) return NextResponse.json({ error: 'User already in a guild' }, { status: 400 });

        const { data: nameCheck } = await supabaseAdmin.from('guilds').select('id').ilike('name', name).single();
        if (nameCheck) return NextResponse.json({ error: 'Guild name taken' }, { status: 400 });

        const token = uuidv4();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 48);

        const { data: guild, error: guildErr } = await supabaseAdmin.from('guilds').insert({
            name,
            description,
            leader_id: userId,
            invite_token: token,
            invite_expires_at: expiresAt.toISOString(),
            member_count: 1
        }).select().single();

        if (guildErr) throw guildErr;

        await supabaseAdmin.from('guild_members').insert({
            guild_id: guild.id,
            user_id: userId,
            role: 'leader'
        });

        return NextResponse.json(guild);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
