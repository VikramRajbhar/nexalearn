'use client';

import { useEffect, useCallback, useRef } from 'react';
import { getSocket, disconnectSocket } from '@/lib/socket-client';
import { useBattleStore } from '@/store/battleStore';
import type { Socket } from 'socket.io-client';

export function useBattle() {
    const store = useBattleStore();
    const socketRef = useRef<Socket | null>(null);
    const answerTimeRef = useRef<number>(Date.now());

    useEffect(() => {
        const socket = getSocket();
        socketRef.current = socket;

        socket.on('connect', () => store.setConnectionStatus('connected'));
        socket.on('disconnect', () => store.setConnectionStatus('disconnected'));
        socket.on('reconnect', () => store.setConnectionStatus('connected'));

        socket.on('matchmaking:searching', () => { });

        socket.on('matchmaking:found', (data: { roomId: string; opponent: any; topic: string }) => {
            store.setBattleFound(data.roomId, data.opponent, data.topic);
        });

        socket.on('matchmaking:timeout', () => {
            store.resetBattle();
        });

        socket.on('battle:countdown', (data: { seconds: number }) => {
            store.setCountdown(data.seconds);
        });

        socket.on('battle:question', (data: any) => {
            answerTimeRef.current = Date.now();
            store.setQuestion(data.question, data.index, data.total, data.player1Score, data.player2Score);
        });

        socket.on('battle:answer_result', (data: any) => {
            store.setAnswerResult(data);
        });

        socket.on('battle:opponent_answered', () => {
            store.setOpponentAnswered();
        });

        socket.on('battle:timeout', () => {
            // Handled by answer_result
        });

        socket.on('battle:end', (data: any) => {
            store.setBattleEnd(data);
        });

        socket.on('battle:opponent_disconnected', () => { });

        socket.on('battle:error', (data: { message: string }) => {
            console.error('[Battle Error]', data.message);
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('reconnect');
            socket.off('matchmaking:searching');
            socket.off('matchmaking:found');
            socket.off('matchmaking:timeout');
            socket.off('battle:countdown');
            socket.off('battle:question');
            socket.off('battle:answer_result');
            socket.off('battle:opponent_answered');
            socket.off('battle:timeout');
            socket.off('battle:end');
            socket.off('battle:opponent_disconnected');
            socket.off('battle:error');
        };
    }, []);

    const joinMatchmaking = useCallback((userId: string, username: string, topic: string, skillScore: number) => {
        store.setSearching(topic);
        socketRef.current?.emit('matchmaking:join', { userId, username, topic, skillScore });
    }, []);

    const cancelMatchmaking = useCallback((userId: string) => {
        socketRef.current?.emit('matchmaking:cancel', { userId });
        store.resetBattle();
    }, []);

    const joinBattle = useCallback((roomId: string, userId: string) => {
        socketRef.current?.emit('battle:join', { roomId, userId });
    }, []);

    const submitAnswer = useCallback((roomId: string, userId: string, questionIndex: number, answerIndex: number) => {
        const timeTakenMs = Date.now() - answerTimeRef.current;
        socketRef.current?.emit('battle:answer', { roomId, userId, questionIndex, answerIndex, timeTakenMs });
    }, []);

    const forfeitBattle = useCallback((roomId: string, userId: string) => {
        socketRef.current?.emit('battle:forfeit', { roomId, userId });
    }, []);

    return {
        ...store,
        joinMatchmaking,
        cancelMatchmaking,
        joinBattle,
        submitAnswer,
        forfeitBattle,
        disconnectSocket,
    };
}
