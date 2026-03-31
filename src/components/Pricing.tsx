"use client";

import React, { useState } from "react";
import { Check, X, ChevronDown, Sparkles } from "lucide-react";
import { PLANS, formatInr } from "@/data/plans";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function Pricing() {
    return (
        <section id="pricing" className="bg-background py-32 transition-colors duration-500 relative overflow-hidden">
            {/* Ambient Background Energy */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[180px] -z-10" />

            <div className="container mx-auto px-6 lg:px-12 relative z-10">
                <div className="max-w-4xl mx-auto text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center px-6 py-2 bg-foreground text-background mb-8 text-[10px] font-black uppercase tracking-[0.4em]"
                    >
                        <Sparkles className="w-3.5 h-3.5 mr-3 text-primary" />
                        <span>Investment.Strategy</span>
                    </motion.div>

                    <h2 className="text-5xl md:text-8xl font-black text-foreground tracking-tightest leading-[0.85] mb-10 uppercase">
                        Precision <br />
                        <span className="text-primary italic text-6xl md:text-9xl">Alignment.</span>
                    </h2>
                    <p className="text-lg md:text-xl text-foreground/40 font-bold max-w-2xl mx-auto uppercase tracking-tighter leading-tight">
                        Select the architecture for your next career phase. Results-driven alignment with zero guesswork.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 items-start">
                    {PLANS.map((plan, idx) => (
                        <PricingCard key={plan.id} plan={plan} index={idx} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function PricingCard({ plan, index }: { plan: any; index: number }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isSelected, setIsSelected] = useState(false);

    const getAuraColor = (color: string) => {
        switch (color) {
            case 'blue': return 'group-hover:shadow-[0_0_80px_-10px_rgba(59,130,246,0.5)]';
            case 'purple': return 'group-hover:shadow-[0_0_80px_-10px_rgba(139,92,246,0.5)]';
            case 'cyan': return 'group-hover:shadow-[0_0_80px_-10px_rgba(6,182,212,0.5)]';
            default: return '';
        }
    };

    const getSelectedGlow = (color: string) => {
        if (!isSelected) return 'border-foreground/5';
        switch (color) {
            case 'blue': return 'border-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.2)] bg-blue-500/5';
            case 'purple': return 'border-purple-500 shadow-[0_0_40px_rgba(139,92,246,0.2)] bg-purple-500/5';
            case 'cyan': return 'border-cyan-500 shadow-[0_0_40px_rgba(6,182,212,0.2)] bg-cyan-500/5';
            default: return 'border-primary';
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setIsSelected(!isSelected)}
            className={`group relative rounded-[3rem] p-10 xl:p-14 border transition-all duration-500 flex flex-col bg-secondary/10 dark:bg-white/[0.02] backdrop-blur-xl cursor-pointer min-h-[800px] lg:min-h-[950px] ${getAuraColor(plan.color)} ${getSelectedGlow(plan.color)} ${plan.mostPopular && !isSelected ? 'ring-1 ring-primary/20' : ''}`}
        >
            {plan.mostPopular && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-2xl z-30 ring-4 ring-background">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white leading-none whitespace-nowrap">
                        ⭐ Most Popular
                    </p>
                </div>
            )}

            <div className="flex items-center justify-between mb-10">
                <h3 className="text-3xl font-black uppercase tracking-tight italic text-foreground leading-none">{plan.name}</h3>
            </div>

            <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest leading-relaxed mb-10 min-h-[3rem]">
                {plan.description}
            </p>

            <div className="mb-12">
                <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black tracking-tightest text-foreground">{formatInr(plan.priceInr)}</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">/one-time</span>
                </div>
            </div>

            <Link
                href={`/checkout/${plan.id}`}
                onClick={(e) => e.stopPropagation()}
                className={`w-full py-6 rounded-2xl flex items-center justify-center text-[11px] font-black uppercase tracking-[0.4em] transition-all duration-300 border mb-12 ${plan.mostPopular
                    ? 'bg-primary text-white border-transparent hover:scale-[1.02] shadow-xl shadow-primary/30'
                    : 'bg-foreground text-background border-transparent hover:scale-[1.02]'
                    }`}
            >
                Get Started
            </Link>

            <div className="space-y-6 flex-1">
                <FeatureList features={plan.features} />

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: "circOut" }}
                            className="overflow-hidden"
                        >
                            <div className="pt-6 mt-6 border-t border-foreground/5 space-y-6">
                                <FeatureList features={plan.extraFeatures} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                }}
                className="mt-10 flex items-center justify-center gap-3 w-full py-5 rounded-2xl border border-foreground/5 bg-foreground/[0.02] hover:bg-foreground/[0.05] transition-all group/btn"
                aria-expanded={isExpanded}
            >
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground/40 group-hover/btn:text-foreground transition-colors">
                    {isExpanded ? "Collapse View" : "See Details"}
                </span>
                <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
                    <ChevronDown className="w-4 h-4 text-foreground/40 group-hover/btn:text-foreground" />
                </div>
            </button>

            {/* Kinetic Decoration from early version */}
            <div className={`absolute bottom-6 right-10 opacity-[0.03] transition-all duration-700 pointer-events-none ${plan.mostPopular ? 'opacity-[0.07] scale-110' : ''}`}>
                <h4 className="text-9xl font-black leading-none select-none">0{index + 1}</h4>
            </div>
        </motion.div>
    );
}

function FeatureList({ features }: { features: string[] }) {
    return (
        <ul className="space-y-5">
            {features.map((feature, idx) => {
                const isNotIncluded = feature.toLowerCase().includes("not included");
                const isIncluded = feature.toLowerCase().includes("included");

                return (
                    <li key={idx} className="flex items-start gap-4">
                        <div className={`mt-1 flex-none p-1 rounded-full ${isNotIncluded ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"}`}>
                            {isNotIncluded ? (
                                <X className="h-3 w-3" strokeWidth={4} aria-hidden="true" />
                            ) : (
                                <Check className="h-3 w-3" strokeWidth={4} aria-hidden="true" />
                            )}
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest leading-relaxed ${isNotIncluded ? "text-foreground/30" : "text-foreground/60"}`}>
                            {feature}
                        </span>
                    </li>
                );
            })}
        </ul>
    );
}
