'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSocket, getStableUserId, getStableUsername } from '@/lib/socket-client';
import { useUserStore } from '@/store/userStore';
import { useBattleStore } from '@/store/battleStore';

interface Question {
    id: string;
    question: string;
    options: string[];
}

export default function BattleRoomPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useUserStore();
    const { setBattleEnd, setAnswerResult: setGlobalAnswerResult, setNewAchievements } = useBattleStore();
    const roomId = params.roomId as string;
    const [userId, setUserId] = useState('');
    const [username, setUsername] = useState('');
    const [topic, setTopic] = useState('');

    useEffect(() => {
        setUserId(user?.id || getStableUserId());
        setUsername(user?.username || getStableUsername());
        setTopic(localStorage.getItem('battleTopic') || 'DSA');
    }, [user]);

    const [status, setStatus] = useState<'joining' | 'countdown' | 'active' | 'ended'>('joining');
    const [countdown, setCountdown] = useState(3);
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(15);

    const [myScore, setMyScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [answerSubmitted, setAnswerSubmitted] = useState(false);
    const [answerResult, setAnswerResult] = useState<any>(null);
    const [opponentAnswered, setOpponentAnswered] = useState(false);
    const [battleResult, setBattleResult] = useState<any>(null);

    // Timer effect for active question
    useEffect(() => {
        if (status !== 'active') return;
        const interval = setInterval(() => {
            setTimeRemaining(prev => Math.max(0, prev - 1));
        }, 1000);
        return () => clearInterval(interval);
    }, [status, questionIndex]);

    useEffect(() => {
        if (!roomId || !userId || !topic) return;

        const socket = getSocket();

        console.log('Joining battle room:', roomId, 'with topic:', topic);

        // Emit battle:join immediately on mount
        socket.emit('battle:join', {
            roomId: roomId,
            userId: userId,
            username: username,
            topic: topic
        });

        // Listen for battle countdown
        socket.on('battle:countdown', (data: { seconds: number }) => {
            console.log('Countdown:', data.seconds);
            setCountdown(data.seconds);
            setStatus('countdown');
        });

        // Listen for battle start
        socket.on('battle:start', (data: {
            question: Question,
            questionIndex: number,
            totalQuestions: number
        }) => {
            console.log('Battle started! First question:', data);
            setCurrentQuestion(data.question);
            setQuestionIndex(data.questionIndex);
            setStatus('active');
            setTimeRemaining(15);
            setSelectedAnswer(null);
            setAnswerSubmitted(false);
            setAnswerResult(null);
            setOpponentAnswered(false);
        });

        // Listen for battle resume
        socket.on('battle:resume', (data: {
            question: Question,
            questionIndex: number,
            totalQuestions: number,
            topic: string,
            scores: Record<string, number>,
            timeRemaining: number,
            opponentAnswered: boolean
        }) => {
            console.log('Resuming active battle:', data);
            setCurrentQuestion(data.question);
            setQuestionIndex(data.questionIndex);
            setStatus('active');
            setTimeRemaining(data.timeRemaining);
            setSelectedAnswer(null);
            setAnswerSubmitted(false);
            setAnswerResult(null);
            setOpponentAnswered(data.opponentAnswered);

            if (data.scores && data.scores[userId]) {
                setMyScore(data.scores[userId]);
            }
        });

        // Listen for next question
        socket.on('battle:next_question', (data: {
            question: Question,
            questionIndex: number
        }) => {
            console.log('Next question:', data.questionIndex);
            setCurrentQuestion(data.question);
            setQuestionIndex(data.questionIndex);
            setSelectedAnswer(null);
            setAnswerSubmitted(false);
            setAnswerResult(null);
            setOpponentAnswered(false);
            setTimeRemaining(15);
        });

        // Listen for answer result
        socket.on('battle:answer_result', (data: {
            isCorrect: boolean,
            pointsEarned: number,
            correctIndex: number,
            explanation: string
        }) => {
            console.log('Answer result:', data);
            setAnswerResult(data);
            setGlobalAnswerResult(data);
            setMyScore(prev => prev + data.pointsEarned);
        });

        // Listen for opponent answered
        socket.on('battle:opponent_answered', () => {
            setOpponentAnswered(true);
        });

        // Listen for battle end
        socket.on('battle:end', (data: any) => {
            console.log('Battle ended:', data);
            setBattleResult(data);
            setBattleEnd(data);
            if (data.newAchievements) {
                setNewAchievements(data.newAchievements);
            }
            setStatus('ended');
            // Redirect to result page after 4 seconds
            setTimeout(() => {
                router.push(`/battle/result`);
            }, 4000);
        });

        socket.on('battle:timeout', (data: any) => {
            console.log('Battle timeout:', data);
            setTimeRemaining(0);
        });

        return () => {
            socket.off('battle:countdown');
            socket.off('battle:start');
            socket.off('battle:resume');
            socket.off('battle:next_question');
            socket.off('battle:answer_result');
            socket.off('battle:opponent_answered');
            socket.off('battle:end');
            socket.off('battle:timeout');
        };
    }, [roomId, userId, username, router]);

    const handleAnswer = (index: number) => {
        if (answerSubmitted || !userId) return;

        setSelectedAnswer(index);
        setAnswerSubmitted(true);

        const socket = getSocket();
        socket.emit('battle:answer', {
            roomId,
            userId: userId,
            questionIndex,
            answerIndex: index,
            timeTakenMs: (15 - timeRemaining) * 1000 // Approximate
        });
    };

    if (!userId) return null;

    if (status === 'joining') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-accent-primary text-xl">Connecting to battle...</div>
            </div>
        );
    }

    if (status === 'countdown') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-text-secondary text-lg mb-4">Battle starting in</p>
                    <div className="text-8xl font-bold text-accent-primary">
                        {countdown}
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'ended' && battleResult) {
        const isWinner = battleResult.winner === userId;
        const isDraw = battleResult.winner === 'draw';

        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="text-center">
                    <div className="text-6xl mb-4">{isDraw ? '🤝' : isWinner ? '🏆' : '💀'}</div>
                    <h2 className="text-4xl font-bold text-accent-primary mb-6">
                        {isDraw ? 'It\'s a Draw!' : isWinner ? 'You Won!' : 'You Lost!'}
                    </h2>
                    <div className="text-2xl text-text-secondary">
                        Your Score: {battleResult.scores?.[userId] || 0}
                    </div>
                    <p className="mt-4 text-text-secondary">Redirecting...</p>
                </div>
            </div>
        );
    }

    if (!currentQuestion || status !== 'active') return <div className="text-center p-10">Loading question...</div>;

    const getOptionStyle = (idx: number) => {
        if (!answerSubmitted && selectedAnswer === null)
            return 'border-border-default hover:border-accent-primary cursor-pointer hover:bg-bg-surface-2';

        if (answerResult) {
            if (idx === answerResult.correctIndex) return 'border-green-500 bg-green-500/20 text-green-500 font-bold';
            if (idx === selectedAnswer && !answerResult.isCorrect) return 'border-red-500 bg-red-500/20 text-red-500 font-bold';
        } else if (idx === selectedAnswer) {
            return 'border-accent-primary bg-accent-primary/20';
        }
        return 'border-border-default opacity-50 cursor-not-allowed';
    };

    return (
        <div className="min-h-screen max-w-2xl mx-auto p-4 flex flex-col">
            {/* Top Bar */}
            <div className="flex justify-between items-center bg-bg-surface p-4 rounded-xl border border-border-default mb-6">
                <div className="text-left bg-accent-primary/10 px-4 py-2 rounded-lg">
                    <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Score</p>
                    <p className="text-2xl font-bold text-accent-primary">{myScore}</p>
                </div>

                <div className="text-center flex flex-col items-center">
                    <p className="text-sm font-semibold text-text-secondary mb-1">Q {questionIndex + 1}</p>
                    <div className={`text-3xl font-bold ${timeRemaining <= 5 ? 'text-red-500 animate-pulse' : 'text-accent-primary'}`}>
                        {timeRemaining}s
                    </div>
                </div>

                <div className="text-right">
                    {opponentAnswered ? (
                        <div className="text-sm font-semibold text-green-500 bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20">
                            Opponent Ready
                        </div>
                    ) : (
                        <div className="text-sm text-text-secondary">
                            Opponent thinking...
                        </div>
                    )}
                </div>
            </div>

            {/* Question */}
            <div className="bg-bg-surface rounded-2xl p-6 md:p-8 border border-border-default mb-6 shadow-sm">
                <h2 className="text-xl md:text-2xl font-semibold text-text-primary leading-relaxed">
                    {currentQuestion.question}
                </h2>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {currentQuestion.options.map((opt, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleAnswer(idx)}
                        disabled={answerSubmitted}
                        className={`p-5 rounded-xl border-2 text-left transition-all duration-200 flex items-start gap-4 ${getOptionStyle(idx)}`}
                    >
                        <span className="flex-shrink-0 w-8 h-8 rounded-full border border-current flex items-center justify-center font-bold text-sm">
                            {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-text-primary font-medium leading-relaxed pt-1">
                            {opt}
                        </span>
                    </button>
                ))}
            </div>

            {/* Result feedback */}
            {answerResult && (
                <div className={`p-5 rounded-xl border ${answerResult.isCorrect ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'} animate-in slide-in-from-bottom-4`}>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className={`text-xl font-bold ${answerResult.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                            {answerResult.isCorrect ? `Correct! +${answerResult.pointsEarned}` : 'Incorrect'}
                        </h3>
                    </div>
                    {answerResult.explanation && (
                        <p className="text-text-secondary text-sm leading-relaxed mt-2 pt-2 border-t border-border-default">
                            <span className="font-semibold block mb-1">Explanation:</span>
                            {answerResult.explanation}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
