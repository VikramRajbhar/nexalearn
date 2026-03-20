'use client';

import React from 'react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip
} from 'recharts';
import type { SkillScore } from '@/types';

interface SkillRadarChartProps {
    skillScores: SkillScore[];
}

const ALL_TOPICS = [
    "DSA", "OS", "DBMS", "CN", "OOP", "System Design",
    "C", "C++", "Java", "JavaScript", "Python",
    "HTML/CSS", "SQL", "Git"
];

const CHART_GREEN = '#00FF41';
const CHART_GRID = '#1e2d1e';
const TOOLTIP_BG = '#12121A';
const TOOLTIP_BORDER = '#1e2d1e';

export function SkillRadarChart({ skillScores }: SkillRadarChartProps) {
    const hasBattles = skillScores.length > 0;
    const hasEnoughTopics = skillScores.length >= 3;

    if (hasBattles && !hasEnoughTopics) {
        return (
            <div className="flex flex-col items-center justify-center h-[300px] text-center p-6 bg-bg-surface border border-border-default rounded-xl">
                <div className="text-4xl mb-4">🗺️</div>
                <h3 className="text-lg font-semibold text-text mb-2">Play more battles to see your skill map</h3>
                <p className="text-sm text-text-secondary">
                    You need to play battles in at least 3 different topics to construct a skill radar.
                </p>
            </div>
        );
    }

    const data = hasBattles
        ? skillScores.map(score => ({
            subject: score.topic,
            A: score.score,
            fullMark: 100
        }))
        : ALL_TOPICS.map(topic => ({
            subject: topic,
            A: 50,
            fullMark: 100
        }));

    return (
        <div className="w-full h-[300px] md:h-[400px] bg-bg-surface border border-border-default rounded-xl p-4">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                    <PolarGrid stroke={CHART_GRID} />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: CHART_GREEN, fontSize: 11, fontWeight: 600 }}
                    />
                    <PolarRadiusAxis
                        angle={30}
                        domain={[0, 100]}
                        tick={false}
                        axisLine={false}
                    />
                    <Radar
                        name="Skill Score"
                        dataKey="A"
                        stroke={CHART_GREEN}
                        strokeWidth={2.5}
                        fill={CHART_GREEN}
                        fillOpacity={0.18}
                        dot={{ r: 4, fill: '#0A0A0F', stroke: CHART_GREEN, strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: CHART_GREEN, stroke: '#0A0A0F', strokeWidth: 2 }}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: TOOLTIP_BG, borderColor: TOOLTIP_BORDER, borderRadius: '8px' }}
                        itemStyle={{ color: CHART_GREEN, fontWeight: 'bold' }}
                        formatter={(value: any) => [`${value} / 100`, 'Score']}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
