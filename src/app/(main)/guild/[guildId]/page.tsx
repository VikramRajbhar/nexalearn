'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { useGuild } from '@/hooks/useGuild';
import { Shield, Zap, AlertTriangle, Loader2 } from 'lucide-react';
import { GuildChat } from '@/components/guild/GuildChat';
import { MemberList } from '@/components/guild/MemberList';
import { WeeklyXPChart } from '@/components/guild/WeeklyXPChart';
import { GuildInvite } from '@/components/guild/GuildInvite';

export default function GuildDashboardPage({ params }: { params: any }) {
    const user = useUserStore(s => s.user);
    const router = useRouter();
    const [guildId, setGuildId] = useState<string | null>(null);

    useEffect(() => {
        Promise.resolve(params).then(p => setGuildId(p.guildId));
    }, [params]);

    const { data, isLoading, error, refresh } = useGuild(guildId);

    if (isLoading || !guildId || !user) {
        return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-12 h-12 animate-spin text-accent-primary" /></div>;
    }

    if (error || !data || !data.guild) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <AlertTriangle className="w-16 h-16 text-red-500" />
                <h2 className="text-2xl font-bold text-white">Sector Offline</h2>
                <p className="text-text-secondary">{error || 'Guild data could not be retrieved.'}</p>
                <button onClick={() => router.push('/guild')} className="px-6 py-2 bg-accent-primary text-black font-bold rounded hover:bg-accent-primary-hover">Return to Hub</button>
            </div>
        );
    }

    const { guild, members, weeklyXPChart, guildRank, weakestSharedTopic, isLeader } = data;

    const handleLeave = async () => {
        if (!confirm('Are you sure you want to defect? You will lose access to all guild comms and progress.')) return;
        await fetch(`/api/guild/${guildId}/leave`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id })
        });
        router.push('/guild');
    };

    const handleDisband = async () => {
        if (!confirm('CRITICAL WARNING: Are you entirely sure you want to dismantle this guild? All members will be expelled and history erased.')) return;
        await fetch(`/api/guild/${guildId}/leave`, { // Backend auto-deletes if leader + 0 members or transfers. If we want hard disband, we could add an explicit disband API, but leave transfers roles appropriately.
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id })
        });
        router.push('/guild');
    };

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8">
            {/* Top Banner */}
            <div className="bg-bg-surface/80 border border-accent-primary/20 rounded-2xl p-6 relative overflow-hidden backdrop-blur-xl shadow-[0_0_30px_rgba(108,99,255,0.05)]">
                <div className="absolute -top-24 -right-24 opacity-10">
                    <Shield className="w-96 h-96 text-accent-primary mix-blend-overlay" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Shield className="w-7 h-7 text-accent-primary drop-shadow-[0_0_10px_rgba(108,99,255,0.8)]" />
                            <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-widest drop-shadow-lg">{guild.name}</h1>
                        </div>
                        <p className="text-text-secondary text-base max-w-xl">{guild.description || 'A synchronized network of hackers hunting for glory.'}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="bg-bg-surface-2/50 border border-border-default px-4 py-2 rounded-lg flex flex-col">
                            <span className="text-xs text-text-secondary font-bold uppercase tracking-wider">Capacity</span>
                            <span className="text-xl font-black text-white">{guild.member_count}/10</span>
                        </div>
                        <div className="bg-yellow-500/10 border border-yellow-500/30 px-4 py-2 rounded-lg flex flex-col shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                            <span className="text-xs text-yellow-500 font-bold uppercase tracking-wider">Weekly Yield</span>
                            <span className="text-xl font-black text-yellow-400 flex items-center gap-1"><Zap className="w-4 h-4" /> {guild.weekly_xp.toLocaleString()} XP</span>
                        </div>
                        <div className="bg-accent-primary/10 border border-accent-primary/30 px-4 py-2 rounded-lg flex flex-col shadow-[0_0_15px_rgba(108,99,255,0.15)]">
                            <span className="text-xs text-accent-primary font-bold uppercase tracking-wider">Global Matrix Rank</span>
                            <span className="text-xl font-black text-accent-primary">#{guildRank}</span>
                        </div>
                    </div>
                </div>
            </div>

            {weakestSharedTopic && (
                <div className="bg-amber-500/10 border border-amber-500/50 p-4 rounded-xl flex items-center gap-4 animate-pulse">
                    <AlertTriangle className="w-6 h-6 text-amber-500" />
                    <div>
                        <h4 className="text-amber-500 font-bold">Tactical Recommendation</h4>
                        <p className="text-sm text-amber-500/80">Your squad is weakest in <strong>{weakestSharedTopic}</strong>. Focus group study efforts here to maximize yield.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column - Stats & Roster */}
                <div className="lg:col-span-7 space-y-8">
                    <WeeklyXPChart data={weeklyXPChart} totalWeeklyXP={guild.weekly_xp} />
                    <MemberList members={members} currentUserId={user.id} isLeader={isLeader} guildId={guild.id} onMemberKicked={refresh} />
                </div>

                {/* Right Column - Comms & Recruitment */}
                <div className="lg:col-span-5 space-y-8">
                    <GuildInvite inviteToken={guild.invite_token} guildId={guild.id} isLeader={isLeader} onRegenerate={refresh} />
                    <GuildChat guildId={guild.id} />

                    <div className="pt-8 flex flex-col sm:flex-row justify-end gap-4">
                        {isLeader && (
                            <button onClick={handleDisband} className="px-6 py-2 bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20 font-bold rounded-lg transition-colors">
                                Disband Guild
                            </button>
                        )}
                        <button onClick={handleLeave} className="px-6 py-2 bg-bg-surface-2 border border-border-default text-white hover:bg-bg-surface font-bold rounded-lg transition-colors">
                            Leave Guild
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
