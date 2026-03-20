export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server';
import { updateLeaderboard } from '@/lib/leaderboard';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, username, college, league, xpEarned, topic } = body;

        if (!userId || !username) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await updateLeaderboard(userId, username, college, league, xpEarned, topic);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Leaderboard update error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
