'use client';

import { create } from 'zustand';
import type { AchievementDef } from '@/lib/achievements';

export interface BattleOpponent {
    userId: string;
    username: string;
    skillScore: number;
}

export interface BattleQuestionData {
    id: string;
    topic: string;
    difficulty: number;
    question: string;
    options: string[];
}

export interface AnswerResult {
    isCorrect: boolean;
    pointsEarned: number;
    correctIndex: number;
    explanation: string;
}

export interface BattleEndData {
    winner: string;
    player1: { userId: string; username: string; score: number; correctAnswers: number };
    player2: { userId: string; username: string; score: number; correctAnswers: number };
    xpEarned: { player1: number; player2: number };
}

interface BattleState {
    roomId: string | null;
    status: 'idle' | 'searching' | 'countdown' | 'active' | 'ended';
    opponent: BattleOpponent | null;
    topic: string | null;
    currentQuestion: BattleQuestionData | null;
    questionIndex: number;
    totalQuestions: number;
    myScore: number;
    opponentScore: number;
    myAnswers: AnswerResult[];
    opponentAnswered: boolean;
    lastResult: AnswerResult | null;
    countdownSeconds: number;
    battleResult: BattleEndData | null;
    newAchievements: AchievementDef[];
    connectionStatus: 'connected' | 'disconnected' | 'reconnecting';

    setSearching: (topic: string) => void;
    setBattleFound: (roomId: string, opponent: BattleOpponent, topic: string) => void;
    setCountdown: (seconds: number) => void;
    setQuestion: (question: BattleQuestionData, index: number, total: number, p1Score: number, p2Score: number) => void;
    setAnswerResult: (result: AnswerResult) => void;
    setOpponentAnswered: () => void;
    setBattleEnd: (result: BattleEndData) => void;
    setNewAchievements: (achievements: AchievementDef[]) => void;
    setConnectionStatus: (status: 'connected' | 'disconnected' | 'reconnecting') => void;
    resetBattle: () => void;
}

const initialState = {
    roomId: null,
    status: 'idle' as const,
    opponent: null,
    topic: null,
    currentQuestion: null,
    questionIndex: 0,
    totalQuestions: 10,
    myScore: 0,
    opponentScore: 0,
    myAnswers: [],
    opponentAnswered: false,
    lastResult: null,
    countdownSeconds: 0,
    battleResult: null,
    newAchievements: [],
    connectionStatus: 'connected' as const,
};

export const useBattleStore = create<BattleState>((set) => ({
    ...initialState,

    setSearching: (topic) => set({ status: 'searching', topic }),

    setBattleFound: (roomId, opponent, topic) => set({
        status: 'countdown', roomId, opponent, topic,
    }),

    setCountdown: (seconds) => set({ countdownSeconds: seconds, status: 'countdown' }),

    setQuestion: (question, index, total, p1Score, p2Score) => set((state) => ({
        currentQuestion: question,
        questionIndex: index,
        totalQuestions: total,
        status: 'active',
        opponentAnswered: false,
        lastResult: null,
        myScore: p1Score,
        opponentScore: p2Score,
    })),

    setAnswerResult: (result) => set((state) => ({
        lastResult: result,
        myAnswers: [...state.myAnswers, result],
        myScore: state.myScore + result.pointsEarned,
    })),

    setOpponentAnswered: () => set({ opponentAnswered: true }),

    setBattleEnd: (result) => set({ battleResult: result, status: 'ended' }),

    setNewAchievements: (achievements) => set({ newAchievements: achievements }),

    setConnectionStatus: (connectionStatus) => set({ connectionStatus }),

    resetBattle: () => set(initialState),
}));
