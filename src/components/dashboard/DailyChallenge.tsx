'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, Star } from 'lucide-react';

const ROTATING_TOPICS = ['DSA', 'JavaScript', 'SQL'];

export function DailyChallenge() {
    const router = useRouter();
    const [completed, setCompleted] = useState(false);
    const [todayTopic, setTodayTopic] = useState('DSA');

    useEffect(() => {
        // Set today's rotating topic based on the day of the year
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);

        const topicIndex = dayOfYear % ROTATING_TOPICS.length;
        const topic = ROTATING_TOPICS[topicIndex];
        setTodayTopic(topic);

        // Check completion status in localStorage for today's date
        const dateKey = now.toISOString().split('T')[0]; // YYYY-MM-DD format
        const challengeKey = `daily_challenge_${dateKey}`;
        const isCompleted = localStorage.getItem(challengeKey) === 'true';
        setCompleted(isCompleted);

        // We'll trust that the battle end flow or some other logic eventually sets this to true if they played.
        // Since the spec doesn't explicitly mention hooking this up to the battle DB here, we rely on local caching.
    }, []);

    const handleAccept = () => {
        localStorage.setItem('battleTopic', todayTopic);
        router.push('/battle');
    };

    // Using subtle matrix-style pattern via background styles
    return (
        <Card className="relative overflow-hidden bg-primary/10 border-primary/30">
            {/* Subtle background matrix-like stripes */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(0deg, #00FF41 1px, transparent 1px)', backgroundSize: '100% 4px' }}
            />
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary drop-shadow-md">
                    <Star className="w-5 h-5 fill-primary" />
                    Daily Challenge
                </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
                <div className="mb-4">
                    <p className="text-text font-semibold text-lg leading-tight">
                        Win a battle in <span className="text-primary">{todayTopic}</span>
                    </p>
                    <p className="text-sm text-text-secondary mt-1">
                        Reward: <span className="text-[#FFD700] font-bold">+50 Bonus XP</span>
                    </p>
                </div>

                {completed ? (
                    <div className="flex items-center justify-center p-3 bg-green-500/20 border border-green-500/40 rounded-xl text-green-500 font-bold gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        Completed!
                    </div>
                ) : (
                    <Button
                        onClick={handleAccept}
                        className="w-full font-bold shadow-[0_0_15px_rgba(0,255,65,0.3)] hover:shadow-[0_0_25px_rgba(0,255,65,0.5)] transition-all"
                    >
                        Accept Challenge
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
