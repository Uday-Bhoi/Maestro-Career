"use client";

import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Users, TrendingUp, Award, Target } from "lucide-react";
import { useRef, useEffect } from "react";

function Counter({ value, duration = 2.5 }: { value: string; duration?: number }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
    
    const endValue = parseInt(value.replace(/\D/g, ""));
    const suffix = value.replace(/\d/g, "");

    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, {
        duration: duration * 1000,
        bounce: 0,
    });
    
    const displayValue = useTransform(springValue, (latest) => Math.floor(latest));

    useEffect(() => {
        if (isInView) {
            motionValue.set(endValue);
        }
    }, [isInView, endValue, motionValue]);

    return (
        <span ref={ref} className="tabular-nums">
            <motion.span>{displayValue}</motion.span>
            {suffix}
        </span>
    );
}

export default function OutcomeSection() {
    const stats = [
        { id: 1, name: "Clarity Score", value: "98%", icon: Target, delay: 0.1 },
        { id: 2, name: "Student Success", value: "15k+", icon: Users, delay: 0.2 },
        { id: 3, name: "Career Experts", value: "50+", icon: Award, delay: 0.3 },
    ];

    return (
        <section id="outcomes" className="relative py-32 overflow-hidden bg-background transition-colors duration-500">
            <div className="container mx-auto px-4 relative z-10">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    
                    {/* Left: Interactive Graph representation */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="relative"
                    >
                        <div className="aspect-square max-w-md mx-auto relative glass p-10 rounded-[4rem] border-primary/20 shadow-3d overflow-hidden group">
                           {/* Animated SVG Path for "Graph" */}
                           <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
                                <motion.path
                                    d="M20,150 Q50,140 80,100 T140,60 T180,40"
                                    fill="none"
                                    stroke="url(#gradient-line)"
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    initial={{ pathLength: 0 }}
                                    whileInView={{ pathLength: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 2.5, ease: "easeInOut" }}
                                />
                                <defs>
                                    <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="hsl(var(--primary))" />
                                        <stop offset="100%" stopColor="hsl(var(--accent-purple))" />
                                    </linearGradient>
                                </defs>
                           </svg>
                           
                           {/* Floating Results Node */}
                           <motion.div 
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="absolute top-1/4 right-1/4 glass p-6 rounded-3xl border-white/10 shadow-2xl"
                           >
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                        <TrendingUp className="w-4 h-4 text-green-500" />
                                    </div>
                                    <p className="text-xs font-black uppercase tracking-widest text-foreground/70">Probability</p>
                                </div>
                                <p className="text-4xl font-black text-foreground">94.8%</p>
                                <p className="text-xs font-bold text-muted-foreground mt-2">Career Match Accuracy</p>
                           </motion.div>

                           {/* Decorative Blobs */}
                           <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-1000" />
                        </div>
                    </motion.div>

                    {/* Right: Counters & Narrative */}
                    <div className="space-y-12">
                        <div className="space-y-6">
                            <h2 className="text-5xl md:text-6xl font-black text-foreground tracking-tighter leading-none">
                                Numbers that <br />
                                <span className="text-gradient">Drive Change.</span>
                            </h2>
                            <p className="text-xl text-muted-foreground font-medium max-w-lg">
                                We&apos;ve already helped thousands of students transition from overwhelmed to purposeful. Our methodology is built on 35+ years of combined psychological expertise.
                            </p>
                        </div>

                        <div className="grid gap-8">
                            {stats.map((stat) => (
                                <motion.div
                                    key={stat.id}
                                    initial={{ opacity: 0, x: 30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ delay: stat.delay }}
                                    className="flex items-center space-x-8 p-8 rounded-[2rem] bg-card/40 border border-border/50 hover:bg-card/60 transition-all group"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <stat.icon className="w-8 h-8 text-primary" />
                                    </div>
                                    <div>
                                        <div className="text-4xl md:text-5xl font-black text-foreground tracking-tighter">
                                            <Counter value={stat.value} />
                                        </div>
                                        <p className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground mt-1">{stat.name}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Story Label Case-study style */}
            <div className="absolute bottom-0 right-0 p-24 opacity-5 pointer-events-none -rotate-12 select-none">
                <span className="text-[180px] font-black uppercase tracking-tighter leading-none">IMPACT</span>
            </div>
        </section>
    );
}
