"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { TOPICS } from '@/lib/question-engine';

interface Question {
    id: string;
    topic: string;
    difficulty: number;
    question: string;
    options: string[];
    correct_index: number;
    explanation: string;
}

export default function QuestionsPreview() {
    const [topic, setTopic] = useState('DSA');
    const [difficulty, setDifficulty] = useState(1);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(false);

    // Quiz state
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [quizFinished, setQuizFinished] = useState(false);

    const loadQuestions = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/questions/${topic}?difficulty=${difficulty}&count=5`);
            const data = await res.json();
            // Ensure correct_index is always a number
            const parsed = data.map((q: any) => ({
                ...q,
                correct_index: parseInt(String(q.correct_index), 10),
            }));
            setQuestions(parsed);
            // Reset quiz state
            setCurrentIndex(0);
            setSelectedAnswer(null);
            setHasAnswered(false);
            setScore(0);
            setQuizFinished(false);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (answerIndex: number) => {
        if (hasAnswered) return;
        setSelectedAnswer(answerIndex);
        setHasAnswered(true);

        const currentQ = questions[currentIndex];
        if (answerIndex === currentQ.correct_index) {
            setScore(prev => prev + 1);
        }
    };

    const handleNextQuestion = () => {
        if (currentIndex + 1 >= questions.length) {
            setQuizFinished(true);
        } else {
            setCurrentIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setHasAnswered(false);
        }
    };

    const handleRetry = () => {
        setCurrentIndex(0);
        setSelectedAnswer(null);
        setHasAnswered(false);
        setScore(0);
        setQuizFinished(false);
    };

    const currentQuestion = questions[currentIndex];

    const getButtonStyle = (idx: number) => {
        if (!hasAnswered) {
            return "border-border-default bg-bg-surface hover:border-accent-primary hover:bg-accent-primary/5 cursor-pointer";
        }
        const isCorrectOption = idx === currentQuestion.correct_index;
        const isSelectedOption = idx === selectedAnswer;

        if (isCorrectOption) {
            return "border-[#22c55e] bg-[#22c55e] text-white font-bold cursor-default";
        }
        if (isSelectedOption && !isCorrectOption) {
            return "border-[#ef4444] bg-[#ef4444] text-white font-bold cursor-default";
        }
        return "border-border-default bg-bg-surface/50 opacity-40 cursor-default";
    };

    const getIcon = (idx: number) => {
        if (!hasAnswered) return null;
        if (idx === currentQuestion.correct_index) return "✓";
        if (idx === selectedAnswer && idx !== currentQuestion.correct_index) return "✗";
        return null;
    };

    return (
        <div className="min-h-screen bg-background p-8 font-sans">
            <div className="max-w-3xl mx-auto space-y-8">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-accent-primary/20 pb-6">
                    <div>
                        <h1 className="text-4xl font-grotesk font-bold text-text">
                            Question <span className="text-accent-primary">Engine</span> Preview
                        </h1>
                        <p className="text-text-secondary mt-1">Verify AI-generated question quality and feedback.</p>
                    </div>

                    <div className="flex flex-wrap gap-4 items-center">
                        <select
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="bg-bg-surface border border-border-default p-2 rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
                        >
                            {Object.keys(TOPICS).map(t => (
                                <option key={t} value={t}>{TOPICS[t].name}</option>
                            ))}
                        </select>

                        <select
                            value={difficulty}
                            onChange={(e) => setDifficulty(parseInt(e.target.value))}
                            className="bg-bg-surface border border-border-default p-2 rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
                        >
                            {[1, 2, 3].map(d => (
                                <option key={d} value={d}>Diff {d}</option>
                            ))}
                        </select>

                        <button
                            onClick={loadQuestions}
                            disabled={loading}
                            className="bg-accent-primary hover:bg-accent-primary-hover text-black font-bold px-6 py-2 rounded-lg transition-all shadow-matrix-glow disabled:opacity-50"
                        >
                            {loading ? "Loading..." : "Load Questions"}
                        </button>
                    </div>
                </header>

                <main>
                    {/* Empty state */}
                    {questions.length === 0 && !loading && (
                        <div className="text-center py-20 border-2 border-dashed border-accent-primary/20 rounded-2xl bg-bg-surface-2/50 text-text-secondary">
                            No questions loaded. Select topic and click Load.
                        </div>
                    )}

                    {/* Summary card */}
                    {quizFinished && (
                        <div className="text-center py-12 space-y-6">
                            <div className="inline-block bg-bg-surface border-2 border-accent-primary/30 rounded-2xl p-8 shadow-lg">
                                <div className="text-5xl mb-4">{score >= 4 ? '🏆' : score >= 2 ? '👍' : '💪'}</div>
                                <h2 className="text-3xl font-bold text-text mb-2">
                                    You got <span className="text-accent-primary">{score}/{questions.length}</span> correct
                                </h2>
                                <p className="text-text-secondary mb-6">
                                    {score === questions.length ? 'Perfect score!' : score >= 3 ? 'Great job!' : 'Keep practicing!'}
                                </p>
                                <div className="flex gap-3 justify-center">
                                    <button
                                        onClick={handleRetry}
                                        className="bg-accent-primary hover:bg-accent-primary-hover text-black font-bold px-6 py-2.5 rounded-lg transition-all"
                                    >
                                        🔄 Retry Same Set
                                    </button>
                                    <button
                                        onClick={loadQuestions}
                                        className="border-2 border-accent-primary/30 text-text font-bold px-6 py-2.5 rounded-lg hover:bg-accent-primary/5 transition-all"
                                    >
                                        🔀 New Questions
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Active question */}
                    {questions.length > 0 && !quizFinished && currentQuestion && (
                        <div className="space-y-6">
                            {/* Progress bar */}
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-sm text-text-secondary font-medium">
                                    Question {currentIndex + 1} of {questions.length}
                                </span>
                                <div className="flex-1 h-2 bg-bg-surface-2 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-accent-primary rounded-full transition-all duration-500"
                                        style={{ width: `${((currentIndex + (hasAnswered ? 1 : 0)) / questions.length) * 100}%` }}
                                    />
                                </div>
                                <span className="text-sm text-accent-primary font-bold">{score} pts</span>
                            </div>

                            {/* Progress dots */}
                            <div className="flex gap-2 justify-center">
                                {questions.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-3 h-3 rounded-full transition-all ${i < currentIndex ? 'bg-accent-primary' :
                                            i === currentIndex ? 'bg-accent-primary ring-2 ring-accent-primary/40 ring-offset-2 ring-offset-background' :
                                                'bg-bg-surface-2 border border-border-default'
                                            }`}
                                    />
                                ))}
                            </div>

                            <Card className="overflow-hidden border-2 border-accent-primary/10 shadow-sm">
                                <CardHeader className="bg-bg-surface-2/50 border-b border-accent-primary/5">
                                    <div className="flex justify-between items-start gap-4">
                                        <CardTitle className="text-xl leading-relaxed">{currentQuestion.question}</CardTitle>
                                        <div className="flex gap-2">
                                            <span className="bg-accent-primary/20 text-accent-primary text-xs font-bold px-2 py-1 rounded">
                                                {'★'.repeat(currentQuestion.difficulty)}{'☆'.repeat(3 - currentQuestion.difficulty)}
                                            </span>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="pt-6 space-y-3">
                                    {currentQuestion.options.map((opt: string, i: number) => {
                                        const icon = getIcon(i);
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => handleAnswer(i)}
                                                disabled={hasAnswered}
                                                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-3 ${getButtonStyle(i)}`}
                                            >
                                                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 ${hasAnswered && i === currentQuestion.correct_index
                                                    ? 'bg-white/30 text-white'
                                                    : hasAnswered && i === selectedAnswer
                                                        ? 'bg-white/30 text-white'
                                                        : 'bg-accent-primary/10 border border-accent-primary/20 text-accent-primary'
                                                    }`}>
                                                    {icon || String.fromCharCode(65 + i)}
                                                </span>
                                                <span className="flex-1">{opt}</span>
                                            </button>
                                        );
                                    })}
                                </CardContent>

                                {/* Result badge + explanation */}
                                {hasAnswered && (
                                    <CardFooter className="flex-col items-start border-t border-accent-primary/10 p-6 space-y-4" style={{ animation: 'fadeIn 0.4s ease-out' }}>
                                        {/* Result badge */}
                                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm ${selectedAnswer === currentQuestion.correct_index
                                            ? 'bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30'
                                            : 'bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/30'
                                            }`}>
                                            {selectedAnswer === currentQuestion.correct_index
                                                ? '✓ Correct! +10 pts'
                                                : '✗ Wrong!'}
                                        </div>

                                        {/* Explanation */}
                                        {currentQuestion.explanation && (
                                            <div className="w-full bg-accent-primary/5 rounded-xl p-4 border border-accent-primary/10">
                                                <p className="text-accent-primary font-bold text-sm mb-1">Explanation:</p>
                                                <p className="text-text text-sm leading-relaxed">
                                                    {currentQuestion.explanation}
                                                </p>
                                            </div>
                                        )}

                                        {/* Next question button */}
                                        <button
                                            onClick={handleNextQuestion}
                                            className="self-end bg-accent-primary hover:bg-accent-primary-hover text-black font-bold px-6 py-2.5 rounded-lg transition-all shadow-matrix-glow"
                                        >
                                            {currentIndex + 1 >= questions.length ? 'See Results →' : 'Next Question →'}
                                        </button>
                                    </CardFooter>
                                )}
                            </Card>
                        </div>
                    )}
                </main>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
