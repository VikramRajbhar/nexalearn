import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const { userId, username, college, semester, avatar_url } = await request.json();

        if (!userId || !username || !college || !semester) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if username is taken by someone else
        const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('username', username)
            .neq('id', userId)
            .single();

        if (existingUser) {
            return NextResponse.json({ error: 'Username is already taken' }, { status: 400 });
        }

        const { data: updatedUser, error } = await supabaseAdmin
            .from('users')
            .update({
                username,
                college,
                semester: parseInt(semester, 10),
                avatar_url
            })
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json({ user: updatedUser });
    } catch (error: any) {
        console.error('Error updating profile:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
