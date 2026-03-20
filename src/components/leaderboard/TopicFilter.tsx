'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Globe, Calendar, Terminal, Hash, Database, Code } from 'lucide-react';

interface TopicFilterProps {
    activeTab: string;
    onSelect: (tab: string) => void;
}

export const TABS = [
    { id: 'global', label: 'Global', icon: Globe },
    { id: 'weekly', label: 'Weekly', icon: Calendar },
    { id: 'DSA', label: 'DSA', icon: Hash },
    { id: 'JavaScript', label: 'JavaScript', icon: Code },
    { id: 'Python', label: 'Python', icon: Terminal },
    { id: 'SQL', label: 'SQL', icon: Database },
    { id: 'React', label: 'React', icon: Code },
];

export function TopicFilter({ activeTab, onSelect }: TopicFilterProps) {
    return (
        <div className="flex overflow-x-auto hide-scrollbar gap-2 p-1">
            {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onSelect(tab.id)}
                        className={cn(
                            "flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-300 relative whitespace-nowrap outline-none",
                            isActive
                                ? "text-black bg-accent-primary shadow-[0_0_15px_rgba(108,99,255,0.4)]"
                                : "text-text-secondary bg-bg-surface hover:bg-bg-surface-2 hover:text-white"
                        )}
                    >
                        <Icon className={cn("w-4 h-4", isActive ? "text-black" : "text-text-secondary group-hover:text-white")} />
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}
