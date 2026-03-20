import { supabaseAdmin } from './supabase';

export interface AchievementDef {
    id: string;
    name: string;
    description: string;
    icon: string;
    xpReward: number;
    rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
    earned_at?: string;
}

export const ACHIEVEMENTS: Record<string, AchievementDef> = {
    // Battle achievements
    FIRST_BATTLE: {
        id: 'first_battle',
        name: 'First Blood',
        description: 'Complete your first battle',
        icon: '⚔️',
        xpReward: 50,
        rarity: 'common'
    },
    FIRST_WIN: {
        id: 'first_win',
        name: 'Victory!',
        description: 'Win your first battle',
        icon: '🏆',
        xpReward: 100,
        rarity: 'common'
    },
    WIN_STREAK_3: {
        id: 'win_streak_3',
        name: 'On Fire',
        description: 'Win 3 battles in a row',
        icon: '🔥',
        xpReward: 200,
        rarity: 'uncommon'
    },
    WIN_STREAK_5: {
        id: 'win_streak_5',
        name: 'Unstoppable',
        description: 'Win 5 battles in a row',
        icon: '💥',
        xpReward: 500,
        rarity: 'rare'
    },
    WIN_STREAK_10: {
        id: 'win_streak_10',
        name: 'Legendary',
        description: 'Win 10 battles in a row',
        icon: '👑',
        xpReward: 1000,
        rarity: 'legendary'
    },
    BATTLES_10: {
        id: 'battles_10',
        name: 'Veteran',
        description: 'Play 10 battles',
        icon: '🎖️',
        xpReward: 150,
        rarity: 'common'
    },
    BATTLES_50: {
        id: 'battles_50',
        name: 'Warrior',
        description: 'Play 50 battles',
        icon: '🛡️',
        xpReward: 500,
        rarity: 'uncommon'
    },
    BATTLES_100: {
        id: 'battles_100',
        name: 'Champion',
        description: 'Play 100 battles',
        icon: '🎯',
        xpReward: 1000,
        rarity: 'rare'
    },

    // Skill achievements
    TOPIC_MASTER: {
        id: 'topic_master',
        name: 'Topic Master',
        description: 'Reach score 90+ in any topic',
        icon: '🧠',
        xpReward: 300,
        rarity: 'uncommon'
    },
    PERFECT_BATTLE: {
        id: 'perfect_battle',
        name: 'Perfect',
        description: 'Answer all 10 questions correctly',
        icon: '💯',
        xpReward: 400,
        rarity: 'rare'
    },
    SPEED_DEMON: {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Answer 5 questions in under 3s each',
        icon: '⚡',
        xpReward: 300,
        rarity: 'uncommon'
    },
    UNDERDOG: {
        id: 'underdog',
        name: 'Underdog',
        description: 'Beat someone 2 leagues above you',
        icon: '🐕',
        xpReward: 500,
        rarity: 'rare'
    },

    // Social achievements
    GUILD_FOUNDER: {
        id: 'guild_founder',
        name: 'Guild Founder',
        description: 'Create your own guild',
        icon: '🏰',
        xpReward: 200,
        rarity: 'uncommon'
    },
    GUILD_CHAMPION: {
        id: 'guild_champion',
        name: 'Guild Champion',
        description: 'Your guild reaches #1 weekly rank',
        icon: '🌟',
        xpReward: 1000,
        rarity: 'legendary'
    },

    // League achievements
    REACH_SILVER: {
        id: 'reach_silver',
        name: 'Silver Knight',
        description: 'Reach Silver league',
        icon: '🥈',
        xpReward: 200,
        rarity: 'common'
    },
    REACH_GOLD: {
        id: 'reach_gold',
        name: 'Gold Rush',
        description: 'Reach Gold league',
        icon: '🥇',
        xpReward: 500,
        rarity: 'uncommon'
    },
    REACH_PLATINUM: {
        id: 'reach_platinum',
        name: 'Platinum Elite',
        description: 'Reach Platinum league',
        icon: '💎',
        xpReward: 1000,
        rarity: 'rare'
    },
    REACH_DIAMOND: {
        id: 'reach_diamond',
        name: 'Diamond Legend',
        description: 'Reach Diamond league',
        icon: '💠',
        xpReward: 2000,
        rarity: 'legendary'
    },
};

