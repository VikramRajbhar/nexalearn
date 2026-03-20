import { NextResponse } from 'next/server';
import { getTopicLeaderboard } from '@/lib/leaderboard';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, props: { params: Promise<{ topic: string }> }) {
    const params = await props.params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const decodedTopic = decodeURIComponent(params.topic);

    try {
        const data = await getTopicLeaderboard(decodedTopic, limit);
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch topic leaderboard' }, { status: 500 });
    }
}
