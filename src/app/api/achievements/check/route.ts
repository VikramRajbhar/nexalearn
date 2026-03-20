export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server';
import { checkAndAwardAchievements } from '@/lib/achievements';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, triggerData } = body;

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const newlyEarned = await checkAndAwardAchievements(userId, triggerData || {});
        return NextResponse.json({ achievements: newlyEarned });
    } catch (error) {
        console.error('Error checking achievements:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
