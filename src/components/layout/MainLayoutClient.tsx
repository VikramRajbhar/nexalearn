'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { Home, Swords, Trophy, Shield, User as UserIcon, LogOut, Menu, X } from 'lucide-react';
import { AchievementPopup } from '@/components/achievements/AchievementPopup';
import { authClient } from '@/lib/auth-client';

const NAV_LINKS = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, highlight: false },
    { name: 'Battle', href: '/battle', icon: Swords, highlight: true },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy, highlight: false },
    { name: 'Guild', href: '/guild', icon: Shield, highlight: false },
    { name: 'Profile', href: '/profile', icon: UserIcon, highlight: false },
];

const LEAGUE_COLORS: Record<string, string> = {
    Bronze: '#CD7F32',
    Silver: '#C0C0C0',
    Gold: '#FFD700',
    Platinum: '#00CED1',
    Diamond: '#00FF41',
};

export function MainLayoutClient({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, setUser } = useUserStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Auto-load user from custom session cookie (for Google OAuth users)
    useEffect(() => {
        if (!user && isMounted) {
            fetch('/api/auth/me')
                .then(res => res.ok ? res.json() : null)
                .then(data => {
                    if (data?.user) {
                        setUser(data.user);
                    }
                })
                .catch(() => { });
        }
    }, [isMounted, user, setUser]);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/signout', { method: 'POST' });
        } finally {
            setUser(null as any);
            localStorage.removeItem('nexalearn-user-storage');
            router.push('/login');
        }
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    const leagueColor = isMounted && user?.league ? LEAGUE_COLORS[user.league] || '#00FF41' : '#00FF41';

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-bg-surface border-r border-border-default text-text-primary">
            {/* Logo Area */}
            <div className="p-4 flex items-center justify-between md:justify-center overflow-hidden">
                <Link href="/dashboard" className="flex items-center gap-3 min-w-0 overflow-hidden" onClick={closeMobileMenu}>
                    <div className="w-10 h-10 bg-accent-primary/20 rounded-xl border border-accent-primary/50 flex items-center justify-center font-black text-accent-primary text-xl shadow-[0_0_15px_rgba(108,99,255,0.3)] flex-shrink-0">
                        N
                    </div>
                    <span className="font-black tracking-widest text-xl hidden lg:block uppercase bg-clip-text text-transparent bg-gradient-to-r from-accent-primary to-accent-green truncate">
                        NexaLearn
                    </span>
                    <span className="font-black tracking-widest text-xl block md:hidden uppercase bg-clip-text text-transparent bg-gradient-to-r from-accent-primary to-accent-green truncate">
                        NexaLearn
                    </span>
                </Link>
                <button
                    className="md:hidden text-text-muted hover:text-text-primary transition-colors"
                    onClick={closeMobileMenu}
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Nav Links */}
            <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
                {NAV_LINKS.map((link) => {
                    const isActive = pathname.startsWith(link.href);
                    const Icon = link.icon;

                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            onClick={closeMobileMenu}
                            className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold group
                ${isActive
                                    ? link.highlight
                                        ? 'bg-accent-primary text-black shadow-[0_0_15px_rgba(108,99,255,0.4)]'
                                        : 'bg-bg-surface-2 text-accent-primary border border-accent-primary/30'
                                    : 'text-text-secondary hover:bg-bg-surface-2 hover:text-text-primary'
                                }
              `}
                        >
                            <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                            <span className="block md:hidden lg:block">{link.name}</span>
                        </Link>
                    );
                })}
            </div>

            {/* User Area */}
            {isMounted && user && (
                <div className="p-4 border-t border-border-default mt-auto">
                    {/* Collapsed (md): just avatar centered + tooltip */}
                    <div className="hidden md:flex lg:hidden justify-center">
                        <button
                            onClick={handleLogout}
                            className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-lg bg-bg-surface-2 border-2 hover:border-accent-red transition-colors"
                            style={{ borderColor: leagueColor }}
                            title={`Logout (${user.username})`}
                        >
                            {user.username.charAt(0).toUpperCase()}
                        </button>
                    </div>
                    {/* Expanded (lg+) and mobile: full user card */}
                    <div className="flex lg:flex md:hidden items-center gap-3 p-3 rounded-xl bg-bg-base border border-border-default overflow-hidden">
                        <div
                            className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-lg bg-bg-surface-2 border-2"
                            style={{ borderColor: leagueColor }}
                        >
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold truncate text-sm">{user.username}</p>
                            <p
                                className="text-[10px] font-bold uppercase tracking-wider truncate"
                                style={{ color: leagueColor }}
                            >
                                {user.league || 'Unranked'}
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex-shrink-0 p-2 text-text-secondary hover:text-accent-red hover:bg-accent-red/10 rounded-lg transition-colors"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
            {/* Fallback logout when user data hasn't loaded */}
            {isMounted && !user && (
                <div className="p-4 border-t border-border-default mt-auto">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-accent-red/10 border border-accent-red/30 text-accent-red font-bold text-sm hover:bg-accent-red/20 transition-colors"
                    >
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div className="flex h-screen bg-bg-base overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-20 lg:w-64 flex-shrink-0 transition-all duration-300 z-20">
                <SidebarContent />
            </aside>

            {/* Mobile Drawer Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={closeMobileMenu}
                />
            )}

            {/* Mobile Sidebar */}
            <div className={`fixed inset-y-0 left-0 w-64 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-50 md:hidden`}>
                <SidebarContent />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden flex items-center justify-between p-4 bg-bg-surface border-b border-border-default z-30">
                    <div className="w-10 h-10 bg-accent-primary/20 rounded-xl border border-accent-primary/50 flex items-center justify-center font-black text-accent-primary text-xl">
                        N
                    </div>
                    <button
                        className="p-2 bg-bg-surface-2 border border-border-default rounded-xl text-text-primary"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </header>

                {/* Content Scrollable Area */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-0">
                    {children}
                </main>
            </div>

            <AchievementPopup />
        </div>
    );
}
