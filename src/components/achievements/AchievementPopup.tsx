'use client';

import React, { useEffect, useState } from 'react';
import { getSocket } from '@/lib/socket-client';
import { useUserStore } from '@/store/userStore';
import { useBattleStore } from '@/store/battleStore';
import { X } from 'lucide-react';
import type { AchievementDef } from '@/lib/achievements';

const rarityColors = {
    common: 'border-slate-500',
    uncommon: 'border-green-500',
    rare: 'border-blue-500',
    legendary: 'border-yellow-500 shadow-[0_0_15px_rgba(255,215,0,0.5)]',
};

const rarityText = {
    common: 'text-slate-400',
    uncommon: 'text-green-400',
    rare: 'text-blue-400',
    legendary: 'text-yellow-400',
};

export function AchievementPopup() {
    const { user } = useUserStore();
    const [queue, setQueue] = useState<AchievementDef[]>([]);
    const [current, setCurrent] = useState<AchievementDef | null>(null);

    useEffect(() => {
        if (!user) return;
        const socket = getSocket();

        const handleAchievement = (data: { userId: string; achievements: AchievementDef[] }) => {
            if (data.userId === user.id) {
                setQueue((prev) => [...prev, ...data.achievements]);
                const currentNew = useBattleStore.getState().newAchievements || [];
                useBattleStore.getState().setNewAchievements([...currentNew, ...data.achievements]);
            }
        };

        socket.on('achievement:earned', handleAchievement);
        return () => {
            socket.off('achievement:earned', handleAchievement);
        };
    }, [user]);

    useEffect(() => {
        if (!current && queue.length > 0) {
            setCurrent(queue[0]);
            setQueue((prev) => prev.slice(1));
        }
    }, [queue, current]);

    useEffect(() => {
        if (current) {
            const timer = setTimeout(() => {
                dismiss();
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [current]);

    const dismiss = () => {
        setCurrent(null);
        if (queue.length > 0) {
            setTimeout(() => {
                setCurrent(queue[0]);
                setQueue((prev) => prev.slice(1));
            }, 1000); // 1s gap
        }
    };

    if (!current) return null;

    return (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-4 fade-in duration-500">
            <div
                className={`bg-surface border-2 rounded-xl p-4 pr-12 w-80 relative flex items-start gap-4 ${rarityColors[current.rarity]}`}
            >
                <button
                    onClick={dismiss}
                    className="absolute top-2 right-2 text-text-secondary hover:text-text"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="text-4xl">{current.icon}</div>

                <div className="flex-1">
                    <p className="text-xs font-bold text-yellow-500 mb-1 uppercase tracking-wider">
                        Achievement Unlocked!
                    </p>
                    <h4 className="font-bold text-text mb-1">{current.name}</h4>
                    <p className="text-xs text-text-secondary mb-2">{current.description}</p>

                    <div className="flex items-center justify-between text-xs font-bold">
                        <span className={`${rarityText[current.rarity]} uppercase`}>
                            {current.rarity}
                        </span>
                        <span className="text-yellow-400">+{current.xpReward} XP</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
