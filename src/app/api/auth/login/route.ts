import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json()
        const normalizedEmail = email?.trim().toLowerCase()

        if (!normalizedEmail || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
        }

        // Look up user in our users table
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', normalizedEmail)
            .single()

        if (userError || !user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
        }

        // Check password - if user has a password_hash, verify it
        // If they signed up with Google (no password), reject
        if (!user.password_hash) {
            return NextResponse.json({ error: 'This account uses Google sign-in. Please use "Continue with Google" instead.' }, { status: 401 })
        }

        // Verify password using crypto
        const [salt, hash] = user.password_hash.split(':')
        const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')

        if (hash !== verifyHash) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
        }

        // Create session
        const sessionToken = crypto.randomBytes(32).toString('hex')
        const sessionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

        await supabaseAdmin
            .from('auth_sessions')
            .insert({
                token: sessionToken,
                user_id: user.id,
                expires_at: sessionExpiry.toISOString(),
                provider: 'email',
            })

        // Set session cookie
        const response = NextResponse.json({ user })

        response.cookies.set('session_token', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60,
            path: '/',
        })

        return response

    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
    }
}
