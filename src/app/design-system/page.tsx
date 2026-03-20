"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Loader } from "@/components/ui/Loader";
import { Modal } from "@/components/ui/Modal";

export default function DesignSystemPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background p-8 md:p-12 mb-20 text-text-primary">
            <div className="max-w-5xl mx-auto space-y-12 bg-surface p-8 shadow-sm rounded-2xl border border-border">
                <header className="border-b border-border pb-6">
                    <h1 className="text-4xl font-grotesk font-bold text-text-primary">Design System</h1>
                    <p className="text-text-secondary mt-2">NexaLearn component library and styling reference.</p>
                </header>

                <section className="space-y-4">
                    <h2 className="text-2xl font-grotesk font-semibold text-primary border-l-4 border-primary pl-3">Buttons</h2>
                    <div className="flex flex-wrap items-center gap-4 p-6 bg-surface2 rounded-xl border border-border shadow-sm">
                        <Button variant="primary">Primary</Button>
                        <Button variant="secondary">Secondary</Button>
                        <Button variant="ghost">Ghost</Button>
                        <Button variant="danger">Danger</Button>
                        <Button isLoading>Loading</Button>
                        <Button disabled>Disabled</Button>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-grotesk font-semibold text-primary border-l-4 border-primary pl-3">Cards</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface2 p-6 rounded-xl border border-border mix-blend-normal">
                        <Card>
                            <CardHeader>
                                <CardTitle>Standard Card</CardTitle>
                                <CardDescription>Default surface styling.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-text-secondary">This is a regular card component.</p>
                            </CardContent>
                        </Card>

                        <Card highlighted>
                            <CardHeader>
                                <CardTitle>Highlighted Card</CardTitle>
                                <CardDescription>With a green left border accent.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-text-secondary">Used for emphasis or selection states.</p>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-grotesk font-semibold text-primary border-l-4 border-primary pl-3">Badges (League)</h2>
                    <div className="flex flex-wrap gap-4 p-6 bg-surface2 rounded-xl border border-border shadow-sm">
                        <Badge variant="bronze">Bronze</Badge>
                        <Badge variant="silver">Silver</Badge>
                        <Badge variant="gold">Gold</Badge>
                        <Badge variant="platinum">Platinum</Badge>
                        <Badge variant="diamond">Diamond</Badge>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-grotesk font-semibold text-primary border-l-4 border-primary pl-3">Badges (Topics)</h2>
                    <div className="flex flex-wrap gap-4 p-6 bg-surface2 rounded-xl border border-border shadow-sm">
                        <Badge variant="default">DSA</Badge>
                        <Badge variant="default">JavaScript</Badge>
                        <Badge variant="default">SQL</Badge>
                        <Badge variant="default">Python</Badge>
                        <Badge variant="default">OS</Badge>
                        <Badge variant="primary">Active Topic</Badge>
                        <Badge variant="danger">Failed</Badge>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-grotesk font-semibold text-primary border-l-4 border-primary pl-3">Avatars</h2>
                    <div className="flex flex-wrap gap-6 p-6 bg-surface2 rounded-xl border border-border shadow-sm items-center">
                        <Avatar fallback="VK" size="sm" />
                        <Avatar fallback="JS" size="md" />
                        <Avatar fallback="PRO" size="lg" />
                        <Avatar fallback="ON" size="md" isOnline />
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-grotesk font-semibold text-primary border-l-4 border-primary pl-3">Inputs</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-surface2 rounded-xl border border-border shadow-sm">
                        <Input label="Normal Input" placeholder="Enter username..." helperText="This is a normal input field." />
                        <Input label="Error Input" placeholder="Invalid data..." error="Username is already taken." />
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-grotesk font-semibold text-primary border-l-4 border-primary pl-3">Progress Bars</h2>
                    <div className="space-y-6 p-6 bg-surface2 rounded-xl border border-border shadow-sm">
                        <ProgressBar value={25} showLabel />
                        <ProgressBar value={50} showLabel />
                        <ProgressBar value={75} showLabel />
                        <ProgressBar value={100} showLabel />
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-grotesk font-semibold text-primary border-l-4 border-primary pl-3">Loader</h2>
                    <div className="p-6 bg-surface2 rounded-xl border border-border shadow-sm">
                        <Loader variant="inline" />
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-grotesk font-semibold text-primary border-l-4 border-primary pl-3">Modal</h2>
                    <div className="p-6 bg-surface2 rounded-xl border border-border shadow-sm">
                        <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
                        <Modal
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            title="Design System Modal"
                        >
                            <div className="space-y-4">
                                <p className="text-text-secondary">This modal demonstrates the sliding animation and backdrop blur of the Matrix theme.</p>
                                <div className="flex justify-end gap-3 pt-4">
                                    <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                    <Button variant="primary" onClick={() => setIsModalOpen(false)}>Confirm</Button>
                                </div>
                            </div>
                        </Modal>
                    </div>
                </section>
            </div>
        </div>
    );
}
