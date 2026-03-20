'use client';
import React, { useState, useEffect } from 'react';
import { Copy, RefreshCw, Share2, Check } from 'lucide-react';

interface GuildInviteProps {
    inviteToken: string;
    guildId: string;
    isLeader: boolean;
    onRegenerate: () => void;
}

export function GuildInvite({ inviteToken, guildId, isLeader, onRegenerate }: GuildInviteProps) {
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);
    const [origin, setOrigin] = useState('');

    useEffect(() => {
        setOrigin(window.location.origin);
    }, []);

    const inviteUrl = `${origin}/guild/invite/${inviteToken}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(inviteUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRegen = async () => {
        setLoading(true);
        try {
            await fetch(`/api/guild/${guildId}/invite`, { method: 'POST', body: JSON.stringify({ userId: 'handled_by_session' }) }); // Needs auth token realistically, passing for demo
            onRegenerate();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-bg-surface/50 border border-border-default rounded-xl p-6 backdrop-blur-sm text-center">
            <Share2 className="w-10 h-10 text-accent-primary mx-auto mb-4 opacity-80" />
            <h3 className="text-lg font-bold text-white mb-2">Recruit Operatives</h3>
            <p className="text-text-secondary text-sm mb-6 max-w-sm mx-auto">Share this encrypted uplink with your batchmates to invite them. Maximum 10 operators per unit.</p>

            <div className="flex items-center gap-2 bg-bg-surface-2 border border-border-default p-2 rounded-lg mb-4 cursor-text">
                <code className="flex-1 text-xs text-accent-primary truncate text-left select-all px-2 overflow-hidden whitespace-nowrap">{inviteUrl}</code>
                <button
                    onClick={copyToClipboard}
                    className="p-2 bg-bg-surface border border-border-default hover:bg-accent-primary/20 hover:text-accent-primary rounded text-white transition-colors flex-shrink-0"
                >
                    {copied ? <Check className="w-4 h-4 text-accent-primary" /> : <Copy className="w-4 h-4" />}
                </button>
            </div>

            {isLeader && (
                <button
                    onClick={handleRegen}
                    disabled={loading}
                    className="text-xs text-text-secondary hover:text-white flex items-center justify-center gap-1 mx-auto transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                    Regenerate Invite Token
                </button>
            )}
        </div>
    );
}
