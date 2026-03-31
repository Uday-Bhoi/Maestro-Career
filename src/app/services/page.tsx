"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion, useTransform, useSpring, useMotionValue } from "framer-motion";
import { Brain as BrainIcon, Target, SearchCode, Sparkles, ArrowRight } from "lucide-react";
import React from "react";

const TiltCard = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ rotateY, rotateX, transformStyle: "preserve-3d" }}
      className={`relative rounded-[2.5rem] group transition-all duration-500 ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-vibe-pink/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem]" />
      <div style={{ transform: "translateZ(50px)", transformStyle: "preserve-3d" }} className="h-full w-full relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default function ServicesPage() {
  const services = [
    { 
        title: "Cognitive Assessment", 
        description: "Move beyond simple personality tests. We decode the deep-seated cognitive patterns that define how you process logic, creativity, and decisions.", 
        icon: BrainIcon,
        color: "text-vibe-blue",
        bg: "bg-vibe-blue/10"
    },
    { 
        title: "Architectural AI Mapping", 
        description: "Our proprietary AI engine maps your cognitive DNA to 500+ modern industries, identifying roles that didn't even exist five years ago.", 
        icon: Target,
        color: "text-vibe-purple",
        bg: "bg-vibe-purple/10"
    },
    { 
        title: "Precision Gap Analysis", 
        description: "We don't just find your destination; we build the bridge. Get a precise list of missing skills and certifications needed to launch your career.", 
        icon: SearchCode,
        color: "text-vibe-pink",
        bg: "bg-vibe-pink/10"
    },
  ];

  return (
    <main className="min-h-screen bg-background relative overflow-hidden transition-colors duration-500">
      <Header />
      
      {/* Ambient background energy */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
          <div className="absolute top-[10%] left-[5%] w-[40rem] h-[40rem] bg-vibe-blue/5 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-[10%] right-[5%] w-[35rem] h-[35rem] bg-vibe-purple/5 rounded-full blur-[120px] animate-pulse [animation-delay:1s]" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 py-48 lg:py-64 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-40">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center px-6 py-2 bg-foreground text-background mb-10 rounded-full"
            >
                <Sparkles className="w-3.5 h-3.5 mr-3 text-vibe-pink" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">SYSTEM.SERVICES</span>
            </motion.div>
            
            <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-7xl md:text-9xl font-black tracking-tightest leading-[0.85] mb-12 uppercase text-gradient"
            >
                Solutions for <br />
                <span>The Future.</span>
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl md:text-2xl text-foreground/50 font-bold max-w-2xl mx-auto uppercase tracking-tighter"
            >
                Maestro is more than a platform; it&apos;s a high-precision career architect. We combine science and data to illuminate your professional clarity.
            </motion.p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
          {services.map((s, i) => (
            <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
            >
                <TiltCard className="bg-secondary/20 border border-foreground/5 hover:border-primary/20 hover:shadow-2xl h-full backdrop-blur-md">
                  <div className="h-full w-full p-12 flex flex-col justify-between min-h-[480px]">
                    <div>
                       <div className={`w-20 h-20 ${s.bg} flex items-center justify-center mb-10 rounded-3xl shadow-lg border border-white/5`}>
                         <s.icon className={`w-10 h-10 ${s.color}`} />
                       </div>
                       <h2 className="text-4xl font-black mb-8 text-foreground uppercase tracking-tightest leading-none group-hover:text-primary transition-colors">{s.title}</h2>
                       <p className="text-sm text-foreground/40 font-bold uppercase tracking-widest leading-relaxed">{s.description}</p>
                    </div>
                    
                    <motion.div 
                        whileHover={{ x: 10 }}
                        className="mt-16 flex items-center space-x-4 font-black text-[11px] uppercase tracking-[0.4em] text-foreground/30 cursor-pointer hover:text-primary transition-colors"
                    >
                        <span>System.View_Details</span>
                        <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  </div>
                </TiltCard>
            </motion.div>
          ))}
        </div>

        {/* Phase Breakdown Detail */}
        <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-72 rounded-[4rem] bg-secondary/10 p-16 md:p-32 border border-foreground/5 relative overflow-hidden group shadow-3d"
        >
            <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-primary/5 to-transparent -z-10 group-hover:from-vibe-purple/10 transition-all duration-1000" />
            
            <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-32 gap-12">
                <h3 className="text-6xl md:text-8xl font-black text-foreground uppercase tracking-tightest leading-[0.85] flex-1">
                    The <br />
                    <span className="text-primary italic">Advantage.</span>
                </h3>
                <p className="text-sm font-bold uppercase tracking-widest text-foreground/40 max-w-sm lg:mb-4">
                    High-fidelity psychometric systems designed to eliminate industry friction and individual misalignment.
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-20">
                {[
                    { label: "Accuracy", value: "98.4%", color: "text-vibe-blue" },
                    { label: "Database", value: "500+", color: "text-vibe-purple" },
                    { label: "Duration", value: "45m", color: "text-vibe-emerald" },
                    { label: "Impact", value: "15k", color: "text-vibe-pink" }
                ].map((item, idx) => (
                    <motion.div
                        key={idx}
                        whileInView={{ opacity: 1, y: 0 }}
                        initial={{ opacity: 0, y: 30 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        className="space-y-6"
                    >
                        <p className={`text-7xl font-black tracking-tightest leading-none ${item.color}`}>{item.value}</p>
                        <div className="h-px w-10 bg-foreground/10" />
                        <p className="text-[11px] font-black uppercase tracking-[0.5em] text-foreground/20">{item.label}</p>
                    </motion.div>
                ))}
            </div>
        </motion.div>
      </div>
      
      <Footer />
    </main>
  );
}

