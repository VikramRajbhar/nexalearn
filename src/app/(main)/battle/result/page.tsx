'use client';

import { useRouter } from 'next/navigation';
import { useBattleStore } from '@/store/battleStore';

export default function BattleResultPage() {
    const router = useRouter();
    const { battleResult, myAnswers, resetBattle, newAchievements } = useBattleStore();

    if (!battleResult) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-text-secondary">No battle results found.</p>
                    <button
                        onClick={() => router.push('/battle')}
                        className="mt-4 px-6 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary-hover"
                    >
                        Back to Arena
                    </button>
                </div>
            </div>
        );
    }

    const { winner, player1, player2, xpEarned } = battleResult;
    const isWin = winner === player1.userId;
    const isDraw = winner === 'draw';

    const handleNewBattle = () => {
        resetBattle();
        router.push('/battle');
    };

    return (
        <div className="min-h-screen p-6 flex flex-col items-center justify-center">
            {/* Victory/Defeat Title */}
            <div className="text-center mb-8">
                <div className={`text-5xl font-bold mb-2 ${isDraw ? 'text-yellow-500' : isWin ? 'text-accent-primary' : 'text-red-400'
                    }`}>
                    {isDraw ? '⚖️ Draw!' : isWin ? '🏆 Victory!' : '💪 Defeated'}
                </div>
                <p className="text-text-secondary">
                    {isDraw ? 'A well-fought match!' : isWin ? 'Congratulations!' : 'Better luck next time!'}
                </p>
            </div>

            {/* Score Comparison */}
            <div className="w-full max-w-md bg-bg-surface rounded-2xl border border-border-default p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div className="text-center">
                        <p className="text-sm text-text-secondary">{player1.username}</p>
                        <p className="text-4xl font-bold text-accent-primary">{player1.score}</p>
                        <p className="text-xs text-text-secondary">{player1.correctAnswers}/10 correct</p>
                    </div>

                    <div className="text-2xl text-text-secondary">vs</div>

                    <div className="text-center">
                        <p className="text-sm text-text-secondary">{player2.username}</p>
                        <p className="text-4xl font-bold text-orange-500">{player2.score}</p>
                        <p className="text-xs text-text-secondary">{player2.correctAnswers}/10 correct</p>
                    </div>
                </div>
            </div>

            {/* XP Badge */}
            <div className="bg-yellow-500/20 border border-yellow-500/40 rounded-xl px-6 py-3 mb-4">
                <span className="text-yellow-600 font-bold text-lg">
                    +{xpEarned.player1} XP Earned
                </span>
            </div>

            {/* Achievements Unlocked */}
            {newAchievements && newAchievements.length > 0 && (
                <div className="w-full max-w-md mb-6 space-y-3">
                    <h3 className="font-bold text-yellow-500 text-center uppercase tracking-widest text-sm mb-2">
                        Achievements Unlocked
                    </h3>
                    {newAchievements.map((ach) => (
                        <div key={ach.id} className="flex items-center gap-3 bg-bg-surface-2 border border-yellow-500/30 p-3 rounded-xl animate-in slide-in-from-bottom flex-wrap sm:flex-nowrap shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                            <div className="text-3xl shrink-0">{ach.icon}</div>
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-white text-sm truncate">{ach.name}</div>
                                <div className="text-xs text-text-secondary truncate">{ach.description}</div>
                            </div>
                            <div className="text-xs font-bold text-yellow-400 shrink-0">
                                +{ach.xpReward} XP
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Question Breakdown */}
            <div className="w-full max-w-md bg-bg-surface rounded-2xl border border-border-default p-4 mb-6">
                <h3 className="font-semibold text-text-primary mb-3">Question Breakdown</h3>
                <div className="flex gap-2 flex-wrap">
                    {myAnswers.map((result, i) => (
                        <div
                            key={i}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white ${result.isCorrect ? 'bg-green-500' : 'bg-red-500'
                                }`}
                        >
                            {i + 1}
                        </div>
                    ))}
                    {Array.from({ length: 10 - myAnswers.length }, (_, i) => (
                        <div key={`empty-${i}`} className="w-8 h-8 rounded-lg bg-bg-surface-2 flex items-center justify-center text-xs text-text-muted">
                            {myAnswers.length + i + 1}
                        </div>
                    ))}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 w-full max-w-md">
                <button
                    onClick={handleNewBattle}
                    className="flex-1 py-3 rounded-xl bg-accent-primary text-black font-semibold hover:bg-accent-primary-hover transition-colors shadow-[0_0_20px_rgba(108,99,255,0.4)]"
                >
                    ⚔️ New Battle
                </button>
                <button
                    onClick={() => router.push('/leaderboard')}
                    className="flex-1 py-3 rounded-xl border border-border-default text-text-primary font-semibold hover:bg-bg-surface-2 transition-colors"
                >
                    🏆 Leaderboard
                </button>
            </div>
        </div>
    );
}
