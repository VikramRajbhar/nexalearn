'use client';

import React, { useState } from 'react';
import { useUserStore } from '@/store/userStore';
import { X, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AVATARS = ['👨‍💻', '👩‍💻', '🦊', '🦉', '🐱', '🐼', '🤖', '👾'];

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
    const { user, setUser } = useUserStore();
    const [username, setUsername] = useState(user?.username || '');
    const [college, setCollege] = useState(user?.college || '');
    const [semester, setSemester] = useState(user?.semester?.toString() || '1');
    const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || AVATARS[0]);
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen || !user) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch('/api/profile/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    username,
                    college,
                    semester,
                    avatar_url: avatarUrl
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error);
            }

            setUser(data.user);
            toast.success('Profile updated!');
            onClose();
        } catch (err: any) {
            toast.error(err.message || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface border border-border rounded-2xl w-full max-w-md animate-in zoom-in-95 duration-200 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-border bg-surface2">
                    <h2 className="text-xl font-bold font-grotesk tracking-wide">Edit Profile</h2>
                    <button onClick={onClose} className="p-2 text-text-secondary hover:text-text rounded-lg hover:bg-surface transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Avatar Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-text-secondary uppercase tracking-wider">Choose Avatar</label>
                        <div className="grid grid-cols-4 gap-3">
                            {AVATARS.map((emoji) => (
                                <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => setAvatarUrl(emoji)}
                                    className={`h-14 text-2xl flex items-center justify-center rounded-xl border-2 transition-all ${avatarUrl === emoji
                                        ? 'border-primary bg-primary/10 shadow-[0_0_10px_rgba(0,255,65,0.2)] scale-105'
                                        : 'border-border bg-surface2 hover:border-primary/50'
                                        }`}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-text-secondary uppercase tracking-wider">Username</label>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-text"
                                placeholder="Enter username"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-text-secondary uppercase tracking-wider">College</label>
                            <input
                                type="text"
                                required
                                value={college}
                                onChange={(e) => setCollege(e.target.value)}
                                className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-text"
                                placeholder="Enter college name"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-text-secondary uppercase tracking-wider">Semester</label>
                            <select
                                required
                                value={semester}
                                onChange={(e) => setSemester(e.target.value)}
                                className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-text appearance-none"
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                                    <option key={sem} value={sem}>Semester {sem}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-border text-text font-bold rounded-xl hover:bg-surface2 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 bg-accent-primary text-black font-bold rounded-xl hover:bg-accent-primary-hover transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Check className="w-5 h-5" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
