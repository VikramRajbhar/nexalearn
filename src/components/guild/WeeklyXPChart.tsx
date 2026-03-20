'use client';
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Zap, Calendar, Target } from 'lucide-react';

interface WeeklyXPChartProps {
    data: { day: string; xp: number }[];
    totalWeeklyXP: number;
}

export function WeeklyXPChart({ data, totalWeeklyXP }: WeeklyXPChartProps) {
    const peakDay = data.reduce((max, d) => d.xp > max.xp ? d : max, data[0] || { day: '-', xp: 0 });
    const avgXP = data.length > 0 ? Math.round(data.reduce((s, d) => s + d.xp, 0) / data.length) : 0;
    const lastTwo = data.slice(-2);
    const trend = lastTwo.length === 2 && lastTwo[0].xp > 0
        ? Math.round(((lastTwo[1].xp - lastTwo[0].xp) / lastTwo[0].xp) * 100)
        : 0;
    const trendUp = trend >= 0;

    return (
        <div className="bg-bg-surface/60 border border-border-default rounded-2xl p-6 backdrop-blur-md relative overflow-hidden">
            {/* Decorative glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent-primary/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex justify-between items-start mb-2 relative z-10">
                <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-accent-primary drop-shadow-[0_0_8px_rgba(108,99,255,0.6)]" /> XP Activity
                    </h3>
                    <p className="text-text-secondary text-xs mt-1">7-day guild performance trace</p>
                </div>
                <div className="bg-accent-primary/10 border border-accent-primary/20 px-5 py-3 rounded-xl text-right shadow-[0_0_20px_rgba(108,99,255,0.08)]">
                    <div className="text-3xl font-black text-accent-primary font-mono leading-none">{totalWeeklyXP.toLocaleString()}</div>
                    <div className="text-[10px] text-accent-primary/60 uppercase font-bold tracking-widest mt-1">Total Weekly XP</div>
                </div>
            </div>

            {/* Sparkline Mini-Stats */}
            <div className="grid grid-cols-3 gap-3 mb-5 relative z-10">
                <div className="bg-bg-surface-2/40 border border-border-default/50 rounded-lg px-3 py-2.5 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                        <Target className="w-4 h-4 text-yellow-500" />
                    </div>
                    <div>
                        <div className="text-xs text-text-secondary uppercase tracking-wider font-bold">Peak</div>
                        <div className="font-black text-white text-sm">{peakDay?.day} <span className="text-accent-primary text-xs">({peakDay?.xp} XP)</span></div>
                    </div>
                </div>
                <div className="bg-bg-surface-2/40 border border-border-default/50 rounded-lg px-3 py-2.5 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                        <div className="text-xs text-text-secondary uppercase tracking-wider font-bold">Avg/Day</div>
                        <div className="font-black text-white text-sm">{avgXP.toLocaleString()} <span className="text-text-secondary text-xs">XP</span></div>
                    </div>
                </div>
                <div className="bg-bg-surface-2/40 border border-border-default/50 rounded-lg px-3 py-2.5 flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${trendUp ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                        {trendUp ? <ArrowUpRight className="w-4 h-4 text-emerald-400" /> : <ArrowDownRight className="w-4 h-4 text-red-400" />}
                    </div>
                    <div>
                        <div className="text-xs text-text-secondary uppercase tracking-wider font-bold">Trend</div>
                        <div className={`font-black text-sm ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}>{trendUp ? '+' : ''}{trend}%</div>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="h-56 w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <defs>
                            <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#6c63ff" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="#6c63ff" stopOpacity={0.02} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#555', fontSize: 11, fontWeight: 600 }}
                        />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#444', fontSize: 10 }} />
                        <Tooltip
                            cursor={{ stroke: 'rgba(108,99,255,0.15)', strokeWidth: 1 }}
                            contentStyle={{
                                backgroundColor: '#0D1117',
                                border: '1px solid rgba(108,99,255,0.25)',
                                borderRadius: '10px',
                                boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                                padding: '10px 14px'
                            }}
                            itemStyle={{ color: '#6c63ff', fontWeight: 'bold', fontSize: '13px' }}
                            labelStyle={{ color: '#888', fontSize: '11px', marginBottom: '4px' }}
                            formatter={(value: any) => [`${value} XP`, 'Generated']}
                        />
                        <Area
                            type="monotone"
                            dataKey="xp"
                            stroke="#6c63ff"
                            strokeWidth={2.5}
                            fill="url(#xpGradient)"
                            dot={{ r: 4, fill: '#0A0E13', stroke: '#6c63ff', strokeWidth: 2 }}
                            activeDot={{ r: 6, fill: '#6c63ff', stroke: '#0A0E13', strokeWidth: 3, className: 'drop-shadow-[0_0_8px_rgba(108,99,255,0.8)]' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
