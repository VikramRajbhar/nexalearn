import { Redis } from '@upstash/redis';
import { supabaseAdmin } from '@/lib/supabase';

export const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || 'http://localhost:8079',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || 'missing_token',
});

export function getCurrentWeekKey() {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-${weekNo}`;
}

export async function updateLeaderboard(
    userId: string,
    username: string,
    college: string | null,
    league: string | null,
    xpEarned: number,
    topic: string
) {
    const weekKey = getCurrentWeekKey();

    const p = redis.pipeline();

    p.zincrby('leaderboard:global', xpEarned, userId);
    if (topic) p.zincrby(`leaderboard:topic:${topic}`, xpEarned, userId);
    p.zincrby(`leaderboard:weekly:${weekKey}`, xpEarned, userId);
    if (college) p.zincrby(`leaderboard:college:${college}`, xpEarned, userId);

    p.set(`user:meta:${userId}`, {
        username,
        college: college || 'Unknown',
        league: league || 'Bronze',
        avatar_url: ''
    });

    p.expire(`leaderboard:weekly:${weekKey}`, 1209600);

    await p.exec();
}

async function enrichWithMetadata(zrangeData: any[]) {
    if (!zrangeData || zrangeData.length === 0) return [];

    const userIds: string[] = [];
    const scores: number[] = [];

    if (typeof zrangeData[0] === 'object' && zrangeData[0] !== null && 'member' in zrangeData[0]) {
        zrangeData.forEach((item: any) => {
            userIds.push(item.member as string);
            scores.push(item.score as number);
        });
    } else {
        for (let i = 0; i < zrangeData.length; i += 2) {
            userIds.push(zrangeData[i] as string);
            scores.push(parseFloat(zrangeData[i + 1] as string));
        }
    }

    if (userIds.length === 0) return [];

    const p = redis.pipeline();
    userIds.forEach(id => p.get(`user:meta:${id}`));
    const metaResults = await p.exec() as any[];

    return userIds.map((userId, idx) => {
        const meta = metaResults[idx] || {};
        return {
            rank: idx + 1,
            userId,
            score: scores[idx],
            username: meta.username || 'Unknown Player',
            college: meta.college || 'Unknown',
            league: meta.league || 'Bronze',
            avatar_url: meta.avatar_url || ''
        };
    });
}

export async function getGlobalLeaderboard(limit = 100) {
    const data = await redis.zrange('leaderboard:global', 0, limit - 1, { rev: true, withScores: true });
    return enrichWithMetadata(data);
}

export async function getTopicLeaderboard(topic: string, limit = 50) {
    const data = await redis.zrange(`leaderboard:topic:${topic}`, 0, limit - 1, { rev: true, withScores: true });
    return enrichWithMetadata(data);
}

export async function getWeeklyLeaderboard(limit = 50) {
    const weekKey = getCurrentWeekKey();
    const data = await redis.zrange(`leaderboard:weekly:${weekKey}`, 0, limit - 1, { rev: true, withScores: true });
    return enrichWithMetadata(data);
}

export async function getUserRank(userId: string) {
    const globalRank = await redis.zrevrank('leaderboard:global', userId);
    const weekKey = getCurrentWeekKey();
    const weeklyRank = await redis.zrevrank(`leaderboard:weekly:${weekKey}`, userId);

    const topics = ["DSA", "JavaScript", "SQL", "Python", "React", "C++", "Java"];
    const p = redis.pipeline();
    topics.forEach(t => p.zrevrank(`leaderboard:topic:${t}`, userId));
    const topicRankResults = await p.exec() as (number | null)[];

    const topicRanks: Record<string, number> = {};
    topics.forEach((t, i) => {
        if (topicRankResults[i] !== null) {
            topicRanks[t] = (topicRankResults[i] as number) + 1;
        }
    });

    return {
        globalRank: globalRank !== null ? globalRank + 1 : null,
        weeklyRank: weeklyRank !== null ? weeklyRank + 1 : null,
        topicRanks
    };
}

export async function seedLeaderboardFromSupabase() {
    const { data: users } = await supabaseAdmin
        .from('users')
        .select('id, username, college, league, total_xp')
        .gt('total_xp', 0);

    if (!users) return { success: false, error: 'No users found' };

    const p = redis.pipeline();
    // Clear existing to avoid double increments on repeated seed calls
    p.del('leaderboard:global');

    for (const user of users) {
        p.zadd('leaderboard:global', { score: user.total_xp, member: user.id });
        if (user.college) p.zadd(`leaderboard:college:${user.college}`, { score: user.total_xp, member: user.id });

        p.set(`user:meta:${user.id}`, {
            username: user.username,
            college: user.college || 'Unknown',
            league: user.league || 'Bronze',
            avatar_url: ''
        });
    }

    const { data: skills } = await supabaseAdmin.from('skill_scores').select('user_id, topic, score');
    if (skills) {
        for (const skill of skills) {
            if (skill.score > 0) {
                p.zadd(`leaderboard:topic:${skill.topic}`, { score: skill.score, member: skill.user_id });
            }
        }
    }

    await p.exec();
    return { success: true, usersSeeded: users.length };
}
