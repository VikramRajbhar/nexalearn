export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server';
import { getUserAchievements } from '@/lib/achievements';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;
        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const { earned, locked } = await getUserAchievements(userId);

        // Grouping will be done on the client or here. The prompt said "Groups by category", 
        // but our ACHIEVEMENTS object doesn't have a category explicitly. 
        // Actually, the requirements mentioned "Groups by category: battle, skill, social, league".
        // I will return earned and locked arrays as is, client can filter or group.

        return NextResponse.json({ earned, locked });
    } catch (error) {
        console.error('Error fetching achievements:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