export type TriggerData = {
    battleResult?: 'win' | 'loss' | 'draw';
    correctAnswers?: number;
    totalQuestions?: number;
    fastAnswers?: number;
    opponentLeague?: string;
    userLeague?: string;
    newLeague?: string;
    guildCreated?: boolean;
};

const LEAGUE_RANKS: Record<string, number> = {
    'Bronze': 1,
    'Silver': 2,
    'Gold': 3,
    'Platinum': 4,
    'Diamond': 5
};

export async function checkAndAwardAchievements(userId: string, triggerData: TriggerData) {
    const { data: userAchievements } = await supabaseAdmin
        .from('achievements')
        .select('badge_type')
        .eq('user_id', userId);

    const earnedIds = new Set(userAchievements?.map((a: any) => a.badge_type) || []);
    const newlyEarned = [];

    // Get user profile for stats
    const { data: userStats } = await supabaseAdmin
        .from('users')
        .select('battles_played, battles_won, league')
        .eq('id', userId)
        .single();

    if (!userStats) return [];

    // Need battle history to calculate win streak
    const { data: battleHistory } = await supabaseAdmin
        .from('battle_history')
        .select('result')
        .eq('user_id', userId)
        .order('played_at', { ascending: false })
        .limit(10);

    let currentWinStreak = 0;
    if (battleHistory) {
        for (const battle of battleHistory) {
            if (battle.result === 'win') currentWinStreak++;
            else break;
        }
    }

    // Check conditions
    if (triggerData.battleResult) {
        if (!earnedIds.has(ACHIEVEMENTS.FIRST_BATTLE.id) && userStats.battles_played >= 1) {
            newlyEarned.push(ACHIEVEMENTS.FIRST_BATTLE);
        }
        if (triggerData.battleResult === 'win' && !earnedIds.has(ACHIEVEMENTS.FIRST_WIN.id) && userStats.battles_won >= 1) {
            newlyEarned.push(ACHIEVEMENTS.FIRST_WIN);
        }

        if (triggerData.battleResult === 'win') {
            if (!earnedIds.has(ACHIEVEMENTS.WIN_STREAK_3.id) && currentWinStreak >= 3) {
                newlyEarned.push(ACHIEVEMENTS.WIN_STREAK_3);
            }
            if (!earnedIds.has(ACHIEVEMENTS.WIN_STREAK_5.id) && currentWinStreak >= 5) {
                newlyEarned.push(ACHIEVEMENTS.WIN_STREAK_5);
            }
            if (!earnedIds.has(ACHIEVEMENTS.WIN_STREAK_10.id) && currentWinStreak >= 10) {
                newlyEarned.push(ACHIEVEMENTS.WIN_STREAK_10);
            }
        }

        if (!earnedIds.has(ACHIEVEMENTS.BATTLES_10.id) && userStats.battles_played >= 10) {
            newlyEarned.push(ACHIEVEMENTS.BATTLES_10);
        }
        if (!earnedIds.has(ACHIEVEMENTS.BATTLES_50.id) && userStats.battles_played >= 50) {
            newlyEarned.push(ACHIEVEMENTS.BATTLES_50);
        }
        if (!earnedIds.has(ACHIEVEMENTS.BATTLES_100.id) && userStats.battles_played >= 100) {
            newlyEarned.push(ACHIEVEMENTS.BATTLES_100);
        }

        if (!earnedIds.has(ACHIEVEMENTS.PERFECT_BATTLE.id) && triggerData.correctAnswers === triggerData.totalQuestions && triggerData.totalQuestions && triggerData.totalQuestions > 0) {
            newlyEarned.push(ACHIEVEMENTS.PERFECT_BATTLE);
        }

        if (!earnedIds.has(ACHIEVEMENTS.SPEED_DEMON.id) && triggerData.fastAnswers && triggerData.fastAnswers >= 5) {
            newlyEarned.push(ACHIEVEMENTS.SPEED_DEMON);
        }

        if (!earnedIds.has(ACHIEVEMENTS.UNDERDOG.id) && triggerData.battleResult === 'win' && triggerData.opponentLeague && triggerData.userLeague) {
            const opponentRank = LEAGUE_RANKS[triggerData.opponentLeague] || 1;
            const userRank = LEAGUE_RANKS[triggerData.userLeague] || 1;
            if (opponentRank - userRank >= 2) {
                newlyEarned.push(ACHIEVEMENTS.UNDERDOG);
            }
        }
    }

    // Guild creations
    if (triggerData.guildCreated && !earnedIds.has(ACHIEVEMENTS.GUILD_FOUNDER.id)) {
        newlyEarned.push(ACHIEVEMENTS.GUILD_FOUNDER);
    }

    // Leagues
    if (triggerData.newLeague) {
        const newRank = LEAGUE_RANKS[triggerData.newLeague] || 1;
        if (newRank >= LEAGUE_RANKS['Silver'] && !earnedIds.has(ACHIEVEMENTS.REACH_SILVER.id)) newlyEarned.push(ACHIEVEMENTS.REACH_SILVER);
        if (newRank >= LEAGUE_RANKS['Gold'] && !earnedIds.has(ACHIEVEMENTS.REACH_GOLD.id)) newlyEarned.push(ACHIEVEMENTS.REACH_GOLD);
        if (newRank >= LEAGUE_RANKS['Platinum'] && !earnedIds.has(ACHIEVEMENTS.REACH_PLATINUM.id)) newlyEarned.push(ACHIEVEMENTS.REACH_PLATINUM);
        if (newRank >= LEAGUE_RANKS['Diamond'] && !earnedIds.has(ACHIEVEMENTS.REACH_DIAMOND.id)) newlyEarned.push(ACHIEVEMENTS.REACH_DIAMOND);
    }

    // Skill Score Mastery (Wait, checking skill scores requires a select if trigger didn't pass it, assuming trigger might or we just query it here if requested)
    if (!earnedIds.has(ACHIEVEMENTS.TOPIC_MASTER.id)) {
        const { data: topScores } = await supabaseAdmin
            .from('skill_scores')
            .select('score')
            .eq('user_id', userId)
            .gte('score', 90)
            .limit(1);

        if (topScores && topScores.length > 0) {
            newlyEarned.push(ACHIEVEMENTS.TOPIC_MASTER);
        }
    }

    const awarded = [];
    for (const achievement of newlyEarned) {
        const res = await awardAchievement(userId, achievement.id);
        if (res) awarded.push(res);
    }

    return awarded;
}

