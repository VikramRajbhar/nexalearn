"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useUserStore } from "@/store/userStore";
import { createUser, getUser, updateUser } from "@/lib/db";
import { useSession, authClient } from "@/lib/auth-client";

const ALL_TOPICS = [
    "DSA", "OS", "DBMS", "CN", "OOP", "System Design",
    "C", "C++", "Java", "JavaScript", "Python",
    "HTML/CSS", "SQL", "Git"
];

const AVATARS = ["🧑‍💻", "👨‍💻", "👩‍💻", "🦊", "🐉", "⚡", "🛡️", "🎯"];

export default function OnboardingPage() {
    const router = useRouter();
    const setUser = useUserStore((state) => state.setUser);
    const { data: session, isPending } = useSession();

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        username: "",
        college: "",
        semester: "1",
        topics: [] as string[],
        avatar: "🧑‍💻"
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (session?.user) {
            const googleName = session.user.name?.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') || '';
            const googleImg = session.user.image || "🧑‍💻";
            setFormData(prev => ({
                ...prev,
                username: prev.username || googleName,
                avatar: prev.avatar === "🧑‍💻" ? googleImg : prev.avatar
            }));
        }
    }, [session]);

    const toggleTopic = (topic: string) => {
        setFormData(prev => {
            if (prev.topics.includes(topic)) {
                return { ...prev, topics: prev.topics.filter(t => t !== topic) };
            } else {
                return { ...prev, topics: [...prev.topics, topic] };
            }
        });
    };

    const handleNext = () => {
        setError("");
        if (step === 1) {
            if (!formData.username.trim()) {
                setError("Please enter a username");
                return;
            }
            if (!formData.college.trim()) {
                setError("Please enter your college name");
                return;
            }
        }
        if (step === 2 && formData.topics.length < 3) {
            setError("Please select at least 3 topics to battle on");
            return;
        }
        setStep(s => s + 1);
    };

    const handleComplete = async () => {
        setIsLoading(true);
        try {
            const sessionResult = await authClient.getSession();
            const authId = sessionResult?.data?.user?.id || session?.user?.id;
            if (!authId) throw new Error("Not authenticated - Session missing");

            const username = formData.username || sessionResult?.data?.user?.name || session?.user?.name || "Player";
            const email = sessionResult?.data?.user?.email || session?.user?.email || "unknown@email.com";

            let finalUser;
            try {
                // Try to create a new user profile
                finalUser = await createUser({
                    auth_id: authId,
                    username: username,
                    email: email,
                    college: formData.college,
                    semester: parseInt(formData.semester),
                    avatar_url: formData.avatar
                });
            } catch (insertErr: any) {
                console.warn("User profile may already exist, attempting fetch+update...", insertErr.message);
                try {
                    finalUser = await getUser(authId);
                    // Update their profile with the new onboarding data
                    finalUser = await updateUser(authId, {
                        college: formData.college,
                        semester: parseInt(formData.semester),
                        avatar_url: formData.avatar
                    });
                } catch (fetchErr: any) {
                    console.error("Failed to fetch/update existing user:", fetchErr);
                    throw fetchErr;
                }
            }

            setUser(finalUser);
            router.push("/dashboard");
        } catch (err: any) {
            console.error("Onboarding error:", err);
            setError("Failed to save profile. Using local fallback.");
            setTimeout(() => {
                router.push("/dashboard");
            }, 1000);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-base px-4 py-12 page-enter">
            <Card highlighted className="w-full max-w-2xl bg-bg-surface border-border-default">
                <CardHeader className="text-center border-b border-border-subtle pb-6">
                    <div className="flex justify-center flex-wrap gap-2 mb-4">
                        <span className={`h-2 w-1/4 rounded-full ${step >= 1 ? 'bg-accent-primary' : 'bg-bg-surface-2'}`}></span>
                        <span className={`h-2 w-1/4 rounded-full ${step >= 2 ? 'bg-accent-primary' : 'bg-bg-surface-2'}`}></span>
                        <span className={`h-2 w-1/4 rounded-full ${step >= 3 ? 'bg-accent-primary' : 'bg-bg-surface-2'}`}></span>
                    </div>
                    <CardTitle className="text-3xl font-grotesk font-bold">
                        {step === 1 && "Academic Profile"}
                        {step === 2 && "Choose Your Weapons"}
                        {step === 3 && "Claim Your Identity"}
                    </CardTitle>
                    <p className="text-text-secondary mt-2">
                        {step === 2 && "These will be your battle topics. Select at least 3."}
                    </p>
                </CardHeader>

                <CardContent className="pt-6">
                    {error && <div className="text-accent-red text-center font-bold mb-4">{error}</div>}

                    {step === 1 && (
                        <div className="space-y-6">
                            <Input
                                label="Username"
                                placeholder="hacker_99"
                                value={formData.username}
                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                            />
                            <Input
                                label="College Name"
                                placeholder="Indian Institute of Technology..."
                                value={formData.college}
                                onChange={e => setFormData({ ...formData, college: e.target.value })}
                            />
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-text-secondary">Current Semester</label>
                                <select
                                    className="flex h-11 w-full rounded-md border border-border-default bg-bg-surface px-3 py-2 text-sm text-text-primary appearance-none focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary transition-all"
                                    value={formData.semester}
                                    onChange={e => setFormData({ ...formData, semester: e.target.value })}
                                >
                                    {[...Array(8)].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>Semester {i + 1}</option>
                                    ))}
                                </select>
                            </div>
                            <Button className="w-full mt-4" onClick={handleNext}>Next Step</Button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {ALL_TOPICS.map(topic => (
                                    <div
                                        key={topic}
                                        onClick={() => toggleTopic(topic)}
                                        className={`cursor-pointer border rounded-lg p-3 text-center transition-all ${formData.topics.includes(topic)
                                            ? 'border-accent-primary bg-accent-primary/10 text-accent-primary font-bold'
                                            : 'border-border-default hover:border-text-secondary bg-bg-surface-2 text-text-secondary'
                                            }`}
                                    >
                                        {topic}
                                        {formData.topics.includes(topic) && <span className="absolute top-1 right-2">✓</span>}
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-text-secondary text-right">{formData.topics.length} Selected (Min 3)</p>
                            <div className="flex gap-4 pt-4">
                                <Button variant="secondary" onClick={() => setStep(1)} className="w-1/3">Back</Button>
                                <Button className="w-2/3" onClick={handleNext}>Next Step</Button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 text-center">
                            <div className="grid grid-cols-4 gap-4 max-w-sm mx-auto">
                                {AVATARS.map((avatar, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, avatar })}
                                        className={`text-4xl aspect-square flex items-center justify-center rounded-full transition-all ${formData.avatar === avatar
                                            ? 'ring-4 ring-accent-primary bg-accent-primary/10 scale-110'
                                            : 'bg-bg-surface-2 hover:bg-border-default ring-1 ring-border-default'
                                            }`}
                                    >
                                        {avatar}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-4 pt-8">
                                <Button variant="secondary" onClick={() => setStep(2)} className="w-1/3" disabled={isLoading}>Back</Button>
                                <Button className="w-2/3" onClick={handleComplete} isLoading={isLoading}>Complete Setup</Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
