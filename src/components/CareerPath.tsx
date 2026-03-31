"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useRef } from "react";
import { ClipboardList, BrainCircuit, Lightbulb, Rocket, Sparkles } from "lucide-react";

export default function HowItWorks() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const steps = [
    {
      title: "Take The Deep-Dive",
      desc: "An immersive 45-minute psychometric journey that goes beyond superficial interests.",
      icon: ClipboardList,
      color: "from-blue-500 to-cyan-400",
      detail: "Phase 01: Assessment"
    },
    {
      title: "Decode Your DNA",
      desc: "Our engine analyzes cognitive patterns, value systems, and hidden potentials.",
      icon: BrainCircuit,
      color: "from-purple-600 to-blue-500",
      detail: "Phase 02: Processing"
    },
    {
      title: "Get The Roadmap",
      desc: "Receive a personalized, data-driven report with direct industry alignments.",
      icon: Lightbulb,
      color: "from-orange-500 to-amber-400",
      detail: "Phase 03: Insights"
    },
    {
      title: "Launch Future",
      desc: "Connect with mentors and actionable steps to start your new professional path.",
      icon: Rocket,
      color: "from-emerald-500 to-green-400",
      detail: "Phase 04: Ignition"
    }
  ];

  return (
    <section 
      ref={containerRef}
      className="relative py-32 overflow-hidden bg-background will-change-transform"
    >
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-24 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center px-4 py-2 space-x-2 rounded-full bg-primary/5 text-primary border border-primary/10 mb-8"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-black uppercase tracking-widest">The Blueprint</span>
            </motion.div>
            <h2 className="text-6xl md:text-8xl font-black text-foreground tracking-tighter leading-none mb-8">
              How It <span className="text-gradient">Flows.</span>
            </h2>
          </div>

          <div className="relative">
            {/* Main Vertical/Mobile Line */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-border rounded-full lg:block hidden">
              <motion.div 
                style={{ scaleY: smoothProgress, originY: 0 }}
                className="w-full h-full bg-gradient-to-b from-primary via-accent-purple to-accent-orange"
              />
            </div>

            <div className="space-y-32">
              {steps.map((step, idx) => {
                const isEven = idx % 2 === 0;
                return (
                  <div key={idx} className={`flex flex-col lg:flex-row items-center justify-between gap-12 ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                    
                    {/* Content Corner */}
                    <motion.div 
                      initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ margin: "-100px" }}
                      className={`w-full lg:w-[42%] ${isEven ? 'lg:text-right' : 'lg:text-left'}`}
                    >
                      <span className={`text-sm font-black uppercase tracking-[0.3em] mb-4 block bg-gradient-to-r ${step.color} bg-clip-text text-transparent`}>
                        {step.detail}
                      </span>
                      <h3 className="text-4xl md:text-5xl font-black text-foreground mb-6 leading-none">
                        {step.title}
                      </h3>
                      <p className="text-xl text-muted-foreground font-medium leading-relaxed">
                        {step.desc}
                      </p>
                    </motion.div>

                    {/* Center Icon Node */}
                    <div className="relative z-10 flex items-center justify-center">
                      <motion.div
                        whileInView={{ scale: [0, 1.2, 1], rotate: [0, 10, 0] }}
                        viewport={{ margin: "-100px" }}
                        className={`w-28 h-28 rounded-[2.5rem] bg-gradient-to-br ${step.color} p-1 shadow-2xl group transition-transform`}
                      >
                         <div className="w-full h-full bg-card rounded-[2.4rem] flex items-center justify-center">
                           <step.icon className={`w-12 h-12 bg-gradient-to-br ${step.color} bg-clip-text text-transparent`} />
                         </div>
                      </motion.div>
                      
                      {/* Mobile Line extension */}
                      <div className="absolute top-28 w-1 h-32 bg-border lg:hidden" />
                    </div>

                    {/* Perspective Decoration */}
                    <div className="hidden lg:block w-[42%]" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Dynamic Background label */}
      <div className="absolute top-1/4 right-0 opacity-5 pointer-events-none rotate-90 select-none">
        <span className="text-[120px] font-black uppercase tracking-tighter">PROGRESSION</span>
      </div>
    </section>
  );
}
