'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Swords } from 'lucide-react';
import type { BattleHistory } from '@/types';

interface RecentBattlesProps {
    battles: BattleHistory[];
}

export function RecentBattles({ battles }: RecentBattlesProps) {
    const router = useRouter();

    if (battles.length === 0) {
        return (
            <Card className="bg-surface">
                <CardHeader>
                    <CardTitle>Recent Battles</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center p-10 text-center">
                    <Swords className="w-16 h-16 text-border mb-4 opacity-50" />
                    <p className="text-text-secondary mb-6 font-medium">
                        No battles yet. Start your first battle to climb the ranks!
                    </p>
                    <Button onClick={() => router.push('/battle')}>
                        Battle Now
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-surface">
            <CardHeader>
                <CardTitle>Recent Battles</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {battles.map((battle) => {
                        const isWin = battle.result === 'win';
                        const isLoss = battle.result === 'loss';
                        const badgeColor = isWin
                            ? 'border-green-500/30 bg-green-500/10 text-green-500'
                            : isLoss
                                ? 'border-red-500/30 bg-red-500/10 text-red-400'
                                : 'border-border bg-surface2 text-text-secondary';

                        return (
                            <div
                                key={battle.id}
                                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border ${badgeColor} transition-all`}
                            >
                                <div className="flex items-center gap-4 w-full sm:w-auto mb-3 sm:mb-0">
                                    <div className={`w-12 h-12 flex items-center justify-center rounded-lg font-bold text-xl uppercase ${isWin ? 'bg-green-500/20' : isLoss ? 'bg-red-500/20' : 'bg-background'}`}>
                                        {battle.result === 'draw' ? 'D' : battle.result[0]}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-text bg-background px-2 py-0.5 rounded text-xs border border-border">
                                                {battle.topic}
                                            </span>
                                            <span className="text-xs text-text-secondary">
                                                {formatDistanceToNow(new Date(battle.played_at), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <div className="text-sm font-mono opacity-80">
                                            Score: {battle.user_score} - {battle.opponent_score}
                                        </div>
                                    </div>
                                </div>

                                <div className="font-bold text-[#FFD700] ml-16 sm:ml-0 flex items-center gap-1">
                                    <span>+{battle.xp_earned} XP</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
