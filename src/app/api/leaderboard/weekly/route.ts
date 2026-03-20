import { NextResponse } from 'next/server';
import { getWeeklyLeaderboard } from '@/lib/leaderboard';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    try {
        const data = await getWeeklyLeaderboard(limit);
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch weekly leaderboard' }, { status: 500 });
    }
}
