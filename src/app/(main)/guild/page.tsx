'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { Shield, Link as LinkIcon, Search, Loader2 } from 'lucide-react';
import { CreateGuildModal } from '@/components/guild/CreateGuildModal';

export default function GuildDiscoveryPage() {
    const user = useUserStore(s => s.user);
    const router = useRouter();
    const [showCreate, setShowCreate] = useState(false);
    const [inviteToken, setInviteToken] = useState('');
    const [search, setSearch] = useState('');
    const [guilds, setGuilds] = useState<any[]>([]);
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
        if (!user) return;
        fetch(`/api/user/${user.id}/guild`)
            .then(res => res.json())
            .then(data => {
                if (data.guildId) {
                    router.replace(`/guild/${data.guildId}`);
                } else {
                    setInitializing(false);
                }
            });
    }, [user, router]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetch(`/api/guild/search?q=${search}`).then(res => res.json()).then(setGuilds);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const handleJoinToken = (e: React.FormEvent) => {
        e.preventDefault();
        if (inviteToken) {
            const parts = inviteToken.trim().split('/');
            router.push(`/guild/invite/${parts[parts.length - 1]}`);
        }
    };

    if (!user || initializing) {
        return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-10 h-10 animate-spin text-accent-primary" /></div>;
    }

    return (
        <div className="max-w-6xl mx-auto p-5 md:p-7 space-y-9">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl md:text-[2.1rem] font-black text-white uppercase tracking-widest flex items-center gap-3">
                    <Shield className="w-9 h-9 text-accent-primary drop-shadow-[0_0_10px_rgba(108,99,255,0.5)]" /> Guilds
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                <div className="bg-bg-surface/50 border border-border-default p-7 rounded-2xl flex flex-col items-center text-center hover:border-accent-primary/50 transition-colors shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
                    <Shield className="w-[72px] h-[72px] text-accent-primary mb-5" />
                    <h2 className="text-2xl font-bold text-white mb-2.5 uppercase tracking-wide">Create Your Guild</h2>
                    <p className="text-text-secondary mb-9 text-[1.05rem] leading-relaxed">Lead your batchmates to victory. Form a squad of up to 10 operatives and climb the ladders together.</p>
                    <button onClick={() => setShowCreate(true)} className="px-9 py-3.5 bg-accent-primary text-black font-black uppercase tracking-widest rounded-lg hover:bg-accent-primary-hover w-full transition-transform active:scale-95 shadow-[0_0_15px_rgba(108,99,255,0.4)] text-[1.05rem]">Initialize Protocol</button>
                </div>

                <div className="bg-bg-surface/50 border border-border-default p-7 rounded-2xl flex flex-col items-center text-center hover:border-accent-primary/50 transition-colors shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
                    <LinkIcon className="w-[72px] h-[72px] text-blue-400 mb-5" />
                    <h2 className="text-2xl font-bold text-white mb-2.5 uppercase tracking-wide">Secure Invite</h2>
                    <p className="text-text-secondary mb-9 text-[1.05rem] leading-relaxed">Paste your secure token uplink here to join an existing squad instantly.</p>
                    <form onSubmit={handleJoinToken} className="w-full flex flex-col sm:flex-row gap-2">
                        <input
                            type="text"
                            value={inviteToken}
                            onChange={e => setInviteToken(e.target.value)}
                            placeholder="Token or URL..."
                            className="flex-1 bg-bg-surface-2 border border-border-default rounded-lg px-5 py-3.5 text-white focus:outline-none focus:ring-1 focus:ring-accent-primary text-[1.05rem]"
                        />
                        <button type="submit" disabled={!inviteToken} className="px-7 py-3.5 bg-blue-500/20 border border-blue-500/50 text-blue-400 font-bold uppercase rounded-lg hover:bg-blue-500/30 disabled:opacity-50 transition-colors whitespace-nowrap text-[1.05rem]">Join Guild</button>
                    </form>
                </div>
            </div>

            <div className="pt-9">
                <h2 className="text-2xl font-black text-white mb-7 uppercase tracking-widest flex items-center gap-3">
                    <Search className="w-6 h-6 text-text-secondary" /> Global Guild Directory
                </h2>
                <div className="relative mb-9">
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search guild networks..."
                        className="w-full bg-bg-surface/50 border border-border-default rounded-xl px-6 py-3.5 text-white focus:outline-none focus:ring-1 focus:ring-accent-primary text-[1.05rem]"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {guilds.map(g => (
                        <div key={g.id} className="p-7 bg-bg-surface/80 border border-border-default rounded-xl hover:border-accent-primary/30 transition-colors group relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <h3 className="text-2xl font-bold text-accent-primary mb-2.5 relative z-10">{g.name}</h3>
                            <p className="text-text-secondary text-[0.94rem] mb-7 h-11 line-clamp-2 relative z-10">{g.description || 'Classified operatives.'}</p>
                            <div className="flex justify-between items-center text-[0.94rem] font-bold relative z-10 pt-5 border-t border-border-subtle">
                                <span className="text-[#00FF41]/80 flex items-center gap-1.5">
                                    ⚡ {g.weekly_xp.toLocaleString()} XP
                                </span>
                                <span className="text-text-secondary px-3 py-1 bg-bg-surface-2 rounded-lg">{g.member_count}/10 Members</span>
                            </div>
                        </div>
                    ))}
                </div>
                {guilds.length === 0 && search && (
                    <div className="text-center text-text-secondary py-14 text-[1.05rem]">
                        No guild networks matching &apos;{search}&apos; found in the mainframe.
                    </div>
                )}
            </div>

            {showCreate && <CreateGuildModal userId={user.id} onClose={() => setShowCreate(false)} />}
        </div>
    );
}
