import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/userStore';
import type { User, SkillScore, BattleHistory, Guild } from '@/types';

export interface DashboardData {
    user: User | null;
    skillScores: SkillScore[];
    weakNodes: SkillScore[];
    recentBattles: BattleHistory[];
    totalBattles: number;
    winRate: number;
    currentLeague: string;
    xpToNextLeague: number;
    xpProgress: number;
    guildInfo: Guild | null;
}

export function useDashboard() {
    const { user } = useUserStore();
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchDashboardData() {
            if (!user?.id) {
                setIsLoading(false);
                return;
            }
            try {
                setIsLoading(true);
                setError(null);

                const [
                    { data: freshUser, error: userError },
                    { data: skillScores, error: skillError },
                    { data: recentBattles, error: battleError },
                    { data: guildMember }
                ] = await Promise.all([
                    supabase.from('users').select('*').eq('id', user.id).single(),
                    supabase.from('skill_scores').select('*').eq('user_id', user.id),
                    supabase.from('battle_history').select('*').eq('user_id', user.id).order('played_at', { ascending: false }).limit(5),
                    supabase.from('guild_members').select('*, guilds(*)').eq('user_id', user.id).single()
                ]);

                if (userError) throw userError;
                if (skillError) throw skillError;
                if (battleError) throw battleError;

                const scores = skillScores || [];
                const battles = recentBattles || [];
                const activeUser = freshUser || user;

                // Weak Nodes Calc
                const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
                const weakNodes = [...scores]
                    .filter(s => s.score < 50 || new Date(s.last_updated).getTime() < sevenDaysAgo)
                    .sort((a, b) => a.score - b.score)
                    .slice(0, 3);

                // XP & League logic
                const currentXP = activeUser.total_xp || 0;
                let nextThreshold = 1000; // Bronze to Silver
                let baseXP = 0;
                let currentLeague = 'Bronze';

                if (currentXP >= 40000) {
                    currentLeague = 'Diamond';
                    nextThreshold = currentXP;
                    baseXP = 40000;
                } else if (currentXP >= 15000) {
                    currentLeague = 'Platinum';
                    nextThreshold = 40000;
                    baseXP = 15000;
                } else if (currentXP >= 5000) {
                    currentLeague = 'Gold';
                    nextThreshold = 15000;
                    baseXP = 5000;
                } else if (currentXP >= 1000) {
                    currentLeague = 'Silver';
                    nextThreshold = 5000;
                    baseXP = 1000;
                }

                const xpProgress = currentLeague === 'Diamond'
                    ? 100
                    : Math.max(0, Math.min(100, Math.round(((currentXP - baseXP) / (nextThreshold - baseXP)) * 100)));

                const xpToNextLeague = currentLeague === 'Diamond' ? 0 : nextThreshold - currentXP;

                // Win Rate
                const totalPlayed = activeUser.battles_played || 0;
                const totalWins = activeUser.battles_won || 0;
                const winRate = totalPlayed > 0 ? Math.round((totalWins / totalPlayed) * 100) : 0;

                const guildInfo = guildMember?.guilds ? (guildMember.guilds as unknown as Guild) : null;

                setData({
                    user: activeUser,
                    skillScores: scores,
                    weakNodes,
                    recentBattles: battles,
                    totalBattles: totalPlayed,
                    winRate,
                    currentLeague,
                    xpToNextLeague,
                    xpProgress,
                    guildInfo
                });
            } catch (err: any) {
                console.error('Failed to load dashboard data:', err);
                setError(err.message || 'Failed to load dashboard data');
            } finally {
                setIsLoading(false);
            }
        }

        fetchDashboardData();
    }, [user?.id]);

    return { data, isLoading, error, refetch: () => setData(null) };
}
