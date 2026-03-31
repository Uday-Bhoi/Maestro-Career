"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
    const containerRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    });

    const yRaw = useTransform(scrollYProgress, [0, 1], [0, 400]);
    const y = useSpring(yRaw, { stiffness: 100, damping: 30, restDelta: 0.001 });

    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

    return (
        <section
            id="home"
            ref={containerRef}
            className="relative min-h-[120vh] flex items-center justify-center pt-24 pb-32 overflow-hidden bg-background will-change-transform"
        >
            {/* Minimalist Architectural Background */}
            <motion.div
                style={{ y: useTransform(scrollYProgress, [0, 1], [0, 800]), opacity }}
                className="absolute top-0 left-0 w-full h-full -z-20 opacity-30 pointer-events-none"
            >
                <div className="absolute top-[10%] left-[15%] w-72 h-72 bg-foreground/5 rounded-full blur-[100px]" />
                <div className="absolute top-[40%] right-[10%] w-96 h-96 bg-foreground/3 rounded-full blur-[120px]" />
            </motion.div>

            <div className="container mx-auto px-6 lg:px-12 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        style={{ opacity, scale }}
                    >

                        <h1 className="text-7xl md:text-8xl xl:text-[10rem] font-black text-foreground tracking-tightest leading-[0.82] mb-10">
                            Navigate <br />
                            Your <br />
                            <span>Future.</span>
                        </h1>

                        <p className="text-xl md:text-2xl text-foreground/40 mb-12 max-w-xl leading-relaxed font-bold uppercase tracking-tight">
                            The definitive psychometric engine for the modern era. No guesswork—just professional precision.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-8">
                            <motion.a
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                href="/demo-test"
                                className="group w-full sm:w-auto px-12 py-6 bg-foreground text-background text-sm font-black uppercase tracking-widest rounded-none transition-all duration-300 shadow-2xl"
                            >
                                <span className="flex items-center">
                                    Start Evaluation
                                    <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform" />
                                </span>
                            </motion.a>

                            <Link href="#problem" className="text-foreground/30 hover:text-foreground font-black uppercase tracking-widest text-[10px] transition-colors flex items-center group">
                                Scroll to explore
                                <motion.div
                                    animate={{ y: [0, 5, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <ArrowRight className="ml-2 h-4 w-4 rotate-90" />
                                </motion.div>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Right Visual */}
                    <motion.div
                        style={{ y }}
                        className="relative hidden lg:block"
                    >
                        <div className="relative aspect-[4/5] overflow-hidden bg-secondary border border-foreground/5 shadow-2xl">
                            <Image
                                key="hero-image-vibrant"
                                src="/images/thoughtful_hero.png"
                                alt="Future"
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-cover transition-transform duration-[2000ms] hover:scale-110"
                                priority
                            />

                            {/* Minimalist Floating Overlay */}
                            <motion.div
                                style={{ y: useTransform(scrollYProgress, [0, 1], [0, -150]) }}
                                className="absolute bottom-12 -left-12 bg-foreground text-background p-8 min-w-[240px] shadow-2xl"
                            >
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-50 mb-2">Clarity Match</p>
                                <p className="text-3xl font-black tracking-tightest">98.4% Confidence</p>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Stories Scroll Indicator */}
            <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center space-y-6 opacity-20 hover:opacity-100 transition-opacity">
                <span className="text-[8px] font-black vertical-text uppercase tracking-[0.5em]">System.01 / Journey</span>
                <div className="w-[1px] h-48 bg-foreground/10 rounded-full overflow-hidden relative">
                    <motion.div
                        style={{ scaleY: scrollYProgress }}
                        className="absolute inset-0 bg-foreground origin-top"
                    />
                </div>
            </div>
        </section>
    );
}


