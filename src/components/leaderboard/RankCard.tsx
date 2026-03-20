'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Trophy, Calendar, Hash, Crown } from 'lucide-react';

interface RankData {
    globalRank: number | null;
    weeklyRank: number | null;
    topicRanks: Record<string, number>;
}

interface RankCardProps {
    ranks: RankData | null;
}

export function RankCard({ ranks }: RankCardProps) {
    if (!ranks) {
        return (
            <Card className="bg-bg-surface/80 border-border-default overflow-hidden relative">
                <div className="p-6 h-36 animate-pulse bg-bg-surface-2/50" />
            </Card>
        );
    }

    let bestTopic = 'None';
    let bestTopicRank = Infinity;
    Object.entries(ranks.topicRanks).forEach(([topic, rank]) => {
        if (rank < bestTopicRank) {
            bestTopicRank = rank;
            bestTopic = topic;
        }
    });

    return (
        <Card className="relative overflow-hidden group rounded-2xl border-0 bg-transparent ring-1 ring-accent-primary/30 shadow-[0_0_40px_rgba(108,99,255,0.15)] transition-all duration-500 hover:ring-accent-primary hover:shadow-[0_0_60px_rgba(108,99,255,0.25)] hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/20 via-bg-surface to-accent-primary/10 opacity-90 z-0" />

            {/* Animated gleam effect */}
            <div className="absolute top-0 left-[-100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 group-hover:left-[200%] transition-all duration-1000 ease-in-out z-0" />

            <CardContent className="p-8 relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-accent-primary tracking-widest flex items-center gap-3">
                        <Crown className="w-6 h-6 text-accent-primary drop-shadow-[0_0_10px_rgba(108,99,255,0.8)]" />
                        <span className="drop-shadow-md text-white uppercase">Your Combat Record</span>
                    </h3>
                    <div className="px-3 py-1 bg-accent-primary/20 text-accent-primary font-bold text-xs rounded-full border border-accent-primary/50 animate-pulse">
                        LIVE SYNCHRONIZED
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-border/50">
                    <div className="flex flex-col md:pr-6">
                        <div className="text-text-secondary text-sm font-semibold uppercase flex items-center gap-2 mb-2">
                            <Trophy className="w-4 h-4 text-yellow-500 saturate-150" /> Global Rank
                        </div>
                        <div className="text-5xl font-black text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
                            {ranks.globalRank ? <><span className="text-accent-primary/50 text-3xl">#</span>{ranks.globalRank}</> : '-'}
                        </div>
                    </div>

                    <div className="flex flex-col md:px-6 pt-4 md:pt-0">
                        <div className="text-text-secondary text-sm font-semibold uppercase flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-blue-400 saturate-150" /> This Week
                        </div>
                        <div className="text-5xl font-black text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
                            {ranks.weeklyRank ? <><span className="text-accent-primary/50 text-3xl">#</span>{ranks.weeklyRank}</> : '-'}
                        </div>
                    </div>

                    <div className="flex flex-col md:pl-6 pt-4 md:pt-0">
                        <div className="text-text-secondary text-sm font-semibold uppercase flex items-center gap-2 mb-2">
                            <Hash className="w-4 h-4 text-purple-400 saturate-150" /> Best Topic
                        </div>
                        <div className="text-4xl font-black text-white truncate drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
                            {bestTopicRank === Infinity ? '-' : <><span className="text-accent-primary/50 text-2xl">#</span>{bestTopicRank}</>}
                        </div>
                        <div className="text-sm text-accent-primary font-bold tracking-wide mt-1 uppercase">
                            {bestTopicRank === Infinity ? 'Awaiting Data' : `In ${bestTopic}`}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
