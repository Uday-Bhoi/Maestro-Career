"use client";

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface AnalyticsCardProps {
    title: string;
    value: string;
    trend: string;
    isPositive: boolean;
    icon: LucideIcon;
    color: string;
    delay?: number;
}

export default function AnalyticsCard({
    title,
    value,
    trend,
    isPositive,
    icon: Icon,
    color,
    delay = 0
}: AnalyticsCardProps) {
    const getColorClasses = (color: string) => {
        switch (color) {
            case 'blue': return 'bg-blue-500/10 text-blue-500 border-blue-500/10';
            case 'purple': return 'bg-purple-500/10 text-purple-500 border-purple-500/10';
            case 'cyan': return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/10';
            case 'emerald': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10';
            default: return 'bg-primary/10 text-primary border-primary/10';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            className="group relative rounded-[2rem] p-8 border border-foreground/5 bg-secondary/10 backdrop-blur-md transition-all duration-300 hover:border-foreground/10 hover:shadow-2xl"
        >
            <div className="flex items-center justify-between mb-6">
                <div className={`p-4 rounded-2xl border ${getColorClasses(color)} transition-transform duration-300 group-hover:scale-110 shadow-inner`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    {isPositive ? '+' : ''}{trend}
                </div>
            </div>

            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 mb-2">{title}</h3>
            <p className="text-4xl font-black tracking-tightest text-foreground uppercase italic">{value}</p>

            <div className="mt-6 h-1 w-full bg-foreground/5 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: isPositive ? '70%' : '40%' }}
                    transition={{ delay: delay + 0.5, duration: 1 }}
                    className={`h-full ${isPositive ? 'bg-emerald-500' : 'bg-rose-500'} opacity-20`}
                />
            </div>
        </motion.div>
    );
}
