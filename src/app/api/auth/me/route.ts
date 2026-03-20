import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
    try {
        const sessionToken = req.cookies.get('session_token')?.value

        if (!sessionToken) {
            return NextResponse.json({ user: null }, { status: 401 })
        }

        // Look up session in our auth_sessions table
        const { data: session, error: sessionError } = await supabaseAdmin
            .from('auth_sessions')
            .select('*')
            .eq('token', sessionToken)
            .gte('expires_at', new Date().toISOString())
            .single()

        if (sessionError || !session) {
            return NextResponse.json({ user: null }, { status: 401 })
        }

        // Get the user data
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', session.user_id)
            .single()

        if (userError || !user) {
            return NextResponse.json({ user: null }, { status: 401 })
        }

        return NextResponse.json({ user })

    } catch (error) {
        console.error('Auth /me error:', error)
        return NextResponse.json({ user: null }, { status: 500 })
    }
}
