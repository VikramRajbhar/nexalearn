export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase-admin'

interface GoogleTokenResponse {
    access_token: string
    id_token: string
    token_type: string
    expires_in: number
    refresh_token?: string
}

interface GoogleUserInfo {
    sub: string
    name: string
    given_name: string
    family_name: string
    picture: string
    email: string
    email_verified: boolean
}

export async function GET(req: NextRequest) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || 'http://localhost:3000'
    try {
        const url = new URL(req.url)
        const code = url.searchParams.get('code')
        const state = url.searchParams.get('state')
        const storedState = req.cookies.get('oauth_state')?.value

        console.log('[OAuth Callback] code:', code ? 'present' : 'missing')
        console.log('[OAuth Callback] state:', state ? 'present' : 'missing')
        console.log('[OAuth Callback] storedState cookie:', storedState ? 'present' : 'missing')

        if (!code) {
            console.error('[OAuth Callback] No authorization code received')
            return NextResponse.redirect(new URL('/login?error=no_code', appUrl))
        }

        // Exchange code for tokens
        const baseURL = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: process.env.GOOGLE_CLIENT_ID!,
                client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                redirect_uri: `${baseURL}/api/auth/google/callback`,
                grant_type: 'authorization_code',
            }),
        })

        if (!tokenRes.ok) {
            const errText = await tokenRes.text()
            console.error('[OAuth Callback] Token exchange failed:', errText)
            return NextResponse.redirect(new URL('/login?error=token_exchange', appUrl))
        }

        const tokens: GoogleTokenResponse = await tokenRes.json()
        console.log('[OAuth Callback] Token exchange successful')

        // Get user info from Google
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
        })

        if (!userInfoRes.ok) {
            console.error('[OAuth Callback] Failed to fetch user info')
            return NextResponse.redirect(new URL('/login?error=user_info', appUrl))
        }

        const googleUser: GoogleUserInfo = await userInfoRes.json()
        console.log('[OAuth Callback] Got user info:', googleUser.email)

        // Check if user already exists in our users table
        const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', googleUser.email)
            .single()

        let userId: string
        let isNewUser = false

        if (existingUser) {
            userId = existingUser.id
            console.log('[OAuth Callback] Existing user found:', userId)
            // Update avatar if changed
            if (googleUser.picture && googleUser.picture !== existingUser.avatar_url) {
                await supabaseAdmin
                    .from('users')
                    .update({ avatar_url: googleUser.picture })
                    .eq('id', userId)
            }
        } else {
            // Create new user
            isNewUser = true
            const username = googleUser.name
                ?.toLowerCase()
                .replace(/\s+/g, '_')
                .replace(/[^a-z0-9_]/g, '')
                + '_' + Date.now().toString().slice(-4)

            const { data: newUser, error: insertError } = await supabaseAdmin
                .from('users')
                .insert({
                    auth_id: `google_${googleUser.sub}`,
                    username,
                    email: googleUser.email,
                    college: '',
                    semester: 1,
                    avatar_url: googleUser.picture || null,
                    total_xp: 0,
                    league: 'Bronze',
                    battles_played: 0,
                    battles_won: 0,
                })
                .select()
                .single()

            if (insertError) {
                console.error('[OAuth Callback] Failed to create user:', insertError)
                return NextResponse.redirect(new URL('/login?error=create_user', appUrl))
            }

            userId = newUser.id
            console.log('[OAuth Callback] New user created:', userId)
        }

        // Create a session token
        const sessionToken = crypto.randomBytes(32).toString('hex')
        const sessionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

        // Store session in Supabase
        const { error: sessionError } = await supabaseAdmin
            .from('auth_sessions')
            .insert({
                token: sessionToken,
                user_id: userId,
                expires_at: sessionExpiry.toISOString(),
                provider: 'google',
                provider_id: googleUser.sub,
            })

        if (sessionError) {
            console.error('[OAuth Callback] Failed to create session:', sessionError)
            return NextResponse.redirect(new URL('/login?error=session', appUrl))
        }

        console.log('[OAuth Callback] Session created, redirecting...')

        // Set session cookie and redirect
        const redirectUrl = isNewUser ? '/onboarding' : '/dashboard'
        const response = NextResponse.redirect(new URL(redirectUrl, appUrl))

        response.cookies.set('session_token', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60, // 30 days
            path: '/',
        })

        // Also set a client-readable cookie with basic user info
        response.cookies.set('user_info', JSON.stringify({
            id: userId,
            email: googleUser.email,
            name: googleUser.name,
            image: googleUser.picture,
        }), {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60,
            path: '/',
        })

        // Clear the oauth state cookie
        response.cookies.delete('oauth_state')

        return response

    } catch (error) {
        console.error('[OAuth Callback] Unexpected error:', error)
        return NextResponse.redirect(new URL('/login?error=callback', appUrl))
    }
}
