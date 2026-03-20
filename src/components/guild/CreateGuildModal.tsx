'use client';
import React, { useState } from 'react';
import { Shield, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CreateGuildModal({ userId, onClose }: { userId: string, onClose: () => void }) {
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (name.length < 3) return setError('Name must be at least 3 characters');
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/guild/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description: desc, userId })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create');
            router.push(`/guild/${data.id}`);
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-bg-surface border border-border-default w-full max-w-md rounded-2xl p-6 relative shadow-2xl animate-in zoom-in-95 duration-200">
                <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary hover:text-white"><X className="w-5 h-5" /></button>
                <Shield className="w-12 h-12 text-accent-primary mb-4" />
                <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-2">Found a Guild</h2>
                <p className="text-text-secondary mb-6">Lead your peers and climb the ranks together. Max 10 operatives.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Guild Designation</label>
                        <input
                            type="text"
                            autoFocus
                            value={name}
                            onChange={e => setName(e.target.value)}
                            maxLength={20}
                            className="w-full bg-bg-surface-2 border border-border-default rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent-primary"
                            placeholder="e.g. Lambda Hackers"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Description (Optional)</label>
                        <textarea
                            value={desc}
                            onChange={e => setDesc(e.target.value)}
                            maxLength={200}
                            className="w-full bg-bg-surface-2 border border-border-default rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent-primary min-h-[100px] resize-none"
                            placeholder="State your purpose..."
                        />
                    </div>
                    {error && <div className="text-red-400 text-sm font-bold bg-red-400/10 p-3 rounded">{error}</div>}
                    <button
                        type="submit"
                        disabled={loading || name.length < 3}
                        className="w-full py-4 bg-accent-primary text-black font-black uppercase tracking-widest rounded-lg hover:bg-accent-primary-hover transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Deploy Guild'}
                    </button>
                </form>
            </div>
        </div>
    );
}
