'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useDashboard } from '@/hooks/useDashboard';
import { SkillRadarChart } from '@/components/dashboard/SkillRadarChart';
import { LeagueProgress } from '@/components/dashboard/LeagueProgress';
import { WeakNodes } from '@/components/dashboard/WeakNodes';
import { RecentBattles } from '@/components/dashboard/RecentBattles';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { DailyChallenge } from '@/components/dashboard/DailyChallenge';
import { Shield, ShieldAlert, RefreshCcw, Swords } from 'lucide-react';

export default function DashboardPage() {
    const router = useRouter();
    const { data, isLoading, error, refetch } = useDashboard();

    if (isLoading) {
        return (
            <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
                <div className="h-24 bg-bg-surface-2 animate-pulse rounded-xl"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-32 bg-bg-surface-2 animate-pulse rounded-xl"></div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-7 space-y-6">
                        <div className="h-[400px] bg-bg-surface-2 animate-pulse rounded-xl"></div>
                        <div className="h-64 bg-bg-surface-2 animate-pulse rounded-xl"></div>
                    </div>
                    <div className="lg:col-span-5 space-y-6">
                        <div className="h-40 bg-bg-surface-2 animate-pulse rounded-xl"></div>
                        <div className="h-64 bg-bg-surface-2 animate-pulse rounded-xl"></div>
                        <div className="h-40 bg-bg-surface-2 animate-pulse rounded-xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
                <div className="text-red-500 text-xl">Failed to load dashboard</div>
                <p className="text-text-secondary">{error}</p>
                <Button onClick={refetch} variant="secondary" className="flex items-center gap-2">
                    <RefreshCcw className="w-4 h-4" /> Retry
                </Button>
            </div>
        );
    }

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

    return (
        <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Top Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-bg-surface p-6 rounded-2xl border border-border-default shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
                <div>
                    <p className="text-text-secondary font-medium mb-1">{greeting}</p>
                    <h1 className="text-2xl md:text-3xl font-bold">
                        Welcome back, <span className="text-accent-primary">{data.user?.username}</span>! 👋
                    </h1>
                    <p className="text-text-secondary mt-1">
                        Ready to battle today?
                    </p>
                </div>
                <Button
                    size="lg"
                    onClick={() => router.push('/battle')}
                    className="w-full md:w-auto text-lg py-6 font-black bg-accent-primary text-black hover:bg-accent-primary-hover border-accent-primary relative overflow-hidden group shadow-[0_0_20px_rgba(108,99,255,0.4)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(108,99,255,0.6)] hover:-translate-y-1"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                    <span className="relative z-10 flex items-center justify-center uppercase tracking-wider">
                        ENTER THE ARENA <Swords className="ml-3 w-6 h-6 animate-glow-pulse drop-shadow-md" />
                    </span>
                </Button>
            </div>

            {/* Stats Row */}
            <StatsCards
                totalBattles={data.totalBattles}
                winRate={data.winRate}
                totalXP={data.user?.total_xp || 0}
                currentLeague={data.currentLeague}
            />

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Column (60%) */}
                <div className="lg:col-span-7 space-y-6">
                    <SkillRadarChart skillScores={data.skillScores} />
                    <RecentBattles battles={data.recentBattles} />
                </div>

                {/* Right Column (40%) */}
                <div className="lg:col-span-5 space-y-6">
                    <LeagueProgress
                        currentXP={data.user?.total_xp || 0}
                        currentLeague={data.currentLeague}
                        xpToNext={data.xpToNextLeague}
                        progress={data.xpProgress}
                    />

                    <WeakNodes
                        weakNodes={data.weakNodes}
                        totalBattles={data.totalBattles}
                    />

                    <DailyChallenge />

                    {/* Guild Section */}
                    {data.guildInfo ? (
                        <Card className="bg-bg-surface relative overflow-hidden group border-accent-primary/20">
                            <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 to-transparent pointer-events-none" />
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-widest text-white">
                                    <Shield className="w-6 h-6 text-accent-primary" />
                                    {data.guildInfo.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-bg-surface-2/50 border border-border-default rounded-lg p-3 text-center">
                                        <div className="text-xs text-text-secondary uppercase font-bold tracking-wider mb-1">Members</div>
                                        <div className="text-xl font-black text-white">{data.guildInfo.member_count}/10</div>
                                    </div>
                                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-center">
                                        <div className="text-xs text-yellow-500 uppercase font-bold tracking-wider mb-1">Weekly XP</div>
                                        <div className="text-xl font-black text-yellow-400">⚡ {data.guildInfo.weekly_xp}</div>
                                    </div>
                                </div>
                                <Button variant="primary" className="w-full font-black uppercase tracking-widest" onClick={() => router.push(`/guild/${data.guildInfo?.id}`)}>
                                    Enter Guild Hub
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="bg-bg-surface border-border-default">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-widest text-white">
                                    <ShieldAlert className="w-6 h-6 text-text-secondary" />
                                    Join a Guild
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-text-secondary text-sm mb-6 leading-relaxed">
                                    Team up with other warriors to earn bonus XP, climb the guild leaderboards, and unlock exclusive rewards.
                                </p>
                                <Button variant="secondary" className="w-full font-bold uppercase tracking-widest" onClick={() => router.push('/guild')}>
                                    Explore Guilds
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
