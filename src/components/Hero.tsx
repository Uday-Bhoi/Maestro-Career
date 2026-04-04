"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";

const Typewriter = ({ text }: { text: string }) => {
    const [displayText, setDisplayText] = useState("");
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (index < text.length) {
            const timeout = setTimeout(() => {
                setDisplayText((prev) => prev + text[index]);
                setIndex((prev) => prev + 1);
            }, 100);
            return () => clearTimeout(timeout);
        } else {
            const restartTimeout = setTimeout(() => {
                setDisplayText("");
                setIndex(0);
            }, 3000);
            return () => clearTimeout(restartTimeout);
        }
    }, [index, text]);

    return (
        <span className="inline-block min-w-[10ch] sm:min-w-[15ch] lg:min-w-[20ch]">
            {displayText}
            <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                className="inline-block w-[2px] h-[1em] bg-primary ml-1 align-middle"
            />
        </span>
    );
};

export default function Hero() {
    const containerRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    });

    const y = useSpring(useTransform(scrollYProgress, [0, 1], [0, 300]), { stiffness: 100, damping: 30 });
    const opacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.4], [1, 0.95]);

    const staggeredFade = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.8, ease: "easeOut" }
    };

    return (
        <section
            id="home"
            ref={containerRef}
            className="relative min-h-screen flex items-center justify-center pt-20 pb-32 overflow-hidden bg-background"
        >
            {/* Background Decor */}
            <motion.div style={{ opacity }} className="absolute inset-0 -z-10 pointer-events-none">
                <div className="absolute top-[15%] left-[10%] w-[35rem] h-[35rem] bg-primary/5 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute bottom-[20%] right-[10%] w-[30rem] h-[30rem] bg-accent/5 rounded-full blur-[120px] animate-pulse [animation-delay:1s]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]" />
            </motion.div>

            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    style={{ opacity, scale, y }}
                    className="max-w-6xl mx-auto flex flex-col items-center space-y-12"
                >

                    {/* Centered Heading */}
                    <div className="w-full max-w-5xl mx-auto flex flex-col items-center text-center gap-4 font-black text-foreground tracking-tightest leading-none uppercase">
                        <h1 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl">
                            <Typewriter text="Crafting Careers," />
                        </h1>
                        <h1 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl text-primary italic">
                            <Typewriter text="Cultivating Success." />
                        </h1>
                    </div>

                    {/* Description & CTA */}
                    <motion.div
                        {...staggeredFade}
                        transition={{ delay: 3.5 }}
                        className="flex flex-col items-center gap-10"
                    >
                        <p className="text-lg md:text-xl text-foreground/40 font-bold max-w-2xl text-center uppercase tracking-tight">
                            High-precision career intelligence tailored for the next generation of industry leaders.
                        </p>

                        <Link
                            href="/auth"
                            className="group relative inline-flex items-center gap-6 px-12 py-6 bg-primary text-white text-[10px] font-black uppercase tracking-[0.6em] hover:scale-105 transition-all shadow-3xl active:scale-95"
                        >
                            Get Started
                            <ArrowRight size={14} className="group-hover:translate-x-3 transition-transform" />
                            <div className="absolute inset-0 -z-10 bg-primary/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                    </motion.div>
                </motion.div>
            </div>

            {/* Float Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.2 }}
                transition={{ delay: 4, duration: 1 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 cursor-pointer group"
                onClick={() => document.getElementById('interactive')?.scrollIntoView({ behavior: 'smooth' })}
            >
                <span className="text-[7px] font-black uppercase tracking-[0.8em] vertical-text group-hover:text-primary transition-colors">Begin Experience</span>
                <motion.div
                    animate={{ y: [0, 6, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                    <ArrowDown size={14} />
                </motion.div>
            </motion.div>
        </section>
    );
}


