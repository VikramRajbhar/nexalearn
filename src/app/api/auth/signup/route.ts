import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
    try {
        const { email, password, username } = await req.json()
        const normalizedEmail = email?.trim().toLowerCase()

        if (!normalizedEmail || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
        }

        // Check if user already exists
        const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', normalizedEmail)
            .single()

        if (existingUser) {
            return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
        }

        // Hash password
        const salt = crypto.randomBytes(16).toString('hex')
        const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
        const passwordHash = `${salt}:${hash}`

        // Generate username if not provided
        const finalUsername = username || email.split('@')[0] + '_' + Date.now().toString().slice(-4)

        // Create user
        const { data: newUser, error: insertError } = await supabaseAdmin
            .from('users')
            .insert({
                auth_id: `email_${crypto.randomBytes(16).toString('hex')}`,
                username: finalUsername,
                email: normalizedEmail,
                password_hash: passwordHash,
                college: '',
                semester: 1,
                total_xp: 0,
                league: 'Bronze',
                battles_played: 0,
                battles_won: 0,
            })
            .select()
            .single()

        if (insertError) {
            console.error('Signup error:', insertError)
            return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
        }

        // Create session
        const sessionToken = crypto.randomBytes(32).toString('hex')
        const sessionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

        await supabaseAdmin
            .from('auth_sessions')
            .insert({
                token: sessionToken,
                user_id: newUser.id,
                expires_at: sessionExpiry.toISOString(),
                provider: 'email',
            })

        const response = NextResponse.json({ user: newUser })

        response.cookies.set('session_token', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60,
            path: '/',
        })

        return response

    } catch (error) {
        console.error('Signup error:', error)
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
    }
}
