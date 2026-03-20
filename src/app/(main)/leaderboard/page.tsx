'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TopicFilter, TABS } from '@/components/leaderboard/TopicFilter';
import { RankCard } from '@/components/leaderboard/RankCard';
import { LeaderboardTable, LeaderboardEntry } from '@/components/leaderboard/LeaderboardTable';
import { useUserStore } from '@/store/userStore';
import { Card, CardContent } from '@/components/ui/Card';

export default function LeaderboardPage() {
    const [activeTab, setActiveTab] = useState('global');
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [ranks, setRanks] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const user = useUserStore((state) => state.user);

    const fetchLeaderboard = useCallback(async (tab: string) => {
        setIsLoading(true);
        try {
            let endpoint = '/api/leaderboard/global?limit=100';
            if (tab === 'weekly') {
                endpoint = '/api/leaderboard/weekly?limit=100';
            } else if (tab !== 'global') {
                endpoint = `/api/leaderboard/topic/${encodeURIComponent(tab)}?limit=100`;
            }

            const res = await fetch(endpoint);
            const data = await res.json();
            if (!data.error) {
                setEntries(data);
            }
        } catch (e) {
            console.error('Error fetching leaderboard', e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchMyRanks = useCallback(async () => {
        if (!user) return;
        try {
            const res = await fetch(`/api/leaderboard/me?userId=${user.id}`);
            const data = await res.json();
            if (!data.error) {
                setRanks(data);
            }
        } catch (e) {
            console.error('Error fetching my ranks', e);
        }
    }, [user]);

    useEffect(() => {
        fetchLeaderboard(activeTab);
    }, [activeTab, fetchLeaderboard]);

    useEffect(() => {
        if (user) {
            fetchMyRanks();
        }
    }, [user, fetchMyRanks]);

    // Auto refresh every 60 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            fetchLeaderboard(activeTab);
            if (user) fetchMyRanks();
        }, 60000);
        return () => clearInterval(interval);
    }, [activeTab, user, fetchLeaderboard, fetchMyRanks]);

    return (
        <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black mb-2 flex items-center gap-3 drop-shadow-md">
                        <Trophy className="w-8 h-8 text-yellow-500" /> LEADERBOARD
                    </h1>
                    <p className="text-text-secondary text-lg">
                        {user?.college ? `Top players at ${user.college} & globally` : 'Discover the top players in the arena'}
                    </p>
                </div>
                <button
                    onClick={() => { fetchLeaderboard(activeTab); if (user) fetchMyRanks() }}
                    className="flex items-center gap-2 text-text-secondary hover:text-accent-primary transition-colors text-sm font-bold uppercase tracking-wider"
                >
                    <RefreshCcw className={cn("w-4 h-4", isLoading && "animate-spin")} /> Refresh
                </button>
            </div>

            {user && <RankCard ranks={ranks} />}

            <div className="bg-bg-surface/50 border border-border-default rounded-2xl p-4 md:p-6 shadow-sm">
                <div className="mb-6">
                    <TopicFilter activeTab={activeTab} onSelect={setActiveTab} />
                </div>

                <LeaderboardTable
                    entries={entries}
                    currentUserId={user?.id}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
}
