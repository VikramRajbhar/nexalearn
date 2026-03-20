'use client';
import React, { useState } from 'react';
import { GuildMember } from '@/hooks/useGuild';
import { Crown, Zap, UserMinus, ShieldCheck, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MemberListProps {
    members: GuildMember[];
    currentUserId: string;
    isLeader: boolean;
    guildId: string;
    onMemberKicked: () => void;
}

const leagueRing: Record<string, string> = {
    Diamond: 'ring-cyan-400 shadow-[0_0_12px_rgba(0,255,255,0.3)]',
    Platinum: 'ring-sky-300 shadow-[0_0_10px_rgba(135,206,250,0.2)]',
    Gold: 'ring-yellow-400 shadow-[0_0_10px_rgba(255,215,0,0.25)]',
    Silver: 'ring-gray-400',
    Bronze: 'ring-amber-700',
};

export function MemberList({ members, currentUserId, isLeader, guildId, onMemberKicked }: MemberListProps) {
    const [kickingId, setKickingId] = useState<string | null>(null);
    const totalXP = members.reduce((s, m) => s + m.weekly_xp, 0);

    const handleKick = async (id: string) => {
        if (!confirm('Remove this operative from the squad?')) return;
        setKickingId(id);
        try {
            await fetch(`/api/guild/${guildId}/kick`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leaderId: currentUserId, targetUserId: id })
            });
            onMemberKicked();
        } finally {
            setKickingId(null);
        }
    };

    return (
        <div className="bg-bg-surface/60 border border-border-default rounded-2xl p-6 backdrop-blur-md">
            <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-accent-primary drop-shadow-[0_0_8px_rgba(108,99,255,0.6)]" />
                    Squad Roster
                </h3>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="px-3 py-1 bg-bg-surface-2/60 rounded-full text-xs font-bold text-text-secondary border border-border-default/50">
                        {members.length}/10
                    </span>
                </div>
            </div>

            <div className="space-y-2">
                {members.map((member, idx) => {
                    const isMe = member.user_id === currentUserId;
                    const league = member.users?.league || 'Bronze';
                    const ringClass = leagueRing[league] || leagueRing.Bronze;
                    const xpPercent = totalXP > 0 ? Math.round((member.weekly_xp / totalXP) * 100) : 0;

                    return (
                        <div
                            key={member.id}
                            className={cn(
                                "flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 group",
                                isMe
                                    ? "bg-accent-primary/5 border-accent-primary/20 shadow-[0_0_15px_rgba(108,99,255,0.04)]"
                                    : "bg-bg-surface/80 border-border-default/50 hover:bg-bg-surface-2/60 hover:border-border-default"
                            )}
                        >
                            {/* Rank Number */}
                            <div className="w-6 text-center flex-shrink-0">
                                <span className={cn(
                                    "font-mono font-black text-sm",
                                    idx === 0 ? "text-yellow-400" : idx === 1 ? "text-gray-400" : idx === 2 ? "text-amber-600" : "text-text-secondary/50"
                                )}>
                                    <Hash className="w-3 h-3 inline -mt-0.5" />{idx + 1}
                                </span>
                            </div>

                            {/* Avatar with League Ring */}
                            <div className="relative flex-shrink-0">
                                <div className={cn("w-10 h-10 rounded-full ring-2 flex items-center justify-center overflow-hidden bg-bg-surface-2", ringClass)}>
                                    {member.users?.avatar_url ? (
                                        member.users.avatar_url.startsWith('http') ? (
                                            <img src={member.users.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
                                        ) : (
                                            <span className="text-xl leading-none">{member.users.avatar_url}</span>
                                        )
                                    ) : (
                                        <span className="font-black text-sm text-text-secondary">{member.users?.username?.substring(0, 2).toUpperCase()}</span>
                                    )}
                                </div>
                                {member.role === 'leader' && (
                                    <div className="absolute -top-1.5 -right-1.5 bg-yellow-500 rounded-full p-0.5 shadow-[0_0_6px_rgba(234,179,8,0.6)]">
                                        <Crown className="w-3 h-3 text-black" />
                                    </div>
                                )}
                                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-bg-surface" />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-white text-sm truncate">{member.users?.username}</span>
                                    {isMe && <span className="text-[10px] text-accent-primary bg-accent-primary/15 px-1.5 py-0.5 rounded font-black uppercase">You</span>}
                                    {member.role === 'leader' && (
                                        <span className="text-[10px] text-yellow-400 bg-yellow-500/10 px-1.5 py-0.5 rounded font-black uppercase border border-yellow-500/20">Leader</span>
                                    )}
                                </div>
                                {/* XP Contribution Bar */}
                                <div className="mt-1.5 flex items-center gap-2">
                                    <div className="flex-1 h-1.5 bg-bg-surface-2 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-accent-primary/80 to-accent-primary rounded-full transition-all duration-700"
                                            style={{ width: `${Math.max(xpPercent, 2)}%` }}
                                        />
                                    </div>
                                    <span className="text-[10px] font-mono font-bold text-text-secondary w-8 text-right">{xpPercent}%</span>
                                </div>
                            </div>

                            {/* XP + Actions */}
                            <div className="flex items-center gap-3 flex-shrink-0">
                                <div className="text-right">
                                    <div className="flex items-center text-accent-primary font-mono font-black text-sm gap-1">
                                        <Zap className="w-3.5 h-3.5" /> {member.weekly_xp.toLocaleString()}
                                    </div>
                                    <div className="text-[9px] text-text-secondary uppercase tracking-wider font-bold">XP</div>
                                </div>
                                {isLeader && !isMe && (
                                    <button
                                        onClick={() => handleKick(member.user_id)}
                                        disabled={kickingId === member.user_id}
                                        className="p-1.5 text-red-400/60 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        title="Remove Operative"
                                    >
                                        <UserMinus className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
