import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, SkillScore, Guild } from '@/types';

interface UserState {
    user: User | null;
    skillScores: SkillScore[];
    currentLeague: string;
    guildInfo: Guild | null;
    setUser: (user: User) => void;
    updateSkillScore: (score: SkillScore) => void;
    updateLeague: (league: User['league']) => void;
    setGuildInfo: (guild: Guild | null) => void;
    clearUser: () => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            user: null,
            skillScores: [],
            currentLeague: 'Bronze',
            guildInfo: null,

            setUser: (user) => set({ user, currentLeague: user?.league || 'Bronze' }),

            updateSkillScore: (newScore) => set((state) => {
                const existing = state.skillScores.findIndex(s => s.topic === newScore.topic);
                const newScores = [...state.skillScores];
                if (existing >= 0) {
                    newScores[existing] = newScore;
                } else {
                    newScores.push(newScore);
                }
                return { skillScores: newScores };
            }),

            updateLeague: (league) => set((state) => ({
                currentLeague: league,
                user: state.user ? { ...state.user, league } : null
            })),

            setGuildInfo: (guildInfo) => set({ guildInfo }),

            clearUser: () => set({ user: null, skillScores: [], currentLeague: 'Bronze', guildInfo: null }),
        }),
        {
            name: 'nexalearn-user-storage',
        }
    )
);
