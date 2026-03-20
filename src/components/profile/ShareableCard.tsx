'use client';

import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Copy, Download, Share2, Trophy, Swords, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { User, SkillScore } from '@/types';

interface ShareableCardProps {
    user: User;
    skillScores: SkillScore[];
    winRate: number;
}

const LEAGUE_COLORS: Record<string, string> = {
    Bronze: '#CD7F32',
    Silver: '#C0C0C0',
    Gold: '#FFD700',
    Platinum: '#00CED1',
    Diamond: '#00FF41',
};

export function ShareableCard({ user, skillScores, winRate }: ShareableCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const profileUrl = typeof window !== 'undefined' ? `${window.location.origin}/profile/${user.username}` : `https://nexalearn.app/profile/${user.username}`;

    const topSkills = [...skillScores].sort((a, b) => b.score - a.score).slice(0, 3);
    const leagueColor = LEAGUE_COLORS[user.league || 'Bronze'] || '#00FF41';

    const downloadCard = async () => {
        if (!cardRef.current) return;
        setIsGenerating(true);

        try {
            const dataUrl = await toPng(cardRef.current, {
                quality: 1.0,
                pixelRatio: 2,
                backgroundColor: '#0a0a0a',
                skipFonts: true,
            });

            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `${user.username}-nexalearn-profile.png`;
            link.click();
            toast.success('Profile card downloaded!');
        } catch (err) {
            console.error('Error generating card:', err);
            toast.error('Failed to generate card');
        } finally {
            setIsGenerating(false);
        }
    };

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(profileUrl);
            toast.success('Link copied to clipboard!');
        } catch (err) {
            toast.error('Failed to copy link');
        }
    };

    const nativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${user.username}'s NexaLearn Profile`,
                    text: `Check out my NexaLearn profile! I'm in ${user.league} league.`,
                    url: profileUrl,
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            copyLink();
        }
    };

    return (
        <div className="space-y-6">
            {/* The invisible or visually hidden card we use for html2canvas */}
            <div className="overflow-hidden rounded-2xl border border-border select-none relative">
                <div
                    ref={cardRef}
                    className="bg-[#0a0a0a] w-full max-w-[400px] mx-auto p-8 relative overflow-hidden flex flex-col items-center justify-center text-center aspect-[3/4]"
                    style={{
                        backgroundImage: `radial-gradient(circle at center, ${leagueColor}15 0%, transparent 70%)`
                    }}
                >
                    {/* Logo */}
                    <div className="absolute top-6 left-6 flex items-center text-primary font-black tracking-widest text-lg opacity-80 gap-2">
                        <div className="w-6 h-6 bg-primary/20 rounded border border-primary/50 flex items-center justify-center text-xs">
                            N
                        </div>
                        NEXALEARN
                    </div>

                    <div className="mt-8 mb-6 relative">
                        <div
                            className="w-24 h-24 rounded-full border-4 flex items-center justify-center text-4xl bg-surface2 z-10 relative"
                            style={{ borderColor: leagueColor, boxShadow: `0 0 30px ${leagueColor}50` }}
                        >
                            {user.avatar_url || '👨‍💻'}
                        </div>
                        {/* Glowing ring behind avatar */}
                        <div
                            className="absolute inset-0 rounded-full blur-xl opacity-50 animate-pulse"
                            style={{ backgroundColor: leagueColor }}
                        />
                    </div>

                    <h2 className="text-3xl font-black text-text mb-1 tracking-wide">{user.username}</h2>

                    <div
                        className="px-4 py-1.5 rounded-full border bg-surface uppercase text-xs font-bold tracking-widest mb-8"
                        style={{ borderColor: `${leagueColor}50`, color: leagueColor }}
                    >
                        {user.league} League
                    </div>

                    <div className="w-full grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-surface/50 border border-border p-3 rounded-xl flex flex-col items-center">
                            <Swords className="w-5 h-5 text-text-secondary mb-1" />
                            <span className="text-xl font-bold">{user.battles_played}</span>
                            <span className="text-[10px] text-text-secondary uppercase">Battles</span>
                        </div>
                        <div className="bg-surface/50 border border-border p-3 rounded-xl flex flex-col items-center">
                            <Trophy className="w-5 h-5 text-yellow-500 mb-1" />
                            <span className="text-xl font-bold">{winRate}%</span>
                            <span className="text-[10px] text-text-secondary uppercase">Win Rate</span>
                        </div>
                    </div>

                    {topSkills.length > 0 && (
                        <div className="w-full space-y-3 mb-6">
                            <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest text-left">Top Skills</p>
                            {topSkills.map(skill => (
                                <div key={skill.id} className="flex items-center justify-between bg-surface/30 p-2 rounded-lg border border-border/50">
                                    <div className="flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-primary" />
                                        <span className="font-semibold text-sm">{skill.topic}</span>
                                    </div>
                                    <span className="font-black text-primary">{skill.score}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-auto pt-6 border-t border-border/30 w-full">
                        <p className="text-xs text-text-secondary font-mono bg-surface2/50 py-2 rounded-lg break-all px-2">
                            nexalearn.app/profile/{user.username}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
                <button
                    onClick={copyLink}
                    className="flex items-center gap-2 px-4 py-2 bg-surface2 hover:bg-surface border border-border rounded-xl font-semibold transition-colors"
                >
                    <Copy className="w-4 h-4" />
                    Copy Link
                </button>
                <button
                    onClick={downloadCard}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-black rounded-xl font-semibold transition-all disabled:opacity-50"
                >
                    <Download className="w-4 h-4" />
                    {isGenerating ? 'Saving...' : 'Download Card'}
                </button>
                {typeof navigator !== 'undefined' && 'share' in navigator && (
                    <button
                        onClick={nativeShare}
                        className="flex items-center gap-2 px-4 py-2 bg-surface2 hover:bg-surface border border-border rounded-xl font-semibold transition-colors"
                    >
                        <Share2 className="w-4 h-4" />
                        Share
                    </button>
                )}
            </div>
        </div>
    );
}
