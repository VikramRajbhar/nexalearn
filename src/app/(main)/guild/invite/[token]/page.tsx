'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { Shield, Users, Zap, Loader2, AlertTriangle } from 'lucide-react';

export default function GuildInviteAcceptPage({ params }: { params: any }) {
    const user = useUserStore(s => s.user);
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);
    const [guild, setGuild] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        Promise.resolve(params).then(p => setToken(p.token));
    }, [params]);

    useEffect(() => {
        if (!token) return;
        fetch(`/api/guild/invite/${token}/validate`)
            .then(res => res.json())
            .then(data => {
                if (data.error) setError(data.error);
                else setGuild(data);
                setLoading(false);
            });
    }, [token]);

    const handleJoin = async () => {
        if (!user) return router.push('/login');
        setJoining(true);
        try {
            const res = await fetch(`/api/guild/join/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to join');
            router.push(`/guild/${data.id}`);
        } catch (err: any) {
            setError(err.message);
            setJoining(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-12 h-12 text-primary animate-spin" /></div>;
    }

    return (
        <div className="max-w-xl mx-auto p-4 md:p-8 pt-20">
            <div className="bg-surface/80 border border-border p-8 rounded-2xl flex flex-col items-center text-center shadow-2xl backdrop-blur-md relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-accent-primary/5 to-transparent pointer-events-none" />

                <Shield className="w-20 h-20 text-accent-primary mb-6 drop-shadow-[0_0_15px_rgba(0,255,65,0.4)]" />

                {error ? (
                    <div className="space-y-4">
                        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
                        <h1 className="text-2xl font-black text-white uppercase">Uplink Failed</h1>
                        <p className="text-red-400 font-bold bg-red-400/10 px-4 py-2 rounded-lg">{error}</p>
                        <button onClick={() => router.push('/guild')} className="px-6 py-3 bg-surface2 border border-border text-white rounded-lg hover:bg-surface mt-4">Return to Directory</button>
                    </div>
                ) : (
                    <div className="space-y-6 w-full">
                        <div>
                            <h5 className="text-accent-primary font-bold tracking-widest uppercase text-xs mb-2">You have been invited to join</h5>
                            <h1 className="text-3xl font-black text-white">{guild.name}</h1>
                            <p className="text-text-secondary text-sm mt-3">{guild.description || 'A highly classified operative squad.'}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 bg-surface2/50 border border-border p-4 rounded-xl">
                            <div className="flex flex-col items-center">
                                <Users className="w-6 h-6 text-blue-400 mb-2" />
                                <span className="text-white font-bold">{guild.member_count}/10 Members</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <Zap className="w-6 h-6 text-yellow-500 mb-2" />
                                <span className="text-white font-bold">{guild.weekly_xp.toLocaleString()} Weekly XP</span>
                            </div>
                        </div>
                        <div className="text-xs text-text-secondary uppercase tracking-wider">
                            Commanded by <span className="text-accent-primary font-bold">{guild.users?.username}</span>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button onClick={() => router.push('/guild')} className="flex-1 py-3 bg-surface2 border border-border text-white font-bold rounded-lg hover:bg-surface transition-colors">Cancel</button>
                            <button disabled={joining} onClick={handleJoin} className="flex-1 py-3 bg-accent-primary text-black font-black uppercase tracking-widest rounded-lg hover:bg-accent-primary-hover transition-colors shadow-[0_0_20px_rgba(108,99,255,0.3)] hover:shadow-[0_0_30px_rgba(108,99,255,0.5)] flex items-center justify-center">
                                {joining ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Accept Invite'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
