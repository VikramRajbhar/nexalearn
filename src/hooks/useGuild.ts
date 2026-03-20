import { useState, useCallback, useEffect } from 'react';
import { useUserStore } from '@/store/userStore';

export interface Guild {
    id: string;
    name: string;
    description: string;
    leader_id: string;
    weekly_xp: number;
    total_xp: number;
    member_count: number;
    invite_token: string;
    created_at: string;
}

export interface GuildMember {
    id: string;
    guild_id: string;
    user_id: string;
    weekly_xp: number;
    role: string;
    joined_at: string;
    users?: {
        username: string;
        league: string;
        avatar_url: string;
    };
}

export interface GuildData {
    guild: Guild | null;
    members: GuildMember[];
    weeklyXPChart: { day: string, xp: number }[];
    myContribution: number;
    guildRank: number;
    weakestSharedTopic: string | null;
    isLeader: boolean;
}

export function useGuild(guildId: string | null) {
    const user = useUserStore((state) => state.user);
    const [data, setData] = useState<GuildData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchGuildData = useCallback(async () => {
        if (!guildId || !user) return;

        setIsLoading(true);
        try {
            const res = await fetch(`/api/guild/${guildId}?userId=${user.id}`);
            if (!res.ok) throw new Error('Failed to fetch guild state');
            const json = await res.json();
            if (json.error) throw new Error(json.error);

            setData(json);
            setError(null);
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [guildId, user]);

    useEffect(() => {
        fetchGuildData();
    }, [fetchGuildData]);

    return { data, isLoading, error, refresh: fetchGuildData };
}
