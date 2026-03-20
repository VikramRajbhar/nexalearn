export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserAchievements } from '@/lib/achievements';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ username: string }> }
) {
    try {
        const { username } = await params;

        // Fetch user by username
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('id, username, college, semester, avatar_url, league, total_xp, battles_played, battles_won')
            .eq('username', username)
            .single();

        if (userError || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Fetch skill scores
        const { data: skillScores } = await supabaseAdmin
            .from('skill_scores')
            .select('*')
            .eq('user_id', user.id);

        // Fetch recent battles
        const { data: recentBattles } = await supabaseAdmin
            .from('battle_history')
            .select('*')
            .eq('user_id', user.id)
            .order('played_at', { ascending: false })
            .limit(10);

        // Fetch achievements
        const achievements = await getUserAchievements(user.id);

        // Calculate win rate
        const totalPlayed = user.battles_played || 0;
        const totalWins = user.battles_won || 0;
        const winRate = totalPlayed > 0 ? Math.round((totalWins / totalPlayed) * 100) : 0;

        return NextResponse.json({
            user,
            skillScores: skillScores || [],
            recentBattles: recentBattles || [],
            achievements,
            winRate
        });

    } catch (error) {
        console.error('Error fetching public profile:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
