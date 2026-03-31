"use client";

import Link from "next/link";
import { Check, Sparkles, Zap, Shield, Crown } from "lucide-react";
import { PLANS, formatInr } from "@/data/plans";
import { motion } from "framer-motion";

export default function Pricing() {
    return (
        <section id="pricing" className="bg-background py-32 sm:py-48 relative overflow-hidden transition-colors duration-500">
            {/* Ambient Background Energy */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[180px] -z-10" />
            
            <div className="container mx-auto px-6 lg:px-12 relative z-10">
                <div className="max-w-4xl mx-auto text-center mb-32">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center px-6 py-2 bg-foreground text-background mb-10"
                    >
                        <Sparkles className="w-3.5 h-3.5 mr-3 text-vibe-pink" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">SYSTEM.INVEST</span>
                    </motion.div>
                    
                    <h2 className="text-6xl md:text-9xl font-black text-foreground tracking-tightest leading-[0.85] mb-12 uppercase">
                        Precision <br />
                        <span>Investment.</span>
                    </h2>
                    <p className="text-xl md:text-2xl text-foreground/40 font-bold max-w-2xl mx-auto uppercase tracking-tighter">
                        Choose the architecture for your next career phase. Results-driven alignment with zero guesswork.
                    </p>
                </div>

                <div className="isolate mx-auto grid max-w-md grid-cols-1 gap-y-12 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-12">
                    {PLANS.map((tier, idx) => (
                        <motion.div
                            key={tier.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className={`relative rounded-[3rem] p-10 xl:p-14 transition-all duration-500 border group ${
                                tier.mostPopular 
                                    ? 'bg-foreground text-background border-foreground shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] scale-105 z-10' 
                                    : 'bg-secondary/30 border-foreground/5 hover:border-foreground/10 text-foreground'
                            }`}
                        >
                            {tier.mostPopular && (
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-primary rounded-full shadow-lg">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white leading-none">Most Selected</p>
                                </div>
                            )}

                            <div className="flex items-center justify-between gap-x-4 mb-10">
                                <h3 className="text-2xl font-black uppercase tracking-tight leading-none italic">{tier.name}</h3>
                                {tier.id === 'starter' && <Zap className="w-6 h-6 opacity-30" />}
                                {tier.id === 'professional' && <Shield className="w-6 h-6 text-primary" />}
                                {tier.id === 'enterprise' && <Crown className="w-6 h-6 text-vibe-pink" />}
                            </div>

                            <div className="space-y-4 mb-10">
                                <p className={`text-4xl font-black tracking-tightest ${tier.mostPopular ? 'text-background' : 'text-foreground'}`}>
                                    {formatInr(tier.priceInr)}
                                </p>
                                <p className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-40`}>One-time implementation fee</p>
                            </div>

                            <p className="text-sm font-bold uppercase tracking-widest leading-relaxed mb-12 opacity-60">
                                {tier.description}
                            </p>

                            <Link
                                href={`/checkout/${tier.id}`}
                                className={`w-full py-6 flex items-center justify-center text-[11px] font-black uppercase tracking-[0.4em] transition-all duration-300 border ${
                                    tier.mostPopular
                                        ? 'bg-background text-foreground border-transparent hover:bg-neutral-200'
                                        : 'bg-foreground text-background border-transparent hover:opacity-90'
                                }`}
                            >
                                Secure Access
                            </Link>

                            <ul className="mt-12 space-y-6">
                                {tier.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-x-4">
                                        <div className={`mt-1 flex-none ${tier.mostPopular ? 'text-background' : 'text-primary'}`}>
                                            <Check className="h-4 w-4" aria-hidden="true" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60 flex-1">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* Kinetic Decoration */}
                            <div className={`absolute bottom-10 right-10 opacity-[0.03] transition-transform duration-700 group-hover:scale-150 group-hover:rotate-12 ${tier.mostPopular ? 'text-background' : 'text-foreground'}`}>
                                <h4 className="text-9xl font-black leading-none">0{idx + 1}</h4>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom Trust Badge */}
                <div className="mt-32 flex flex-col items-center justify-center space-y-4 opacity-20">
                    <div className="flex items-center space-x-4">
                        <div className="h-px w-12 bg-foreground" />
                        <span className="text-[10px] font-black uppercase tracking-[0.8em]">Secure Processing</span>
                        <div className="h-px w-12 bg-foreground" />
                    </div>
                    <p className="text-[8px] font-bold uppercase tracking-widest text-center">Encrypted by Advanced Professional Architecture</p>
                </div>
            </div>
        </section>
    );
}
