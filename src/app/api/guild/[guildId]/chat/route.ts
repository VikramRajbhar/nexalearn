import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request, props: { params: Promise<{ guildId: string }> }) {
    try {
        const params = await props.params;
        const { userId, username, message } = await request.json();

        if (!userId || !username || !message?.trim()) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        if (message.length > 500) {
            return NextResponse.json({ error: 'Message too long' }, { status: 400 });
        }

        // Verify user is a member of this guild
        const { data: membership } = await supabaseAdmin
            .from('guild_members')
            .select('id')
            .eq('guild_id', params.guildId)
            .eq('user_id', userId)
            .single();

        if (!membership) {
            return NextResponse.json({ error: 'Not a guild member' }, { status: 403 });
        }

        const { data: msg, error } = await supabaseAdmin
            .from('guild_messages')
            .insert({
                guild_id: params.guildId,
                user_id: userId,
                username: username,
                message: message.trim()
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(msg);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
