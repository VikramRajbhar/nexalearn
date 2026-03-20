import { supabase } from './supabase';
import type { User, SkillScore, Guild, GuildMember, BattleHistory } from '@/types';

export async function getUser(authId: string): Promise<User> {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authId)
        .single();

    if (error) throw error;
    return data;
}

export async function createUser(userData: Partial<User>): Promise<User> {
    const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateUser(authId: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('auth_id', authId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getSkillScores(userId: string): Promise<SkillScore[]> {
    const { data, error } = await supabase
        .from('skill_scores')
        .select('*')
        .eq('user_id', userId);

    if (error) throw error;
    return data || [];
}

export async function updateSkillScore(userId: string, topic: string, newScore: number): Promise<void> {
    const { error } = await supabase
        .from('skill_scores')
        .upsert({ user_id: userId, topic, score: newScore }, { onConflict: 'user_id,topic' });

    if (error) throw error;
}

export async function getLeaderboard(type: 'global' | 'topic', topic?: string): Promise<User[]> {
    if (type === 'global') {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('total_xp', { ascending: false })
            .limit(100);

        if (error) throw error;
        return data || [];
    } else {
        const { data, error } = await supabase
            .from('skill_scores')
            .select('score, user_id, topic, users(*)')
            .eq('topic', topic)
            .order('score', { ascending: false })
            .limit(100);

        if (error) throw error;
        // Map back to User objects with their specific topic score attached
        return data?.map(d => d.users).filter(Boolean) as unknown as User[] || [];
    }
}

export async function getBattleHistory(userId: string): Promise<BattleHistory[]> {
    const { data, error } = await supabase
        .from('battle_history')
        .select('*')
        .or(`user_id.eq.${userId},opponent_id.eq.${userId}`)
        .order('played_at', { ascending: false })
        .limit(50);

    if (error) throw error;
    return data || [];
}

export async function getGuild(guildId: string): Promise<Guild> {
    const { data, error } = await supabase
        .from('guilds')
        .select('*')
        .eq('id', guildId)
        .single();

    if (error) throw error;
    return data;
}

export async function getGuildMembers(guildId: string): Promise<GuildMember[]> {
    const { data, error } = await supabase
        .from('guild_members')
        .select('*, users(*)')
        .eq('guild_id', guildId)
        .order('weekly_xp', { ascending: false });

    if (error) throw error;
    return data || [];
}
