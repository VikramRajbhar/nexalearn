'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';

interface StatsCardsProps {
    totalBattles: number;
    winRate: number;
    totalXP: number;
    currentLeague: string;
}

const LEAGUE_COLORS: Record<string, string> = {
    Bronze: '#CD7F32',
    Silver: '#C0C0C0',
    Gold: '#FFD700',
    Platinum: '#00CED1',
    Diamond: '#00FF41',
};

const LEAGUE_EMOJIS: Record<string, string> = {
    Bronze: '🥉',
    Silver: '🥈',
    Gold: '🥇',
    Platinum: '💎',
    Diamond: '👑',
};

export function StatsCards({ totalBattles, winRate, totalXP, currentLeague }: StatsCardsProps) {
    const winRateColor = winRate >= 50 ? 'text-green-500' : 'text-red-500';
    const leagueColor = LEAGUE_COLORS[currentLeague] || '#00FF41';
    const leagueEmoji = LEAGUE_EMOJIS[currentLeague] || '🛡️';

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Card 1: Total Battles */}
            <Card className="bg-surface/80 border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_5px_20px_rgba(0,255,65,0.15)] group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="p-5 flex flex-col items-center text-center">
                    <div className="text-3xl mb-2">⚔️</div>
                    <div className="text-2xl font-bold text-blue-500">{totalBattles.toLocaleString()}</div>
                    <div className="text-xs text-text-secondary uppercase tracking-wider font-semibold mt-1">Battles Played</div>
                </CardContent>
            </Card>

            {/* Card 2: Win Rate */}
            <Card className="bg-surface/80 border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_5px_20px_rgba(0,255,65,0.15)] group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="p-5 flex flex-col items-center text-center">
                    <div className="text-3xl mb-2">🏆</div>
                    <div className={`text-2xl font-bold ${winRateColor}`}>{winRate}%</div>
                    <div className="text-xs text-text-secondary uppercase tracking-wider font-semibold mt-1">Win Rate</div>
                </CardContent>
            </Card>

            {/* Card 3: Total XP */}
            <Card className="bg-surface/80 border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_5px_20px_rgba(0,255,65,0.15)] group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="p-5 flex flex-col items-center text-center">
                    <div className="text-3xl mb-2">⚡</div>
                    <div className="text-2xl font-bold text-[#FFD700]">{totalXP.toLocaleString()}</div>
                    <div className="text-xs text-text-secondary uppercase tracking-wider font-semibold mt-1">Total XP</div>
                </CardContent>
            </Card>

            {/* Card 4: Current League */}
            <Card className="bg-surface/80 border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_5px_20px_rgba(0,255,65,0.15)] group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="p-5 flex flex-col items-center text-center">
                    <div className="text-3xl mb-2">{leagueEmoji}</div>
                    <div
                        className="text-2xl font-bold drop-shadow-md"
                        style={{ color: leagueColor }}
                    >
                        {currentLeague}
                    </div>
                    <div className="text-xs text-text-secondary uppercase tracking-wider font-semibold mt-1">Current League</div>
                </CardContent>
            </Card>
        </div>
    );
}
