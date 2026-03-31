"use client";

import React from "react";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
} from "recharts";

interface LineChartProps {
    data: any[];
}

export function PremiumLineChart({ data }: LineChartProps) {
    return (
        <div className="h-[400px] w-full p-8 rounded-[2.5rem] bg-secondary/10 border border-foreground/5 backdrop-blur-md">
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-foreground/40 mb-8">Traffic.Analysis</h2>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--foreground) / 0.05)" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--foreground) / 0.3)', fontSize: 10, fontWeight: 900, letterSpacing: '0.2em' }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--foreground) / 0.3)', fontSize: 10, fontWeight: 900 }}
                        dx={-10}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            borderRadius: '1.5rem',
                            border: '1px solid hsl(var(--foreground) / 0.1)',
                            boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
                            padding: '12px 16px',
                            color: 'hsl(var(--foreground))'
                        }}
                        itemStyle={{ fontSize: 12, fontWeight: 900, color: 'hsl(var(--primary))' }}
                    />
                    <Area type="monotone" dataKey="visitors" stroke="hsl(var(--primary))" strokeWidth={4} fillOpacity={1} fill="url(#colorVisitors)" />
                    <Line type="monotone" dataKey="pageViews" stroke="hsl(var(--foreground) / 0.2)" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

export function PremiumBarChart({ data }: { data: any[] }) {
    return (
        <div className="h-[400px] w-full p-8 rounded-[2.5rem] bg-secondary/10 border border-foreground/5 backdrop-blur-md">
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-foreground/40 mb-8">User.Registrations</h2>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} barSize={40}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--foreground) / 0.05)" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--foreground) / 0.3)', fontSize: 10, fontWeight: 900, letterSpacing: '0.2em' }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--foreground) / 0.3)', fontSize: 10, fontWeight: 900 }}
                        dx={-10}
                    />
                    <Tooltip
                        cursor={{ fill: 'hsl(var(--foreground) / 0.05)' }}
                        contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            borderRadius: '1.5rem',
                            border: '1px solid hsl(var(--foreground) / 0.1)',
                            padding: '12px 16px'
                        }}
                    />
                    <Bar dataKey="users" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
