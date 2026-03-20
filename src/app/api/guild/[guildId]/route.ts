import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, props: { params: Promise<{ guildId: string }> }) {
    try {
        const params = await props.params;
        const { searchParams } = new URL(request.url);
        const requestingUserId = searchParams.get('userId');

        const { data: guild, error: err } = await supabaseAdmin.from('guilds').select('*').eq('id', params.guildId).single();
        if (err || !guild) return NextResponse.json({ error: 'Guild not found' }, { status: 404 });

        const { data: members } = await supabaseAdmin
            .from('guild_members')
            .select('*, users(username, avatar_url, league)')
            .eq('guild_id', guild.id)
            .order('weekly_xp', { ascending: false });

        const memberIds = members?.map(m => m.user_id) || [];
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: battles } = await supabaseAdmin
            .from('battle_history')
            .select('played_at, xp_earned')
            .in('user_id', memberIds)
            .gte('played_at', sevenDaysAgo.toISOString());

        const chartMap: Record<string, number> = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
            chartMap[dayStr] = 0;
        }

        if (battles) {
            for (const b of battles) {
                const bd = new Date(b.played_at).toLocaleDateString('en-US', { weekday: 'short' });
                if (chartMap[bd] !== undefined) chartMap[bd] += b.xp_earned || 0;
            }
        }
        const weeklyXPChart = Object.keys(chartMap).map(k => ({ day: k, xp: chartMap[k] }));

        let weakestSharedTopic = null;
        const { data: skills } = await supabaseAdmin.from('skill_scores').select('topic, score').in('user_id', memberIds);
        if (skills && skills.length > 0) {
            const topicSums: Record<string, { total: number, count: number }> = {};
            for (const s of skills) {
                if (!topicSums[s.topic]) topicSums[s.topic] = { total: 0, count: 0 };
                topicSums[s.topic].total += s.score;
                topicSums[s.topic].count += 1;
            }
            let lowestAvg = Infinity;
            for (const [topic, stats] of Object.entries(topicSums)) {
                const avg = stats.total / stats.count;
                if (avg < lowestAvg) {
                    lowestAvg = avg;
                    weakestSharedTopic = topic;
                }
            }
        }

        const myMember = members?.find(m => m.user_id === requestingUserId);

        const { count } = await supabaseAdmin.from('guilds').select('*', { count: 'exact', head: true }).gt('weekly_xp', guild.weekly_xp);
        const guildRank = (count || 0) + 1;

        return NextResponse.json({
            guild,
            members: members || [],
            weeklyXPChart,
            myContribution: myMember?.weekly_xp || 0,
            isLeader: guild.leader_id === requestingUserId,
            guildRank,
            weakestSharedTopic
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