export async function awardAchievement(userId: string, achievementId: string) {
    const achievementKey = Object.keys(ACHIEVEMENTS).find(
        k => ACHIEVEMENTS[k as keyof typeof ACHIEVEMENTS].id === achievementId
    );

    if (!achievementKey) return null;
    const achievement = ACHIEVEMENTS[achievementKey as keyof typeof ACHIEVEMENTS];

    // Atomic operation to check existence and insert, or simply insert and catch duplicate if constraints allowed, but we use badge_type constraint hopefully
    // Wait, no unique constraint on (user_id, badge_type) in schema, so we should check again
    const { data: existing } = await supabaseAdmin
        .from('achievements')
        .select('id')
        .eq('user_id', userId)
        .eq('badge_type', achievement.id)
        .single();

    if (existing) return null;

    const { error: insertError } = await supabaseAdmin
        .from('achievements')
        .insert({
            user_id: userId,
            badge_type: achievement.id,
            badge_name: achievement.name
        });

    if (insertError) {
        console.error('Failed to award achievement:', insertError);
        return null;
    }

    if (achievement.xpReward > 0) {
        const { data: user } = await supabaseAdmin
            .from('users')
            .select('total_xp')
            .eq('id', userId)
            .single();

        if (user) {
            await supabaseAdmin
                .from('users')
                .update({ total_xp: user.total_xp + achievement.xpReward })
                .eq('id', userId);
        }
    }

    return achievement;
}

export async function getUserAchievements(userId: string) {
    const { data: earnedAchievementsData } = await supabaseAdmin
        .from('achievements')
        .select('*')
        .eq('user_id', userId);

    const earnedIds = new Set(earnedAchievementsData?.map((a: any) => a.badge_type) || []);
    const earned = [];
    const locked = [];

    for (const key of Object.keys(ACHIEVEMENTS)) {
        const achievementDef = ACHIEVEMENTS[key as keyof typeof ACHIEVEMENTS];

        if (earnedIds.has(achievementDef.id)) {
            const record = earnedAchievementsData?.find((a: any) => a.badge_type === achievementDef.id);
            earned.push({
                ...achievementDef,
                earned_at: record?.earned_at
            });
        } else {
            locked.push(achievementDef);
        }
    }

    return { earned, locked };
}
