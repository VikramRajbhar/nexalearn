import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
    const sessionToken = req.cookies.get('session_token')?.value

    // Delete session from database
    if (sessionToken) {
        await supabaseAdmin
            .from('auth_sessions')
            .delete()
            .eq('token', sessionToken)
    }

    // Clear all auth cookies
    const response = NextResponse.json({ success: true })
    response.cookies.set('session_token', '', { path: '/', maxAge: 0 })
    response.cookies.set('user_info', '', { path: '/', maxAge: 0 })
    response.cookies.set('oauth_state', '', { path: '/', maxAge: 0 })
    response.cookies.set('better-auth.session_token', '', { path: '/', maxAge: 0 })

    return response
}
