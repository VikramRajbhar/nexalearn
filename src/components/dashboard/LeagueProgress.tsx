'use client';

import React, { useEffect, useState } from 'react';
import * as Progress from '@radix-ui/react-progress';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface LeagueProgressProps {
    currentXP: number;
    currentLeague: string;
    xpToNext: number;
    progress: number;
}

const LEAGUE_COLORS: Record<string, string> = {
    Bronze: '#CD7F32',
    Silver: '#C0C0C0',
    Gold: '#FFD700',
    Platinum: '#00CED1',
    Diamond: '#00FF41',
};

const LEAGUE_ORDER = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];

export function LeagueProgress({ currentXP, currentLeague, xpToNext, progress }: LeagueProgressProps) {
    const [animatedProgress, setAnimatedProgress] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => setAnimatedProgress(progress), 300);
        return () => clearTimeout(timer);
    }, [progress]);

    const isMaxRank = currentLeague === 'Diamond';
    const nextLeagueIdx = Math.min(LEAGUE_ORDER.indexOf(currentLeague) + 1, LEAGUE_ORDER.length - 1);
    const nextLeague = LEAGUE_ORDER[nextLeagueIdx];
    const currentTargetXP = currentXP + xpToNext;

    return (
        <Card className="bg-surface">
            <CardHeader>
                <CardTitle className="text-xl font-bold flex justify-between">
                    <span>League Rank</span>
                    {isMaxRank && <span className="text-[#00FF41] animate-pulse uppercase tracking-wider text-sm">Max Rank</span>}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col items-center">
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mb-1 shadow-lg"
                            style={{ backgroundColor: `${LEAGUE_COLORS[currentLeague]}20`, color: LEAGUE_COLORS[currentLeague], border: `1px solid ${LEAGUE_COLORS[currentLeague]}80` }}
                        >
                            {currentLeague.charAt(0)}
                        </div>
                        <span className="text-xs text-text-secondary font-medium">{currentLeague}</span>
                    </div>

                    {!isMaxRank && (
                        <div className="flex-1 mx-6 flex flex-col items-center">
                            <span className="text-xs text-text-secondary mb-2">
                                {currentXP.toLocaleString()} / {currentTargetXP.toLocaleString()} XP
                            </span>
                            <Progress.Root
                                className="relative overflow-hidden bg-background rounded-full w-full h-4 border border-border"
                                value={animatedProgress}
                            >
                                <Progress.Indicator
                                    className="w-full h-full bg-primary transition-transform duration-1000 ease-out"
                                    style={{ transform: `translateX(-${100 - animatedProgress}%)` }}
                                />
                            </Progress.Root>
                            <span className="text-[10px] font-bold text-primary mt-1">{animatedProgress}% to {nextLeague}</span>
                        </div>
                    )}

                    {!isMaxRank && (
                        <div className="flex flex-col items-center opacity-50 hover:opacity-100 transition-opacity">
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mb-1"
                                style={{ backgroundColor: `${LEAGUE_COLORS[nextLeague]}10`, color: LEAGUE_COLORS[nextLeague], border: `1px dashed ${LEAGUE_COLORS[nextLeague]}50` }}
                            >
                                {nextLeague.charAt(0)}
                            </div>
                            <span className="text-xs text-text-secondary">{nextLeague}</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
