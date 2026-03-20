'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export default function GoogleCallbackPage() {
    const router = useRouter()

    useEffect(() => {
        async function handleCallback() {
            try {
                // Sync user to our Supabase table
                const res = await fetch(
                    '/api/auth/sync-user',
                    { method: 'POST' }
                )
                const data = await res.json()

                if (data.success) {
                    // Check if user needs onboarding
                    const { data: session } =
                        await authClient.getSession()

                    if (!session?.user) {
                        router.push('/login')
                        return
                    }

                    // Check if user has college set
                    const profileRes = await fetch(
                        '/api/user/profile'
                    )
                    const profile = await profileRes
                        .json()

                    if (
                        !profile?.college ||
                        profile.college === ''
                    ) {
                        router.push('/onboarding')
                    } else {
                        router.push('/dashboard')
                    }
                } else {
                    router.push('/login?error=sync')
                }
            } catch (err) {
                console.error('Callback error:', err)
                router.push('/login?error=callback')
            }
        }

        handleCallback()
    }, [])

    return (
        <div
            className="min-h-screen flex items-center
        justify-center"
            style={{ backgroundColor: '#0A0A0F' }}>
            <div className="text-center">
                <div
                    className="w-12 h-12 rounded-full
            border-2 border-t-transparent
            animate-spin mx-auto mb-4"
                    style={{
                        borderColor: '#6C63FF',
                        borderTopColor: 'transparent'
                    }} />
                <p
                    className="font-space-grotesk
            font-bold text-lg"
                    style={{ color: '#FFFFFF' }}>
                    Setting up your account...
                </p>
                <p
                    className="text-sm mt-2"
                    style={{ color: '#5A5A7A' }}>
                    Connecting with Google
                </p>
            </div>
        </div>
    )
}
