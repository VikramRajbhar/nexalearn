'use client';
import React, { useRef, useEffect, useState } from 'react';
import { useGuildChat } from '@/hooks/useGuildChat';
import { Send, Loader2, Hash, Smile, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getInitials(name: string) {
    return name?.substring(0, 2).toUpperCase() || '??';
}

// Hash a string to a consistent hue for avatar background colors
function nameToColor(name: string) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 60%, 35%)`;
}

export function GuildChat({ guildId }: { guildId: string }) {
    const { messages, isLoading, sendMessage } = useGuildChat(guildId);
    const [input, setInput] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || input.length > 500) return;
        sendMessage(input);
        setInput('');
    };

    if (isLoading) return <div className="h-[480px] bg-bg-surface/60 rounded-2xl flex items-center justify-center border border-border-default"><Loader2 className="animate-spin text-accent-primary w-6 h-6" /></div>;

    // Group consecutive messages by the same user
    const grouped: { username: string; isMe: boolean; msgs: typeof messages }[] = [];
    for (const msg of messages) {
        const last = grouped[grouped.length - 1];
        if (last && last.username === msg.username) {
            last.msgs.push(msg);
        } else {
            grouped.push({ username: msg.username, isMe: msg.isMe, msgs: [msg] });
        }
    }

    return (
        <div className="flex flex-col h-[480px] bg-bg-surface/60 border border-border-default rounded-2xl overflow-hidden backdrop-blur-md">
            {/* Discord-style Header */}
            <div className="px-4 py-3 border-b border-border-default/60 bg-bg-surface-2/30 flex items-center gap-2.5">
                <Hash className="w-5 h-5 text-text-secondary" />
                <span className="font-bold text-white text-sm">guild-chat</span>
                <div className="h-4 w-px bg-border-default mx-1" />
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-text-secondary">Online</span>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 scrollbar-thin scrollbar-thumb-border-default scrollbar-track-transparent">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <Hash className="w-12 h-12 text-text-secondary/30 mb-3" />
                        <div className="text-text-secondary font-bold">Welcome to #guild-chat</div>
                        <div className="text-text-secondary/60 text-xs mt-1">This is the start of your guild conversation.</div>
                    </div>
                ) : (
                    grouped.map((group, gIdx) => (
                        <div key={gIdx} className="flex gap-3 group/msg hover:bg-bg-surface-2/20 -mx-2 px-2 py-1 rounded-lg transition-colors">
                            {/* Avatar */}
                            <div className="flex-shrink-0 mt-0.5">
                                <div
                                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white"
                                    style={{ backgroundColor: nameToColor(group.username) }}
                                >
                                    {getInitials(group.username)}
                                </div>
                            </div>

                            {/* Message Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2">
                                    <span className={cn(
                                        "font-bold text-sm",
                                        group.isMe ? "text-accent-primary" : "text-white"
                                    )}>{group.username}</span>
                                    <span className="text-[10px] text-text-secondary/50 opacity-0 group-hover/msg:opacity-100 transition-opacity">
                                        {formatTime(group.msgs[0].createdAt)}
                                    </span>
                                </div>
                                <div className="space-y-0.5 mt-0.5">
                                    {group.msgs.map(msg => (
                                        <div
                                            key={msg.id}
                                            className={cn(
                                                "text-sm leading-relaxed py-0.5 group/line",
                                                msg.isMe ? "text-text" : "text-text-secondary"
                                            )}
                                        >
                                            <span>{msg.message}</span>
                                            <span className="text-[9px] text-text-secondary/40 ml-2 opacity-0 group-hover/line:opacity-100 transition-opacity">
                                                {formatTime(msg.createdAt)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))
                )}
                <div ref={bottomRef} />
            </div>

            {/* Discord-style Input */}
            <div className="px-4 pb-4 pt-1">
                <form onSubmit={handleSend} className="flex items-center gap-0 bg-bg-surface-2/60 border border-border-default/60 rounded-lg overflow-hidden focus-within:border-accent-primary/30 transition-colors">
                    <button type="button" className="px-3 py-2.5 text-text-secondary/50 hover:text-text-secondary transition-colors">
                        <Plus className="w-5 h-5" />
                    </button>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        maxLength={500}
                        placeholder="Message #guild-chat"
                        className="flex-1 bg-transparent py-2.5 text-sm text-white placeholder:text-text-secondary/40 focus:outline-none"
                    />
                    <button type="button" className="px-2 py-2.5 text-text-secondary/50 hover:text-text-secondary transition-colors">
                        <Smile className="w-5 h-5" />
                    </button>
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        className={cn(
                            "px-4 py-2.5 transition-all",
                            input.trim()
                                ? "text-accent-primary hover:text-accent-primary/80"
                                : "text-text-secondary/30 cursor-not-allowed"
                        )}
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
}
