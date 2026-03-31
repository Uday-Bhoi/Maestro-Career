"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Sparkles, Brain, Gamepad2, MousePointer2 } from "lucide-react";
import React from "react";

const TiltCard = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
      }}
      className={`relative rounded-[3rem] ${className}`}
    >
      <div 
        style={{ transform: "translateZ(75px)", transformStyle: "preserve-3d" }}
        className="h-full w-full"
      >
        {children}
      </div>
    </motion.div>
  );
};

export default function InteractiveSection() {
  return (
    <section id="interactive" className="relative py-32 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-24 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center px-4 py-2 space-x-2 rounded-full bg-primary/5 text-primary border border-primary/10 mb-8"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-black uppercase tracking-widest">The Playroom</span>
          </motion.div>
          <h2 className="text-6xl md:text-8xl font-black text-foreground tracking-tighter leading-none mb-8">
            Experience <br />
            <span className="text-gradient">The Un-Test.</span>
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto">
            Traditional tests are boring. Our journey is a tactile, 3D experience designed for the way you naturally think.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
          
          {/* Tilt Card 1: Gamified Reveal */}
          <TiltCard className="h-[450px] bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 group">
            <div className="h-full w-full glass p-10 flex flex-col justify-between">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Gamepad2 className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-black text-foreground">Interactive DNA</h3>
                <p className="text-lg text-muted-foreground font-medium">
                  Watch your results evolve in real-time as you complete gamified modules.
                </p>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                 <MousePointer2 className="w-20 h-20 text-primary/30 rotate-12" />
              </div>
            </div>
          </TiltCard>

          {/* Tilt Card 2: 3D Visualization */}
          <TiltCard className="h-[450px] bg-gradient-to-br from-accent-purple/10 to-transparent border border-accent-purple/20">
            <div className="h-full w-full glass p-10 flex flex-col justify-between">
              <div className="w-16 h-16 rounded-2xl bg-accent-purple/20 flex items-center justify-center">
                <Brain className="w-8 h-8 text-accent-purple" />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-black text-foreground">Spatial Analysis</h3>
                <p className="text-lg text-muted-foreground font-medium">
                  We measure cognitive speed, logic, and creativity through spatial puzzles.
                </p>
              </div>
              <div className="absolute inset-0 bg-accent-purple/5 -z-10 blur-3xl rounded-full" />
            </div>
          </TiltCard>

          {/* Tilt Card 3: Micro-Quiz Preview */}
          <TiltCard className="h-[450px] bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 md:hidden lg:block">
            <div className="h-full w-full glass p-10 flex flex-col justify-between overflow-hidden">
               <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-widest text-orange-500">Quick Check</span>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4].map(i => <div key={i} className="w-6 h-1 rounded-full bg-orange-500/20" />)}
                    </div>
                  </div>
                  <h3 className="text-3xl font-black text-foreground leading-tight">What drives you most?</h3>
                  <div className="space-y-3">
                    {["Solving Complex Puzzles", "Leading Dynamic Teams", "Creating Visual Art"].map((opt, i) => (
                      <motion.div 
                        key={i}
                        whileHover={{ x: 10 }}
                        className="p-4 rounded-xl bg-background/50 border border-orange-500/10 text-sm font-bold cursor-pointer hover:border-orange-500/40 transition-colors"
                      >
                        {opt}
                      </motion.div>
                    ))}
                  </div>
               </div>
               <p className="text-sm text-muted-foreground font-black uppercase tracking-widest mt-4">Demo Active</p>
            </div>
          </TiltCard>

        </div>
      </div>
      
      {/* Background Decor */}
      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-border to-transparent -z-10" />
      <div className="absolute left-1/2 top-0 w-[1px] h-full bg-gradient-to-b from-transparent via-border to-transparent -z-10" />
    </section>
  );
}
