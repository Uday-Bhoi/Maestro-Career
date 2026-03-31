"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

export default function ProblemSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const xLeftRaw = useTransform(scrollYProgress, [0, 0.4], [-100, 0]);
  const xRightRaw = useTransform(scrollYProgress, [0, 0.4], [100, 0]);
  const scaleRaw = useTransform(scrollYProgress, [0, 0.4], [0.8, 1]);
  
  const xLeft = useSpring(xLeftRaw, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const xRight = useSpring(xRightRaw, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const scale = useSpring(scaleRaw, { stiffness: 100, damping: 30, restDelta: 0.001 });
  
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.8, 1], [0, 1, 1, 0]);

  const struggles = [
    "Endless degree options, zero clarity.",
    "Parental pressure vs. Personal passion.",
    "Is my dream career even 'future-proof'?",
    "Why does choosing a path feel like a gamble?"
  ];

  return (
    <section 
      id="problem"
      ref={sectionRef}
      className="relative min-h-screen flex items-center py-32 overflow-hidden bg-background transition-colors duration-500"
    >
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            
            {/* Left Side: Emotional Narrative */}
            <motion.div style={{ opacity, x: xLeft }} className="space-y-16">
              <div className="space-y-8">
                <h2 className="text-6xl md:text-8xl font-black tracking-tightest leading-[0.85] text-foreground uppercase">
                  The <span className="opacity-20 italic">Weight</span> <br />
                  of Every <br />
                  Decision.
                </h2>
                <p className="text-xl md:text-2xl text-foreground/40 font-bold max-w-lg leading-relaxed uppercase tracking-tight">
                  For many, the future isn&apos;t a roadmap&mdash;it&apos;s a heavy silence. 
                  The pressure to decide your entire life by 18 is real, and often leads to the wrong path.
                </p>
              </div>

              <div className="grid gap-6">
                {struggles.map((struggle, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: 0.1 * idx }}
                    className="flex items-center space-x-6 p-6 bg-secondary/50 border border-foreground/5 hover:border-foreground/10 transition-all"
                  >
                    <div className="w-1.5 h-1.5 bg-foreground" />
                    <span className="text-sm font-black uppercase tracking-widest text-foreground/60">
                      {struggle}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Side: Architectural Imagery */}
            <motion.div 
              style={{ opacity, scale, x: xRight }}
              className="relative"
            >
              <div className="relative aspect-square overflow-hidden shadow-2xl bg-secondary border border-foreground/5">
                <Image 
                  src="/images/problem_student.png" 
                  alt="Choice" 
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-[3000ms] hover:scale-110"
                />
                
                {/* Floating Architectural Quote */}
                <motion.div 
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-12 left-12 right-12 bg-foreground text-background p-10 shadow-3xl"
                >
                  <p className="text-2xl font-black italic tracking-tightest leading-tight">
                    &ldquo;I just want to know if I&apos;m making the right decision for my life, not just for a degree.&rdquo;
                  </p>
                  <div className="mt-8 flex items-center space-x-4">
                    <div className="h-px w-12 bg-background/20" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-50 text-background">Grade 12 Student</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>

          </div>
        </div>

      {/* Background Story Label */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 -rotate-90 origin-left opacity-5 pointer-events-none">
        <span className="text-[150px] font-black uppercase tracking-tighter select-none">STRESSES</span>
      </div>
    </section>
  );
}
