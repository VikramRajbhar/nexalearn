"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { signUp } from "@/lib/auth-client";
import { authClient } from "@/lib/auth-client";

const signupSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_]+$/, "Only alphanumeric and underscores allowed"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

function SignupForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const googleError = searchParams.get('error');

    const [formData, setFormData] = useState({ username: "", email: "", password: "", confirmPassword: "" });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleGoogleSignIn = () => {
        window.location.href = '/api/auth/google';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        const result = signupSchema.safeParse(formData);
        if (!result.success) {
            const formattedErrors: Record<string, string> = {};
            result.error.issues.forEach(issue => {
                if (issue.path[0]) formattedErrors[issue.path[0].toString()] = issue.message;
            });
            setErrors(formattedErrors);
            return;
        }

        setErrors({});
        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    username: formData.username
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setErrors({ form: data.error || "Failed to sign up" });
            } else {
                router.push("/onboarding");
            }
        } catch (err: any) {
            setErrors({ form: err.message || "An unexpected error occurred" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-base px-4 page-enter">
            <Card highlighted className="w-full max-w-md bg-bg-surface border-border-default">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent-primary text-text-primary font-bold text-xl shadow-[0_0_15px_rgba(108,99,255,0.4)]">
                            N
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-grotesk font-bold text-white">Join NexaLearn</CardTitle>
                </CardHeader>
                <CardContent>
                    {googleError === 'google' && (
                        <div
                            className="rounded-xl p-3 text-sm text-center mb-4"
                            style={{
                                backgroundColor: 'rgba(255,71,87,0.1)',
                                border: '1px solid rgba(255,71,87,0.3)',
                                color: '#FF4757'
                            }}>
                            Google sign up failed. Please try again.
                        </div>
                    )}

                    {/* Google Sign In Button */}
                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 hover-lift"
                        style={{
                            backgroundColor: '#1A1A26',
                            border: '1px solid #2A2A3F',
                            color: '#FFFFFF'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderColor = '#6C63FF50'
                            e.currentTarget.style.backgroundColor = '#22222F'
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = '#2A2A3F'
                            e.currentTarget.style.backgroundColor = '#1A1A26'
                        }}>

                        {/* Google SVG Icon */}
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>

                        Sign up with Google
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px" style={{ backgroundColor: '#1E1E2E' }} />
                        <span className="text-xs" style={{ color: '#5A5A7A' }}>
                            or continue with email
                        </span>
                        <div className="flex-1 h-px" style={{ backgroundColor: '#1E1E2E' }} />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Username"
                            placeholder="hacker_99"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            error={errors.username}
                        />
                        <Input
                            label="Email"
                            type="email"
                            placeholder="student@college.edu"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            error={errors.email}
                        />
                        <div className="relative">
                            <Input
                                label="Password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                error={errors.password}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-9 text-xs text-text-muted hover:text-accent-primary transition-colors"
                                title={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? "HIDE" : "SHOW"}
                            </button>
                        </div>
                        <Input
                            label="Confirm Password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            error={errors.confirmPassword}
                        />

                        {errors.form && <p className="text-accent-red text-sm font-bold text-center mt-2">{errors.form}</p>}

                        <div className="pt-4">
                            <Button type="submit" className="w-full" isLoading={isLoading}>
                                Create Account
                            </Button>
                        </div>

                        <div className="text-center mt-4 pt-2 border-t border-border-default">
                            <p className="text-sm text-text-secondary">
                                Already have an account? <Link href="/login" className="text-accent-primary font-bold hover:text-accent-primary-hover">Login</Link>
                            </p>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export default function SignupPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-bg-base">Loading...</div>}>
            <SignupForm />
        </Suspense>
    );
}
