'use client';

import React, { useEffect, useState } from 'react';
import { useUserStore } from '@/store/userStore';
import { useDashboard } from '@/hooks/useDashboard';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { ShareableCard } from '@/components/profile/ShareableCard';
import { SkillRadarChart } from '@/components/dashboard/SkillRadarChart';
import { RecentBattles } from '@/components/dashboard/RecentBattles';
import { Edit2, Shield, Info, Copy, X, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import type { AchievementDef } from '@/lib/achievements';

const LEAGUE_COLORS: Record<string, string> = {
    Bronze: '#CD7F32',
    Silver: '#C0C0C0',
    Gold: '#FFD700',
    Platinum: '#00CED1',
    Diamond: '#00FF41',
};

const rarityColors = {
    common: 'border-slate-300',
    uncommon: 'border-green-400',
    rare: 'border-blue-400',
    legendary: 'border-yellow-400 shadow-[0_0_20px_rgba(255,215,0,0.4)]',
};

const rarityBackground = {
    common: 'from-[#1a1a2e] to-[#0f0f1a]',
    uncommon: 'from-[#0d2818] to-[#0f0f1a]',
    rare: 'from-[#0d1528] to-[#0f0f1a]',
    legendary: 'from-[#2a1f0a] to-[#0f0f1a]',
};

const rarityIconBg = {
    common: 'bg-[#1a1a2e]',
    uncommon: 'bg-[#0d2818]',
    rare: 'bg-[#0d1528]',
    legendary: 'bg-[#2a1f0a]',
};

const rarityText = {
    common: 'text-slate-500',
    uncommon: 'text-green-600',
    rare: 'text-blue-600',
    legendary: 'text-yellow-600',
};

export default function ProfilePage() {
    const { user } = useUserStore();
    const { data: dashboardData, isLoading: isDashboardLoading } = useDashboard();

    const [achievements, setAchievements] = useState<{ earned: AchievementDef[], locked: AchievementDef[] }>({ earned: [], locked: [] });
    const [isAchievementsLoading, setIsAchievementsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'earned' | 'locked'>('earned');

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isShareCardVisible, setIsShareCardVisible] = useState(false);

    useEffect(() => {
        if (!user?.id) return;

        async function fetchAchievements() {
            try {
                const res = await fetch(`/api/achievements/${user!.id}`);
                if (res.ok) {
                    const data = await res.json();
                    // sort earned most recently first
                    if (data.earned) {
                        data.earned.sort((a: any, b: any) => new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime());
                    }
                    setAchievements(data);
                }
            } catch (err) {
                console.error('Failed to load achievements', err);
            } finally {
                setIsAchievementsLoading(false);
            }
        }

        fetchAchievements();
    }, [user?.id]);

    if (!user || isDashboardLoading) {
        return (
            <div className="p-6 max-w-5xl mx-auto space-y-6">
                <div className="flex justify-end">
                    <button
                        onClick={async () => {
                            await fetch('/api/auth/signout', { method: 'POST' });
                            useUserStore.getState().clearUser();
                            localStorage.removeItem('nexalearn-user-storage');
                            window.location.href = '/login';
                        }}
                        className="flex items-center gap-2 p-2.5 text-accent-red bg-bg-surface border border-accent-red/30 rounded-xl font-bold text-sm transition-all"
                    >
                        Emergency Sign Out
                    </button>
                </div>
                <div className="h-64 bg-bg-surface-2 animate-pulse rounded-2xl"></div>
                <div className="h-40 bg-bg-surface-2 animate-pulse rounded-2xl"></div>
                <div className="h-[400px] bg-bg-surface-2 animate-pulse rounded-2xl"></div>
            </div>
        );
    }

    const leagueColor = LEAGUE_COLORS[user.league || 'Bronze'] || '#00FF41';
    const winRate = dashboardData?.winRate || 0;
    const skillScores = dashboardData?.skillScores || [];
    const battles = dashboardData?.recentBattles || [];
    const guildInfo = dashboardData?.guildInfo;

    const currentWinStreak = battles.length > 0 ? (
        battles[0].result === 'win' ? buildStreak(battles) : 0
    ) : 0;

    function buildStreak(history: any[]) {
        let streak = 0;
        for (const battle of history) {
            if (battle.result === 'win') streak++;
            else break;
        }
        return streak;
    }

    const profileUrl = typeof window !== 'undefined' ? `${window.location.origin}/profile/${user.username}` : `https://nexalearn.app/profile/${user.username}`;

    return (
        <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">

            {/* SECTION 1 - Profile Header */}
            <div className="relative bg-gradient-to-br from-bg-surface-2/40 to-bg-surface-2/20 border border-border-default rounded-3xl overflow-hidden neo-glow">
                {/* Background Gradient Decorative Line */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-accent-primary to-transparent" />

                <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row items-center text-center md:text-left gap-6 md:gap-10">
                    {/* Avatar with League Ring */}
                    <div className="relative shrink-0">
                        <div
                            className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 flex items-center justify-center text-5xl md:text-6xl bg-bg-surface z-10 relative neo-glow-strong"
                            style={{ borderColor: leagueColor }}
                        >
                            {user.avatar_url && user.avatar_url.startsWith('http') ? (
                                <img
                                    src={user.avatar_url}
                                    alt={user.username}
                                    className="w-full h-full rounded-full object-cover"
                                    referrerPolicy="no-referrer"
                                />
                            ) : (
                                <span>{user.avatar_url || '👨‍💻'}</span>
                            )}
                        </div>
                        {/* Metallic glowing ring */}
                        <div
                            className="absolute -inset-2 rounded-full opacity-60 animate-pulse border border-accent-primary/40"
                            style={{ boxShadow: `0 0 25px ${leagueColor}60` }}
                        />
                        {/* League Badge floating on avatar */}
                        <div
                            className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-xs font-black italic border flex items-center shadow-lg z-20"
                            style={{ borderColor: leagueColor, backgroundColor: '#fff', color: leagueColor, boxShadow: `0 0 15px ${leagueColor}50` }}
                        >
                            {user.league}
                        </div>
                    </div>

                    <div className="flex-1 w-full">
                        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-text">
                                {user.username}
                            </h1>
                        </div>

                        <p className="text-text-secondary font-medium tracking-wide mb-6 uppercase text-xs md:text-sm">
                            {user.college} <span className="opacity-50 mx-2">•</span> Semester {user.semester}
                        </p>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-bg-surface border border-border-default shadow-sm rounded-xl font-bold text-sm hover:-translate-y-0.5 transition-transform"
                            >
                                <Edit2 className="w-4 h-4" /> Edit Profile
                            </button>
                            <button
                                onClick={() => setIsShareCardVisible(true)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-accent-primary/10 text-accent-primary border border-accent-primary/30 rounded-xl font-bold text-sm hover:bg-accent-primary/20 hover:-translate-y-0.5 transition-transform"
                            >
                                <ShareableCardIcon className="w-4 h-4" /> Share Card
                            </button>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(profileUrl);
                                    toast.success('Profile URL copied!');
                                }}
                                className="flex items-center gap-2 p-2.5 text-text-secondary hover:text-accent-primary hover:bg-accent-primary/10 border border-transparent hover:border-accent-primary/30 rounded-xl font-bold text-sm transition-all duration-200 active:scale-90"
                                title="Copy profile URL"
                            >
                                <Copy className="w-4 h-4" />
                            </button>
                            <button
                                onClick={async () => {
                                    await fetch('/api/auth/signout', { method: 'POST' });
                                    useUserStore.getState().clearUser();
                                    localStorage.removeItem('nexalearn-user-storage');
                                    window.location.href = '/login';
                                }}
                                className="flex items-center gap-2 p-2.5 text-accent-red hover:bg-accent-red/10 border border-transparent hover:border-accent-red/30 rounded-xl font-bold text-sm transition-all duration-200 active:scale-90"
                                title="Sign Out"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>


            {/* SECTION 2 - Stats Row */}
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
                    <div className="text-[10px] text-orange-500/70 uppercase tracking-widest font-bold">Battle Streak</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                <div className="lg:col-span-7 space-y-8">
                    {/* SECTION 3 - Skill Map */}
                    <div className="bg-bg-surface border border-border-default rounded-3xl p-6">
                        <h3 className="text-xl font-black flex items-center gap-2 mb-6">
                            Skill Map <Info className="w-4 h-4 text-text-secondary" />
                        </h3>
                        <SkillRadarChart skillScores={skillScores} />

                        <div className="mt-8 space-y-5">
                            <h4 className="font-bold text-xs uppercase tracking-widest text-text-secondary border-b border-border-default pb-2">Combat Readiness</h4>
                            {/* Segmented Progress Bars */}
                            {[...skillScores].sort((a, b) => b.score - a.score).map((skill) => (
                                <div key={skill.id} className="bg-bg-surface/50 p-4 rounded-xl border border-accent-primary/20 neo-glow">
                                    <div className="flex justify-between items-end mb-3">
                                        <span className="font-bold text-text tracking-wider uppercase">{skill.topic} // SKILL</span>
                                        <span className="text-accent-primary font-mono font-bold text-lg leading-none">{skill.score}%</span>
                                    </div>
                                    <div className="segmented-bar">
                                        {Array.from({ length: 12 }).map((_, i) => {
                                            const isActive = i < Math.round((skill.score / 100) * 12);
                                            return (
                                                <div
                                                    key={i}
                                                    className={`segment ${isActive ? 'segment-active' : ''}`}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SECTION 5 - Battle History */}
                    <RecentBattles battles={battles} />
                    {battles.length >= 5 && (
                        <div className="text-center">
                            <button className="text-sm font-bold text-text-secondary hover:text-accent-primary transition-colors">
                                View All Battles
                            </button>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-5 space-y-8">
                    {/* SECTION 6 - Guild Card */}
                    <div className="bg-bg-surface border border-border-default rounded-3xl p-6">
                        <h3 className="text-xl font-black flex items-center gap-2 mb-6">
                            <Shield className="w-5 h-5 text-accent-primary" /> Guild
                        </h3>
                        {guildInfo ? (
                            <div className="flex flex-col items-center text-center p-4 bg-bg-surface-2 rounded-2xl border border-border-default">
                                <div className="w-16 h-16 bg-accent-primary/20 rounded-full flex items-center justify-center mb-4 border border-accent-primary/30">
                                    <Shield className="w-8 h-8 text-accent-primary" />
                                </div>
                                <h4 className="text-xl font-black mb-1">{guildInfo.name}</h4>
                                <p className="text-sm text-text-secondary mb-4">{guildInfo.description}</p>
                                <div className="w-full flex justify-between bg-bg-surface p-3 rounded-xl border border-border-default mb-4">
                                    <div className="text-center w-full">
                                        <div className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">Weekly XP</div>
                                        <div className="font-black text-yellow-500">⚡ {guildInfo.weekly_xp}</div>
                                    </div>
                                </div>
                                <a href="/guild" className="w-full py-3 bg-bg-surface border border-accent-primary/50 text-accent-primary font-bold rounded-xl hover:bg-accent-primary/10 transition-colors">
                                    View Guild
                                </a>
                            </div>
                        ) : (
                            <div className="text-center p-6 bg-bg-surface-2 rounded-2xl border border-border-default border-dashed">
                                <Shield className="w-12 h-12 text-text-secondary mx-auto mb-3 opacity-50" />
                                <p className="text-sm text-text-secondary mb-4">You are not in a guild yet. Team up with others to earn rewards!</p>
                                <a href="/guild" className="inline-block px-6 py-2 bg-accent-primary text-black font-bold rounded-xl hover:bg-accent-primary-hover transition-colors">
                                    Join a Guild
                                </a>
                            </div>
                        )}
                    </div>

                    {/* SECTION 4 - Achievements */}
                    <div className="bg-bg-surface border border-border-default rounded-3xl p-6 overflow-hidden flex flex-col h-[700px]">
                        <div className="flex items-center justify-between mb-6 shrink-0">
                            <h3 className="text-xl font-black flex items-center gap-2">
                                Hall of Fame
                            </h3>
                            <div className="flex items-center gap-1 bg-bg-surface-2 p-1 rounded-xl border border-border-default">
                                <button
                                    onClick={() => setActiveTab('earned')}
                                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeTab === 'earned' ? 'bg-accent-primary text-black' : 'text-text-secondary hover:text-text'
                                        }`}
                                >
                                    Earned ({achievements.earned.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('locked')}
                                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeTab === 'locked' ? 'bg-bg-surface border border-border-default text-text' : 'text-text-secondary hover:text-text'
                                        }`}
                                >
                                    Locked ({achievements.locked.length})
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            {isAchievementsLoading ? (
                                <div className="text-center text-text-secondary py-10">Loading achievements...</div>
                            ) : activeTab === 'earned' && achievements.earned.length === 0 ? (
                                <div className="text-center text-text-secondary py-10 bg-bg-surface-2 rounded-xl border border-border-default">
                                    <div className="text-4xl mb-3 opacity-50">🏆</div>
                                    <p>No achievements yet.<br />Play your first battle!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    {activeTab === 'earned' ? (
                                        achievements.earned.map((ach) => (
                                            <div key={ach.id} className={`achievement-card flex flex-col items-center text-center gap-3 p-4 rounded-xl border bg-gradient-to-b ${rarityBackground[ach.rarity]} ${rarityColors[ach.rarity]} shadow-sm hover:shadow-md relative overflow-hidden group`}>
                                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl border border-white/40 shadow-inner ${rarityIconBg[ach.rarity]}`}>
                                                    {ach.icon}
                                                </div>
                                                <div className="space-y-1 relative z-10 w-full">
                                                    <h4 className="font-black text-sm text-text leading-tight">{ach.name}</h4>
                                                    <div className={`text-[9px] font-bold uppercase tracking-widest ${rarityText[ach.rarity]}`}>{ach.rarity}</div>
                                                </div>
                                                <p className="text-xs text-text-secondary leading-snug">{ach.description}</p>
                                                <div className="mt-auto pt-2 text-[10px] font-bold text-yellow-400 border-t border-border-default/30 w-full">
                                                    +{ach.xpReward} XP
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        achievements.locked.map((ach) => (
                                            <div key={ach.id} className="achievement-card flex flex-col items-center text-center gap-3 p-4 rounded-xl border border-border-default bg-bg-surface-2/30 opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-help relative group">
                                                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl border border-border-default bg-bg-surface shadow-inner">
                                                    {ach.icon}
                                                </div>
                                                <div className="space-y-1 relative z-10 w-full">
                                                    <h4 className="font-black text-sm text-text-secondary group-hover:text-text leading-tight">{ach.name}</h4>
                                                    <div className="text-[9px] font-bold uppercase tracking-widest text-text-secondary">Locked</div>
                                                </div>
                                                <p className="text-xs text-text-secondary leading-snug">{ach.description}</p>
                                                <div className="mt-auto pt-2 text-[10px] font-bold text-text-secondary border-t border-border-default w-full">
                                                    +{ach.xpReward} XP
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />

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

function ShareableCardIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M3 9h18" />
            <path d="M9 21V9" />
        </svg>
    );
}
