"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { Zap, Brain, Target, Compass } from "lucide-react";

export default function SolutionSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"],
    });

    const yRaw = useTransform(scrollYProgress, [0, 1], [100, -100]);
    const y = useSpring(yRaw, { stiffness: 100, damping: 30, restDelta: 0.001 });
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

    const solutions = [
        {
            title: "Neuropsychological Depth",
            desc: "Move beyond simple personality quizes with absolute cognitive pattern analysis.",
            icon: Brain,
        },
        {
            title: "Architectural Alignment",
            desc: "Direct mapping to 500+ modern industries and future-focused professional roles.",
            icon: Target,
        },
        {
            title: "Zero-Pressure Discovery",
            desc: "Designed for exploration, not judgment. Find your path at your own pace.",
            icon: Compass,
        }
    ];

    return (
        <section 
            id="solution"
            ref={sectionRef}
            className="relative py-32 overflow-hidden bg-background transition-colors duration-500 will-change-transform"
        >
            <div className="container mx-auto px-6 lg:px-12 relative z-10">
                <div className="max-w-4xl mx-auto text-center mb-32">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center px-6 py-2 bg-foreground text-background mb-10"
                    >
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">SYSTEM.DECODE</span>
                    </motion.div>
                    
                    <h2 className="text-6xl md:text-8xl font-black text-foreground tracking-tightest leading-[0.85] mb-10 uppercase">
                        The Engine <br />
                        Inside You.
                    </h2>
                    <p className="text-xl md:text-2xl text-foreground/40 font-bold max-w-2xl mx-auto uppercase tracking-tighter">
                        Maestro isn&apos;t a test. It&apos;s a high-precision engine that decodes your professional DNA and maps it to a future that fits.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    {/* Visual UI Showcase */}
                    <motion.div 
                        style={{ opacity, y }}
                        className="relative"
                    >
                        <div className="relative aspect-[4/3] overflow-hidden bg-secondary border border-foreground/5 shadow-2xl">
                            <Image 
                                src="/images/maestro_mockup.png" 
                                alt="Platform" 
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-cover transition-transform duration-[2000ms] grayscale"
                            />
                        </div>
                        
                        {/* Architectural Status Marker */}
                        <motion.div 
                            animate={{ x: [0, 20, 0] }}
                            transition={{ duration: 5, repeat: Infinity }}
                            className="absolute -top-10 -left-10 bg-foreground text-background p-6 shadow-3xl"
                        >
                            <div className="flex items-center space-x-4">
                                <Zap className="w-5 h-5" />
                                <span className="font-black text-[10px] uppercase tracking-widest leading-none">Status: Active</span>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Highly-Minimalist Features Grid */}
                    <div className="grid gap-10">
                        {solutions.map((sol, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ delay: 0.2 * idx }}
                                className="p-10 bg-secondary/50 border border-foreground/5 hover:border-foreground/10 transition-all cursor-default"
                            >
                                <div className="flex items-start space-x-8">
                                    <div className="w-12 h-12 bg-foreground/10 flex items-center justify-center flex-shrink-0">
                                        <sol.icon className="w-6 h-6 text-foreground" />
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-2xl font-black text-foreground uppercase tracking-tight">
                                            {sol.title}
                                        </h3>
                                        <p className="text-sm text-foreground/40 font-bold uppercase tracking-widest leading-relaxed">
                                            {sol.desc}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Minimal Decorative Wash */}
            <div className="absolute top-0 right-0 w-[40%] h-full bg-foreground/5 blur-[200px] -z-10" />
        </section>
    );
}
