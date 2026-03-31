"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion, useTransform, useSpring, useMotionValue } from "framer-motion";
import { Cpu, Layout, Layers, Box, MousePointer2 } from "lucide-react";
import React from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FeatureCard = ({ title, desc, icon: Icon, color }: any) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);
    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width - 0.5);
        y.set((e.clientY - rect.top) / rect.height - 0.5);
    };

    return (
        <motion.div
            onMouseMove={handleMouseMove}
            onMouseLeave={() => { x.set(0); y.set(0); }}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="group relative h-[500px] rounded-[4rem] border border-border/50 bg-card/40 backdrop-blur-3xl overflow-hidden shadow-2xl"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div style={{ transform: "translateZ(50px)", transformStyle: "preserve-3d" }} className="h-full p-12 flex flex-col justify-between relative z-10">
                <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${color} flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                    <Icon className="w-10 h-10 text-white" />
                </div>
                <div className="space-y-6">
                    <h3 className="text-4xl font-black text-foreground leading-none">{title}</h3>
                    <p className="text-xl text-muted-foreground font-medium pr-8">{desc}</p>
                </div>
                <div className="absolute top-1/2 right-12 opacity-5 group-hover:opacity-20 transition-opacity">
                    <Icon className="w-40 h-40" />
                </div>
            </div>
        </motion.div>
    );
};

export default function FeaturesPage() {
    return (
        <main className="min-h-screen bg-background relative overflow-hidden transition-colors duration-500">
            <Header />
            
            <div className="container mx-auto px-4 py-32 relative z-10">
                <div className="max-w-4xl mx-auto text-center mb-32">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center px-4 py-2 space-x-2 rounded-full bg-primary/5 text-primary border border-primary/10 mb-8"
                    >
                        <Layers className="w-4 h-4" />
                        <span className="text-sm font-black uppercase tracking-widest">Platform DNA</span>
                    </motion.div>
                    
                    <h1 className="text-6xl md:text-9xl font-black text-foreground tracking-tightest leading-[0.8] mb-12">
                        Next-Gen <br />
                        <span className="text-gradient">Capabilities.</span>
                    </h1>
                    <p className="text-2xl text-muted-foreground font-medium max-w-2xl mx-auto">
                        We&apos;ve built a testing engine that feels less like a quiz and more like a high-performance simulation. Discover the technology driving 98.4% accuracy.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
                    <FeatureCard 
                        title="3D Spatial Intelligence"
                        desc="Interact with cognitive modules in a tactile, 3D environment. We measure not just what you choose, but how you navigate space and resolve puzzles."
                        icon={Box}
                        color="from-blue-600 to-cyan-400"
                    />
                    <FeatureCard 
                        title="Adaptive AI Core"
                        desc="Our engine adjusts the complexity of challenges in real-time based on your response speed, ensuring we find the exact ceiling of your cognitive potential."
                        icon={Cpu}
                        color="from-purple-600 to-pink-500"
                    />
                    <FeatureCard 
                        title="Bio-Mechanical Sync"
                        desc="We analyze micro-interactions—how you move your mouse, how long you hesitate—to identify confidence levels and innate behavioral traits."
                        icon={MousePointer2}
                        color="from-orange-500 to-amber-400"
                    />
                    <FeatureCard 
                        title="Massive Industry Mapping"
                        desc="Your results are instantly cross-referenced with a dynamic database of 500+ modern careers, filtered by global demand and growth potential."
                        icon={Layout}
                        color="from-green-500 to-emerald-400"
                    />
                </div>

                {/* Technical Specs Summary */}
                <div className="mt-48 text-center bg-card/30 p-12 md:p-24 rounded-[4rem] border border-border/50 backdrop-blur-2xl">
                    <h3 className="text-4xl md:text-6xl font-black text-foreground mb-16 tracking-tighter uppercase">Technical <span className="text-muted-foreground/20">Specs</span></h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-16">
                        {[
                            { label: "Rendering", value: "60 FPS" },
                            { label: "Latency", value: "<15ms" },
                            { label: "Data Points", value: "2.5k+" },
                            { label: "Platform", value: "Cloud-Native" }
                        ].map((spec, idx) => (
                            <div key={idx} className="space-y-2 border-l border-border/50 pl-8 text-left">
                                <p className="text-sm font-black uppercase tracking-widest text-primary">{spec.label}</p>
                                <p className="text-4xl font-black text-foreground tracking-tighter">{spec.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Footer />
            
            {/* Background Decor */}
            <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-[20%] left-[10%] w-[400px] h-[400px] bg-accent-purple/5 rounded-full blur-[120px]" />
            </div>
        </main>
    );
}
