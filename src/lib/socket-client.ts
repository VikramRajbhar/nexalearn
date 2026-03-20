'use client';

import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

// Stable userId persisted in sessionStorage so it survives page navigation
export function getStableUserId(): string {
    if (typeof window === 'undefined') return 'ssr';
    let uid = sessionStorage.getItem('nexalearn_uid');
    if (!uid) {
        uid = `player_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        sessionStorage.setItem('nexalearn_uid', uid);
    }
    return uid;
}

export function getStableUsername(): string {
    if (typeof window === 'undefined') return 'Player';
    let name = sessionStorage.getItem('nexalearn_username');
    if (!name) {
        name = `Player_${Math.random().toString(36).slice(2, 6)}`;
        sessionStorage.setItem('nexalearn_username', name);
    }
    return name;
}

export function getSocket(): Socket {
    if (!socket) {
        const url = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        socket = io(url, {
            transports: ['websocket', 'polling'],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 500,
        });

        socket.on('connect', () => {
            console.log('[Socket] Connected, id:', socket?.id);
            // Re-register stable userId after reconnect
            const uid = getStableUserId();
            socket?.emit('register', { userId: uid });
        });

        socket.on('disconnect', (reason) => {
            console.log('[Socket] Disconnected:', reason);
        });

        socket.on('connect_error', (error) => {
            console.error('[Socket] Connection error:', error.message);
        });
    }
    return socket;
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}
