'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Target, Trophy, Swords } from 'lucide-react';
import type { SkillScore } from '@/types';

interface WeakNodesProps {
    weakNodes: SkillScore[];
    totalBattles: number;
}

export function WeakNodes({ weakNodes, totalBattles }: WeakNodesProps) {
    const router = useRouter();

    const handlePractice = (topic: string) => {
        localStorage.setItem('battleTopic', topic);
        router.push('/battle');
    };

    if (totalBattles === 0) {
        return (
            <Card className="bg-surface h-full flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        Focus Areas
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col items-center justify-center text-center p-6">
                    <Swords className="w-12 h-12 text-border mb-4" />
                    <p className="text-text-secondary mb-4">
                        Play your first battle to discover your weak spots.
                    </p>
                    <Button onClick={() => router.push('/battle')} variant="secondary" size="sm">
                        Start Playing
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (weakNodes.length === 0) {
        return (
            <Card className="bg-surface h-full flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        Focus Areas
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col items-center justify-center text-center p-6">
                    <Trophy className="w-12 h-12 text-[#FFD700] mb-4" />
                    <p className="text-text font-bold mb-1">You're crushing it!</p>
                    <p className="text-text-secondary text-sm">
                        All topics are above 50 capacity.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-surface">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Focus Areas
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {weakNodes.map((node) => (
                    <div key={node.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface2">
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-sm text-text">{node.topic}</span>
                                <span className="text-xs text-orange-500 font-mono">{node.score.toFixed(0)}/100</span>
                            </div>
                            <div className="w-full bg-background h-1.5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-orange-500 transition-all"
                                    style={{ width: `${Math.max(5, node.score)}%` }}
                                />
                            </div>
                        </div>
                        <Button
                            size="sm"
                            variant="secondary"
                            className="ml-4 text-xs h-8 px-3"
                            onClick={() => handlePractice(node.topic)}
                        >
                            Practice
                        </Button>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
