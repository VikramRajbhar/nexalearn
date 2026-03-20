'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { ShareableCard } from '@/components/profile/ShareableCard';
import { SkillRadarChart } from '@/components/dashboard/SkillRadarChart';
import { RecentBattles } from '@/components/dashboard/RecentBattles';
import { Swords, Share2, Copy, X } from 'lucide-react';
import { toast } from 'sonner';

const LEAGUE_COLORS: Record<string, string> = {
    Bronze: '#CD7F32',
    Silver: '#C0C0C0',
    Gold: '#FFD700',
    Platinum: '#00CED1',
    Diamond: '#00FF41',
};

const rarityColors = {
    common: 'border-slate-500',
    uncommon: 'border-green-500',
    rare: 'border-blue-500',
    legendary: 'border-yellow-500 shadow-[0_0_15px_rgba(255,215,0,0.3)]',
};

const rarityText = {
    common: 'text-slate-400',
    uncommon: 'text-green-400',
    rare: 'text-blue-400',
    legendary: 'text-yellow-400',
};

export default function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
    const router = useRouter();
    const { user: loggedInUser } = useUserStore();
    const resolvedParams = React.use(params);
    const username = decodeURIComponent(resolvedParams.username);

    const [profileData, setProfileData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isShareCardVisible, setIsShareCardVisible] = useState(false);
    const [activeTab, setActiveTab] = useState<'earned' | 'locked'>('earned');

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await fetch(`/api/profile/public/${username}`);
                const data = await res.json();

                if (!res.ok) throw new Error(data.error || 'Failed to load profile');

                if (data.achievements?.earned) {
                    data.achievements.earned.sort((a: any, b: any) => new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime());
                }

                setProfileData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        }
        fetchProfile();
    }, [username]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background p-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="h-64 bg-bg-surface-2 animate-pulse rounded-3xl"></div>
                    <div className="h-[400px] bg-bg-surface-2 animate-pulse rounded-3xl"></div>
                </div>
            </div>
        );
    }

    if (error || !profileData) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-4xl font-black mb-4">Player Not Found</h1>
                <p className="text-text-secondary mb-8">{error || 'This profile does not exist or is private.'}</p>
                <button onClick={() => router.push('/')} className="px-6 py-3 bg-accent-primary text-black font-bold rounded-xl hover:bg-accent-primary-hover transition-all">
                    Return Home
                </button>
            </div>
        );
    }

    const { user, skillScores, recentBattles, achievements, winRate } = profileData;
    const leagueColor = LEAGUE_COLORS[user.league || 'Bronze'] || '#00FF41';

    const currentWinStreak = recentBattles.length > 0 ? (
        recentBattles[0].result === 'win' ? buildStreak(recentBattles) : 0
    ) : 0;

    function buildStreak(history: any[]) {
        let streak = 0;
        for (const battle of history) {
            if (battle.result === 'win') streak++;
            else break;
        }
        return streak;
    }

    const profileUrl = typeof window !== 'undefined' ? window.location.href : `https://nexalearn.app/profile/${user.username}`;
    const isSelf = loggedInUser?.username === user.username;

    return (
        <div className="min-h-screen bg-background">
            <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 pt-10">

                {/* Header Section */}
                <div className="relative bg-bg-surface border border-border-default rounded-3xl overflow-hidden shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-b from-accent-primary/10 to-transparent pointer-events-none" />

                    <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row items-center text-center md:text-left gap-6 md:gap-10">
                        <div className="relative">
                            <div
                                className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 flex items-center justify-center text-4xl md:text-5xl bg-bg-surface-2 z-10 relative"
                                style={{ borderColor: leagueColor, boxShadow: `0 0 20px ${leagueColor}40` }}
                            >
                                {user.avatar_url || '👨‍💻'}
                            </div>
                            {user.league === 'Diamond' && (
                                <div className="absolute inset-0 rounded-full blur-xl bg-accent-primary/40 animate-pulse" />
                            )}
                        </div>

                        <div className="flex-1 w-full">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                                    <h1 className="text-3xl md:text-4xl font-black tracking-wide text-text">
                                        {user.username}
                                    </h1>
                                    <div
                                        className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border w-fit mx-auto md:mx-0 flex items-center"
                                        style={{ borderColor: `${leagueColor}50`, color: leagueColor, backgroundColor: `${leagueColor}10` }}
                                    >
                                        {user.league}
                                    </div>
                                </div>

                                {!isSelf && (
                                    <button
                                        onClick={() => {
                                            if (!loggedInUser) router.push('/signup');
                                            else router.push('/battle'); // Or handle direct challenge
                                        }}
                                        className="w-full md:w-auto px-6 py-3 bg-accent-primary text-black font-black uppercase tracking-wider rounded-xl hover:bg-accent-primary-hover hover:scale-105 transition-all shadow-[0_0_20px_rgba(108,99,255,0.3)] flex items-center justify-center gap-2"
                                    >
                                        <Swords className="w-5 h-5" /> Challenge
                                    </button>
                                )}
                            </div>

                            <p className="text-text-secondary font-medium mb-6">
                                {user.college} <span className="opacity-50 mx-2">|</span> Semester {user.semester}
                            </p>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 flex-row">
                                <button
                                    onClick={() => setIsShareCardVisible(true)}
                                    className="flex items-center justify-center gap-2 flex-1 md:flex-none px-4 py-2 bg-accent-primary/10 hover:bg-accent-primary/20 text-accent-primary border border-accent-primary/30 rounded-xl font-bold text-sm transition-all"
                                >
                                    <Share2 className="w-4 h-4" /> Share Card
                                </button>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(profileUrl);
                                        toast.success('Profile URL copied!');
                                    }}
                                    className="flex items-center justify-center gap-2 flex-1 md:flex-none px-4 py-2 bg-bg-surface-2 hover:bg-bg-surface border border-border-default text-text rounded-xl font-bold text-sm transition-all"
                                >
                                    <Copy className="w-4 h-4" /> Copy Link
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-bg-surface border border-border-default rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center text-center">
                        <div className="text-2xl mb-2">⚔️</div>
                        <div className="text-2xl font-black text-text mb-1">{user.battles_played || 0}</div>
                        <div className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">Total Battles</div>
                    </div>
                    <div className="bg-bg-surface border border-border-default rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center text-center">
                        <div className="text-2xl mb-2">🏆</div>
                        <div className="text-2xl font-black text-yellow-500 mb-1">{winRate}%</div>
                        <div className="text-[10px] text-yellow-500/70 uppercase tracking-widest font-bold">Win Rate</div>
                    </div>
                    <div className="bg-bg-surface border border-border-default rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center text-center">
                        <div className="text-2xl mb-2">⚡</div>
                        <div className="text-2xl font-black text-accent-primary mb-1">{user.total_xp?.toLocaleString() || 0}</div>
                        <div className="text-[10px] text-accent-primary/70 uppercase tracking-widest font-bold">Total XP</div>
                    </div>
                    <div className="bg-bg-surface border border-border-default rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center text-center">
                        <div className="text-2xl mb-2">🔥</div>
                        <div className="text-2xl font-black text-orange-500 mb-1">{currentWinStreak}</div>
                        <div className="text-[10px] text-orange-500/70 uppercase tracking-widest font-bold">Win Streak</div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    <div className="space-y-8">
                        {/* Skill Map */}
                        <div className="bg-bg-surface border border-border-default rounded-3xl p-6">
                            <h3 className="text-xl font-black mb-6">Skill Map</h3>
                            <SkillRadarChart skillScores={skillScores} />

                            <div className="mt-6 space-y-3">
                                {[...skillScores].sort((a, b) => b.score - a.score).slice(0, 5).map((skill) => (
                                    <div key={skill.id} className="flex items-center gap-4">
                                        <div className="w-24 text-sm font-bold truncate">{skill.topic}</div>
                                        <div className="flex-1 h-2 bg-bg-surface-2 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${skill.score >= 70 ? 'bg-accent-primary' : skill.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                                    }`}
                                                style={{ width: `${skill.score}%` }}
                                            />
                                        </div>
                                        <div className="w-8 text-right text-xs font-black">{skill.score}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Achievements */}
                        <div className="bg-bg-surface border border-border-default rounded-3xl p-6 flex flex-col h-[500px]">
                            <div className="flex items-center justify-between mb-4 shrink-0">
                                <h3 className="text-lg font-black">Achievements</h3>
                            </div>

                            <div className="flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
                                {achievements.earned.length === 0 ? (
                                    <div className="text-center text-text-secondary py-8 bg-bg-surface-2 rounded-xl border border-border-default">
                                        <p>No achievements earned yet.</p>
                                    </div>
                                ) : (
                                    achievements.earned.map((ach: any) => (
                                        <div key={ach.id} className={`flex gap-4 p-3 rounded-xl border bg-bg-surface-2/50 ${rarityColors[ach.rarity as keyof typeof rarityColors]}`}>
                                            <div className="text-3xl shrink-0 flex items-center justify-center w-10">{ach.icon}</div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-0.5">
                                                    <h4 className="font-bold text-sm">{ach.name}</h4>
                                                    <span className={`text-[10px] font-bold uppercase ${rarityText[ach.rarity as keyof typeof rarityText]}`}>{ach.rarity}</span>
                                                </div>
                                                <p className="text-xs text-text-secondary">{ach.description}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Recent Battles */}
                        <RecentBattles battles={recentBattles} />
                    </div>

                </div>
            </div>

            {isShareCardVisible && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-bg-surface border border-border-default rounded-2xl p-6 w-full max-w-md relative animate-in zoom-in-95 duration-300">
                        <button
                            onClick={() => setIsShareCardVisible(false)}
                            className="absolute top-4 right-4 p-2 text-text-secondary hover:text-text bg-bg-surface-2 rounded-xl"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="text-xl font-bold mb-4">Share Profile</h3>
                        <ShareableCard user={user} skillScores={skillScores} winRate={winRate} />
                    </div>
                </div>
            )}
        </div>
    );
}
