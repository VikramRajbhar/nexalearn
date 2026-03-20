import { NextResponse } from 'next/server';
import { getGlobalLeaderboard } from '@/lib/leaderboard';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    try {
        const data = await getGlobalLeaderboard(limit);
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
    }
}
