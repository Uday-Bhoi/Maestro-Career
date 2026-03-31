"use client";

import React, { useState } from "react";
import { Users, MousePointerClick, TrendingUp, Activity, Calendar, ShieldAlert, Sparkles } from "lucide-react";
import AnalyticsCard from "./AnalyticsCard";
import { PremiumLineChart, PremiumBarChart } from "./ChartComponents";
import { motion } from "framer-motion";

// Mock Data
const lineChartData = [
    { name: "Mon", visitors: 4000, pageViews: 2400 },
    { name: "Tue", visitors: 3000, pageViews: 1398 },
    { name: "Wed", visitors: 2000, pageViews: 9800 },
    { name: "Thu", visitors: 2780, pageViews: 3908 },
    { name: "Fri", visitors: 1890, pageViews: 4800 },
    { name: "Sat", visitors: 2390, pageViews: 3800 },
    { name: "Sun", visitors: 3490, pageViews: 4300 },
];

const barChartData = [
    { name: "Week 1", users: 400 },
    { name: "Week 2", users: 300 },
    { name: "Week 3", users: 500 },
    { name: "Week 4", users: 280 },
];

const SummaryStats = [
    { title: "Total Visitors", value: "124,563", trend: "12.5%", isPositive: true, icon: Users, color: "blue" },
    { title: "Total Users", value: "45,231", trend: "8.2%", isPositive: true, icon: Activity, color: "purple" },
    { title: "Active Users", value: "8,942", trend: "2.4%", isPositive: false, icon: MousePointerClick, color: "cyan" },
    { title: "Conversion Rate", value: "4.6%", trend: "1.2%", isPositive: true, icon: TrendingUp, color: "emerald" },
];

export default function AnalyticsDashboard() {
    const [dateRange, setDateRange] = useState("Last 7 Days");

    return (
        <div className="min-h-screen bg-background text-foreground p-6 md:p-12 font-sans transition-colors duration-500 overflow-hidden relative">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-primary/5 rounded-full blur-[150px] -z-10" />
            <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-secondary/5 rounded-full blur-[120px] -z-10" />

            <div className="max-w-7xl mx-auto space-y-12 relative z-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="inline-flex items-center px-4 py-1.5 bg-foreground/5 text-foreground/40 mb-6 text-[10px] font-black uppercase tracking-[0.4em] rounded-lg">
                            <Sparkles className="w-3.5 h-3.5 mr-2 text-primary" />
                            <span>System.Analytic</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-foreground uppercase italic tracking-tightest leading-none">
                            Platform <br /><span className="text-primary italic">Intelligence.</span>
                        </h1>
                        <p className="text-xs font-bold text-foreground/20 mt-4 uppercase tracking-[0.2em] flex items-center gap-3">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            Live GA4 Integration Active • 2026 Archive
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-4"
                    >
                        <div className="relative group/select">
                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="appearance-none bg-secondary/20 border border-foreground/5 text-[11px] font-black uppercase tracking-widest text-foreground/60 py-4 pl-6 pr-14 rounded-2xl shadow-inner focus:outline-none focus:ring-2 focus:ring-primary/50 hover:bg-secondary/30 transition-all cursor-pointer"
                            >
                                <option>Last 7 Days</option>
                                <option>Last 30 Days</option>
                                <option>This Year</option>
                            </select>
                            <Calendar className="w-4 h-4 text-foreground/20 absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none group-hover/select:text-primary transition-colors" />
                        </div>
                    </motion.div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {SummaryStats.map((stat, idx) => (
                        <AnalyticsCard key={stat.title} {...stat} delay={idx * 0.1} />
                    ))}
                </div>

                {/* Charts Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <PremiumLineChart data={lineChartData} />
                    </div>
                    <div>
                        <PremiumBarChart data={barChartData} />
                    </div>
                </div>

                {/* Footer Notice */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="flex items-center gap-4 p-8 rounded-[2rem] bg-primary/5 border border-primary/10 text-primary/60"
                >
                    <ShieldAlert className="w-6 h-6 flex-shrink-0" />
                    <div className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                        <p className="opacity-100 mb-1">Architecture Information Notice</p>
                        <p className="opacity-50">This interface represents the high-fidelity structural visualization developed for GA4 telemetry streams. Direct data-source hooks are supported via the standard platform API layer.</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

