'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSocket, getStableUserId, getStableUsername } from '@/lib/socket-client';
import { useUserStore } from '@/store/userStore';

const TOPICS = [
    { id: 'DSA', name: 'Data Structures & Algorithms', icon: '🌳', ready: true },
    { id: 'JavaScript', name: 'JavaScript', icon: '⚡', ready: true },
    { id: 'SQL', name: 'SQL & Databases', icon: '🗄️', ready: true },
    { id: 'OS', name: 'Operating Systems', icon: '💻', ready: false },
    { id: 'DBMS', name: 'DBMS', icon: '📊', ready: false },
    { id: 'CN', name: 'Computer Networks', icon: '🌐', ready: false },
    { id: 'Python', name: 'Python', icon: '🐍', ready: false },
    { id: 'OOP', name: 'Object Oriented Programming', icon: '🔷', ready: false },
];

export default function BattlePage() {
    const router = useRouter();
    const { user } = useUserStore();
    const [searching, setSearching] = useState(false);
    const [matchFound, setMatchFound] = useState(false);
    const [roomId, setRoomId] = useState<string | null>(null);
    const [opponent, setOpponent] = useState<any>(null);
    const [searchTime, setSearchTime] = useState(0);
    const [countdown, setCountdown] = useState(3);
    const searchTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const listenersRef = useRef(false);

    useEffect(() => {
        if (listenersRef.current) return;
        listenersRef.current = true;

        const socket = getSocket();
        const myUserId = user?.id || getStableUserId();

        const onFound = (data: any) => {
            console.log('[Battle] matchmaking:found', data);
            if (!data?.roomId) return;

            setRoomId(data.roomId);
            setMatchFound(true);
            if (searchTimerRef.current) { clearInterval(searchTimerRef.current); searchTimerRef.current = null; }

            if (data.player1 && data.player2) {
                const opp = data.player1.userId === myUserId ? data.player2 : data.player1;
                setOpponent(opp);
            }
        };

        socket.on('matchmaking:found', onFound);
        socket.on('battle:opponent', (data: any) => {
            if (!data?.roomId) return;
            setRoomId(data.roomId);
            setMatchFound(true);
            setOpponent({ userId: data.userId, username: data.username });
            if (searchTimerRef.current) { clearInterval(searchTimerRef.current); searchTimerRef.current = null; }
        });

        return () => {
            socket.off('matchmaking:found', onFound);
            socket.off('battle:opponent');
        };
    }, []);

    // Countdown effect
    useEffect(() => {
        if (!matchFound || !roomId) return;
        setCountdown(3);
        const iv = setInterval(() => setCountdown(p => Math.max(0, p - 1)), 1000);
        return () => clearInterval(iv);
    }, [matchFound, roomId]);

    // Navigate when countdown hits 0
    useEffect(() => {
        if (countdown === 0 && matchFound && roomId) {
            router.push(`/battle/${roomId}`);
        }
    }, [countdown, matchFound, roomId, router]);

    const handleTopicSelect = useCallback((topicId: string) => {
        setSearching(true);
        setMatchFound(false);
        setOpponent(null);
        setRoomId(null);
        setSearchTime(0);
        setCountdown(3);

        localStorage.setItem('battleTopic', topicId);

        const socket = getSocket();
        const userId = user?.id || getStableUserId();
        const username = user?.username || getStableUsername();

        const payload = { userId, username, topic: topicId, skillScore: 50 };
        console.log('[Battle] matchmaking:join', payload);
        socket.emit('matchmaking:join', payload);

        searchTimerRef.current = setInterval(() => setSearchTime(p => p + 1), 1000);
    }, []);

    const handleCancel = useCallback(() => {
        const socket = getSocket();
        socket.emit('matchmaking:cancel');
        setSearching(false);
        setSearchTime(0);
        if (searchTimerRef.current) { clearInterval(searchTimerRef.current); searchTimerRef.current = null; }
    }, []);

    if (matchFound) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-6">
                <div className="text-6xl">⚔️</div>
                <h2 className="text-3xl font-bold text-accent-primary">Opponent Found!</h2>
                {opponent && (
                    <p className="text-xl text-text-secondary">
                        vs <span className="font-semibold text-text-primary">{opponent.username}</span>
                    </p>
                )}
                <div className="text-6xl font-bold text-accent-primary animate-pulse">{countdown}</div>
                <p className="text-text-secondary">Battle starts in {countdown}s...</p>
            </div>
        );
    }

    if (searching) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-bg-surface rounded-2xl p-10 border border-accent-primary/30 shadow-2xl text-center max-w-sm w-full">
                    <div className="relative w-24 h-24 mx-auto mb-6">
                        <div className="absolute inset-0 rounded-full bg-accent-primary/10 animate-ping" />
                        <div className="absolute inset-3 rounded-full bg-accent-primary/20 animate-ping" style={{ animationDelay: '0.5s' }} />
                        <div className="absolute inset-0 flex items-center justify-center text-3xl">⚔️</div>
                    </div>
                    <p className="text-text-primary font-semibold mb-1">Searching for opponent...</p>
                    <p className="text-text-secondary text-sm mb-6">{searchTime}s elapsed</p>
                    <button onClick={handleCancel} className="w-full py-2.5 rounded-xl border border-red-400/40 text-red-500 hover:bg-red-500/10 transition-colors font-medium">
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 max-w-6xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-accent-primary flex items-center justify-center gap-3">
                    <span className="text-3xl">⚔️</span> Battle Arena
                </h1>
                <p className="text-text-secondary mt-2">Choose a topic and challenge an opponent</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {TOPICS.map(t => (
                    <button
                        key={t.id}
                        onClick={() => t.ready && handleTopicSelect(t.id)}
                        disabled={!t.ready}
                        className={`relative p-5 rounded-xl border transition-all duration-200 text-left ${t.ready ? 'border-accent-primary/30 bg-bg-surface hover:border-accent-primary hover:shadow-lg cursor-pointer' : 'border-border-default bg-bg-surface/50 opacity-50 cursor-not-allowed'}`}
                    >
                        <div className="text-3xl mb-2">{t.icon}</div>
                        <div className="font-semibold text-text-primary text-sm">{t.name}</div>
                        <div className="mt-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.ready ? 'bg-accent-primary/20 text-accent-primary' : 'bg-bg-surface-2 text-text-secondary'}`}>
                                {t.ready ? 'Ready' : 'Coming Soon'}
                            </span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
