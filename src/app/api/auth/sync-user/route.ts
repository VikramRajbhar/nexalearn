export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: req.headers
        })

        if (!session?.user) {
            return Response.json(
                { error: 'No session' },
                { status: 401 }
            )
        }

        const { user } = session

        // Check if user exists in our table
        const { data: existing } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('auth_id', user.id)
            .single()

        if (!existing) {
            // Create user in our custom table
            const username = user.name
                ?.toLowerCase()
                .replace(/\s+/g, '_')
                .replace(/[^a-z0-9_]/g, '')
                + '_' + Date.now().toString().slice(-4)
                || `user_${Date.now()}`

            await supabaseAdmin
                .from('users')
                .insert({
                    auth_id: user.id,
                    username,
                    email: user.email,
                    college: '',
                    semester: 1,
                    avatar_url: user.image || null,
                    total_xp: 0,
                    league: 'Bronze',
                    battles_played: 0,
                    battles_won: 0,
                })
        }

        return Response.json({ success: true })

    } catch (error) {
        console.error('Sync user error:', error)
        return Response.json(
            { error: 'Failed to sync user' },
            { status: 500 }
        )
    }
}
