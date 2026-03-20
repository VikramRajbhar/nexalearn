import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useUserStore } from '@/store/userStore';

export interface GuildMessage {
    id: string;
    userId: string;
    username: string;
    message: string;
    createdAt: string;
    isMe: boolean;
}

// Create a dedicated client for realtime subscriptions + reads
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const realtimeClient = createClient(supabaseUrl, supabaseAnonKey);

export function useGuildChat(guildId: string | null) {
    const user = useUserStore((state) => state.user);
    const [messages, setMessages] = useState<GuildMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Load existing messages via Supabase REST (anon key can read with USING(true))
    const loadMessages = useCallback(async () => {
        if (!guildId || !user) return;
        setIsLoading(true);

        try {
            const { data, error } = await realtimeClient
                .from('guild_messages')
                .select('*')
                .eq('guild_id', guildId)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) {
                console.error('Error loading messages:', error);
                return;
            }

            if (data) {
                const formatted = data.reverse().map((msg: any) => ({
                    id: msg.id,
                    userId: msg.user_id,
                    username: msg.username,
                    message: msg.message,
                    createdAt: msg.created_at,
                    isMe: msg.user_id === user.id
                }));
                setMessages(formatted);
            }
        } catch (err) {
            console.error('Failed to load messages:', err);
        } finally {
            setIsLoading(false);
        }
    }, [guildId, user]);

    useEffect(() => {
        loadMessages();
    }, [loadMessages]);

    // Subscribe to realtime INSERT events
    useEffect(() => {
        if (!guildId || !user) return;

        const channel = realtimeClient.channel(`guild-chat-${guildId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'guild_messages', filter: `guild_id=eq.${guildId}` },
                (payload: any) => {
                    const newMsg = payload.new;
                    const formatted: GuildMessage = {
                        id: newMsg.id,
                        userId: newMsg.user_id,
                        username: newMsg.username,
                        message: newMsg.message,
                        createdAt: newMsg.created_at,
                        isMe: newMsg.user_id === user.id
                    };
                    // Deduplicate: skip if we already have this message (from optimistic update)
                    setMessages(prev => {
                        if (prev.some(m => m.id === formatted.id)) return prev;
                        // Also remove any optimistic placeholder with matching text
                        const cleaned = prev.filter(m => !(m.id.startsWith('optimistic-') && m.message === formatted.message && m.userId === formatted.userId));
                        return [...cleaned, formatted];
                    });
                }
            )
            .subscribe((status) => {
                console.log(`[GuildChat] Realtime channel status: ${status}`);
            });

        return () => {
            realtimeClient.removeChannel(channel);
        };
    }, [guildId, user]);

    // Send message via API route (uses service_role key server-side to bypass RLS)
    const sendMessage = async (text: string) => {
        if (!guildId || !user || !text.trim()) return;

        const trimmed = text.trim();

        // Optimistic update — show message immediately
        const optimisticMsg: GuildMessage = {
            id: `optimistic-${Date.now()}`,
            userId: user.id,
            username: user.username,
            message: trimmed,
            createdAt: new Date().toISOString(),
            isMe: true
        };
        setMessages(prev => [...prev, optimisticMsg]);

        try {
            const res = await fetch(`/api/guild/${guildId}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    username: user.username,
                    message: trimmed
                })
            });

            if (!res.ok) {
                const err = await res.json();
                console.error('Send message failed:', err.error);
                // Remove optimistic message on failure
                setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
            }
            // On success, the realtime subscription will replace the optimistic message
        } catch (err) {
            console.error('Network error sending message:', err);
            setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
        }
    };

    return { messages, isLoading, sendMessage };
}
