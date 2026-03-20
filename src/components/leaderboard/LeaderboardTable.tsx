'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Shield, Sparkles } from 'lucide-react';
import Link from 'next/link';

export interface LeaderboardEntry {
    rank: number;
    userId: string;
    username: string;
    college: string;
    league: string;
    score: number;
}

interface LeaderboardTableProps {
    entries: LeaderboardEntry[];
    currentUserId?: string;
    isLoading: boolean;
}

export function LeaderboardTable({ entries, currentUserId, isLoading }: LeaderboardTableProps) {

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="h-16 w-full bg-bg-surface animate-pulse rounded-xl border border-border-default" />
                ))}
            </div>
        );
    }

    if (!entries || entries.length === 0) {
        return (
            <div className="py-20 text-center bg-bg-surface border border-border-default rounded-xl">
                <Shield className="w-12 h-12 text-accent-primary mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold text-white mb-2">No battles yet</h3>
                <p className="text-text-secondary">Be the first on the leaderboard to claim the top spot!</p>
            </div>
        );
    }

    const currentUserEntry = entries.find(e => e.userId === currentUserId);
    const isCurrentUserInTop100 = currentUserEntry && currentUserEntry.rank <= 100;

    const topEntries = entries.slice(0, 100);
    const podiumEntries = entries.slice(0, 3);

    return (
        <div className="space-y-10">

            {/* PODIUM VISUALIZATION */}
            {podiumEntries.length >= 3 && (
                <LeaderboardPodium top3={podiumEntries} />
            )}

            {/* LEADERBOARD TABLE */}
            <div className="relative rounded-xl border border-accent-primary/20 bg-bg-surface/40 overflow-hidden backdrop-blur-xl shadow-[0_0_30px_rgba(108,99,255,0.05)]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="bg-bg-surface text-accent-primary/80 border-b border-accent-primary/20 text-xs font-bold uppercase tracking-widest">
                                <th className="p-4 w-24 text-center">Rank</th>
                                <th className="p-4">Hacker</th>
                                <th className="p-4 hidden md:table-cell">Alliance</th>
                                <th className="p-4 hidden sm:table-cell">Tier</th>
                                <th className="p-4 text-right">Reputation</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topEntries.map((entry, i) => (
                                <LeaderboardRow key={entry.userId} entry={entry} isCurrentUser={entry.userId === currentUserId} delay={i * 0.05} />
                            ))}
                        </tbody>
                    </table>
                </div>

                {currentUserId && currentUserEntry && !isCurrentUserInTop100 && (
                    <div className="bg-bg-surface sticky bottom-0 z-20 border-t-2 border-accent-primary shadow-[0_-20px_40px_rgba(0,0,0,0.8)]">
                        <div className="bg-accent-primary/20 text-accent-primary text-xs font-black tracking-widest uppercase text-center py-1.5 flex items-center justify-center gap-2">
                            <Sparkles className="w-3 h-3" /> Your Signal
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[600px]">
                                <tbody>
                                    <LeaderboardRow entry={currentUserEntry} isCurrentUser={true} delay={0} />
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function LeaderboardPodium({ top3 }: { top3: LeaderboardEntry[] }) {
    const [first, second, third] = [top3[0], top3[1], top3[2]];

    return (
        <div className="flex justify-center items-end gap-2 sm:gap-6 pt-10 pb-4">
            <PodiumStep entry={second} rank={2} height="h-32" fromColor="from-gray-300" toColor="to-gray-600/20" borderColor="border-gray-400" />
            <PodiumStep entry={first} rank={1} height="h-48" fromColor="from-yellow-300" toColor="to-yellow-700/20" borderColor="border-yellow-400" />
            <PodiumStep entry={third} rank={3} height="h-24" fromColor="from-amber-600" toColor="to-amber-900/20" borderColor="border-amber-700" />
        </div>
    );
}

function PodiumStep({ entry, rank, height, fromColor, toColor, borderColor }: { entry: LeaderboardEntry, rank: number, height: string, fromColor: string, toColor: string, borderColor: string }) {
    return (
        <div className="flex flex-col items-center animate-in slide-in-from-bottom-8 duration-700 w-28 sm:w-36 group">
            <div className="relative mb-3 flex flex-col items-center z-20">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 ${borderColor} bg-bg-surface flex items-center justify-center text-3xl shadow-[0_0_30px_inherit] overflow-hidden transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-2`}>
                    {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
                </div>
                <div className="absolute -bottom-4 bg-bg-surface border border-border-default px-3 py-1 rounded-full text-xs font-bold tracking-wider text-white shadow-lg whitespace-nowrap hover:text-accent-primary transition-colors cursor-pointer">
                    <Link href={`/profile/${entry.username}`}>
                        {entry.username.length > 10 ? entry.username.substring(0, 8) + '...' : entry.username}
                    </Link>
                </div>
            </div>

            {/* 3D Glassmorphism Block */}
            <div className={cn(
                "w-full rounded-t-xl bg-gradient-to-b flex flex-col items-center justify-start pt-6 border-t-2 border-l border-r backdrop-blur-sm relative overflow-hidden",
                height, fromColor, toColor, borderColor,
                "shadow-[inset_0_4px_20px_rgba(255,255,255,0.2)]"
            )}>
                {/* Glow effect behind rank number */}
                <div className="absolute top-4 w-12 h-12 bg-white/20 blur-xl rounded-full" />

                <span className="text-4xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] relative z-10">{rank}</span>
                <span className="text-[10px] font-mono font-bold mt-auto mb-4 text-white/90 bg-black/40 px-2 py-1 rounded relative z-10">
                    {entry.score.toLocaleString()} XP
                </span>
            </div>
        </div>
    );
}

function LeaderboardRow({ entry, isCurrentUser, delay }: { entry: LeaderboardEntry; isCurrentUser: boolean; delay: number }) {
    const isGold = entry.rank === 1;
    const isSilver = entry.rank === 2;
    const isBronze = entry.rank === 3;

    let medal = '';
    if (isGold) medal = '🥇';
    if (isSilver) medal = '🥈';
    if (isBronze) medal = '🥉';

    return (
        <tr
            className={cn(
                "border-b border-border-default/30 transition-all group animate-in fade-in slide-in-from-bottom-4 fill-mode-both",
                isCurrentUser && "bg-accent-primary/10 hover:bg-accent-primary/20 shadow-[inset_0_0_15px_rgba(108,99,255,0.2)]",
                !isCurrentUser && "hover:bg-bg-surface-2/80",
                // Dramatic styling for top 3
                isGold && "bg-gradient-to-r from-yellow-500/10 via-transparent to-transparent border-l-4 border-l-yellow-500",
                isSilver && "bg-gradient-to-r from-gray-400/10 via-transparent to-transparent border-l-4 border-l-gray-400",
                isBronze && "bg-gradient-to-r from-amber-700/10 via-transparent to-transparent border-l-4 border-l-amber-700",
                !isGold && !isSilver && !isBronze && "border-l-4 border-l-transparent"
            )}
            style={{ animationDelay: `${delay > 1 ? 1 : delay}s`, animationDuration: '400ms' }}
        >
            <td className="p-4 text-center">
                <span className={cn(
                    "font-black text-lg font-mono flex items-center justify-center",
                    isGold ? "text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)] text-2xl" :
                        isSilver ? "text-gray-300 drop-shadow-[0_0_8px_rgba(156,163,175,0.8)] text-xl" :
                            isBronze ? "text-amber-500 drop-shadow-[0_0_8px_rgba(180,83,9,0.8)] text-xl" :
                                "text-text-secondary group-hover:text-white transition-colors",
                    isCurrentUser && !isGold && !isSilver && !isBronze && "text-accent-primary drop-shadow-[0_0_8px_rgba(108,99,255,0.8)]"
                )}>
                    {isGold || isSilver || isBronze ? `#${entry.rank}` : entry.rank}
                </span>
            </td>
            <td className="p-4">
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-lg border relative overflow-hidden",
                        isGold ? "bg-yellow-500/20 border-yellow-500/50" :
                            isSilver ? "bg-gray-400/20 border-gray-400/50" :
                                isBronze ? "bg-amber-700/20 border-amber-700/50" :
                                    isCurrentUser ? "bg-accent-primary/20 border-accent-primary/50" : "bg-bg-surface border-border-default"
                    )}>
                        {isGold && <div className="absolute inset-0 bg-yellow-500/20 animate-pulse" />}
                        <span className="relative z-10">{medal || entry.username.substring(0, 2).toUpperCase()}</span>
                    </div>
                    <div>
                        <Link href={`/profile/${entry.username}`} className={cn(
                            "font-black text-lg tracking-wide flex items-center hover:text-accent-primary transition-colors",
                            isCurrentUser ? "text-accent-primary drop-shadow-[0_0_8px_rgba(108,99,255,0.4)]" : "text-white",
                            isGold && "text-yellow-400",
                            isSilver && "text-gray-200"
                        )}>
                            {entry.username}
                            {isCurrentUser && <span className="text-xs ml-3 px-2 py-0.5 bg-accent-primary text-black rounded uppercase font-bold">You</span>}
                        </Link>
                        <div className="text-xs text-text-secondary md:hidden mt-1">{entry.college || 'Unknown Sector'}</div>
                    </div>
                </div>
            </td>
            <td className="p-4 hidden md:table-cell">
                <span className="text-sm font-medium text-text-secondary group-hover:text-white/80 transition-colors">
                    {entry.college || 'Unknown Sector'}
                </span>
            </td>
            <td className="p-4 hidden sm:table-cell">
                <span className={cn(
                    "px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest inline-block",
                    entry.league === 'Diamond' ? "bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30 shadow-[0_0_10px_rgba(0,255,65,0.2)]" :
                        entry.league === 'Platinum' ? "bg-[#00CED1]/10 text-[#00CED1] border border-[#00CED1]/30 shadow-[0_0_10px_rgba(0,206,209,0.2)]" :
                            entry.league === 'Gold' ? "bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/30 shadow-[0_0_10px_rgba(255,215,0,0.2)]" :
                                entry.league === 'Silver' ? "bg-gray-400/10 text-gray-300 border border-gray-400/30" :
                                    "bg-bg-surface-2 text-text-secondary border border-border-default"
                )}>
                    {entry.league || 'Bronze'}
                </span>
            </td>
            <td className="p-4 text-right">
                <div className={cn(
                    "font-mono font-black text-xl tracking-tight",
                    isGold ? "text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" :
                        isCurrentUser ? "text-accent-primary drop-shadow-[0_0_8px_rgba(108,99,255,0.5)]" : "text-[#FFD700]/80 group-hover:text-[#FFD700] transition-colors"
                )}>
                    {entry.score.toLocaleString()}
                </div>
            </td>
        </tr>
    );
}
