import { NextResponse } from 'next/server';
import { seedLeaderboardFromSupabase } from '@/lib/leaderboard';

export async function POST(request: Request) {
    try {
        const result = await seedLeaderboardFromSupabase();
        return NextResponse.json(result);
    } catch (error) {
        console.error('Seed error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
