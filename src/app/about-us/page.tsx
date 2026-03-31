"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion, useScroll, useTransform } from "framer-motion";
import { Globe, Zap, Heart } from "lucide-react";
import React, { useRef } from "react";
import Image from "next/image";

export default function AboutPage() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <main ref={containerRef} className="min-h-screen bg-background relative overflow-hidden transition-colors duration-500">
      <Header />

      {/* Hero Narrative Section */}
      <section className="relative py-48 flex items-center justify-center overflow-hidden">
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center px-6 py-2 bg-foreground text-background mb-10"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">SYSTEM.STORY</span>
            </motion.div>

            <h1 className="text-7xl md:text-9xl font-black text-foreground tracking-tightest leading-[0.82] mb-16 uppercase">
              Beyond <br />
              <span>The Resume.</span>
            </h1>

            <div className="grid md:grid-cols-2 gap-20 text-left">
              <p className="text-xl md:text-2xl text-foreground/40 font-bold leading-relaxed uppercase tracking-tight">
                Maestro Career was born from a simple realization: the traditional career advice model is broken. It ignores the dynamic nature of the human brain.
              </p>
              <div className="border-l-2 border-foreground/10 pl-10">
                <p className="text-lg text-foreground font-black italic leading-tight uppercase tracking-tightest mb-6">
                  &quot;We don&apos;t just find you a job. We help you decode the professional identity you didn&apos;t even know you had.&quot;
                </p>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-20">SYSTEM PHILOSOPHY</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Dynamic Background Wash */}
        <motion.div
          style={{ y: y1, opacity }}
          className="absolute top-0 left-0 w-full h-full -z-10 opacity-30 select-none pointer-events-none flex items-center justify-center"
        >
          <span className="text-[30rem] font-black text-foreground/5 leading-none absolute -rotate-90">MAESTRO</span>
        </motion.div>
      </section>

      {/* Values Grid */}
      <section className="py-48 bg-secondary/20 border-y border-foreground/5">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-5xl md:text-7xl font-black text-foreground tracking-tightest mb-24 text-center uppercase">Our Core <span className="opacity-20 italic">DNA.</span></h2>

            <div className="grid md:grid-cols-3 gap-16">
              {[
                {
                  title: "Neuro-First",
                  desc: "Everything we do starts with the cognitive science of career fulfillment.",
                  icon: Zap,
                },
                {
                  title: "Human Centric",
                  desc: "Interactive technology designed to feel natural, not clinical.",
                  icon: Heart,
                },
                {
                  title: "Future Ready",
                  desc: "Constantly evolving mapping engines to keep pace with the 2030+ workforce.",
                  icon: Globe,
                }
              ].map((val, i) => (
                <motion.div
                  key={i}
                  whileInView={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 30 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: 0.2 * i }}
                  className="space-y-8 group"
                >
                  <div className="w-16 h-16 bg-foreground/10 flex items-center justify-center transition-all group-hover:bg-foreground group-hover:text-background text-foreground">
                    <val.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-3xl font-black text-foreground leading-none uppercase tracking-tight">{val.title}</h3>
                  <p className="text-sm text-foreground/40 font-bold uppercase tracking-widest leading-relaxed">{val.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Meet Our Founders Section */}
      <section className="py-64 relative overflow-hidden bg-background">
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-40 space-y-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center px-6 py-2 bg-foreground text-background"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">SYSTEM.LEADERSHIP</span>
              </motion.div>
              <h2 className="text-7xl md:text-9xl font-black text-foreground tracking-tightest leading-none uppercase italic">
                Founding <br />
                <span>Precision.</span>
              </h2>
              <p className="text-xl md:text-2xl text-foreground/40 font-bold max-w-2xl mx-auto uppercase tracking-tighter">
                Guided by experienced leaders with decades of industry expertise and a passion for mentoring.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-20">
              {/* Vikas Manwatkar */}
              <motion.div
                whileHover={{ y: -10 }}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="bg-secondary/30 border border-foreground/5 p-12 lg:p-16 relative overflow-hidden group shadow-2xl"
              >
                <div className="flex flex-col items-center text-center lg:items-start lg:text-left h-full">
                  <div className="relative w-48 h-48 mb-12 shadow-3xl bg-secondary border border-foreground/10 overflow-hidden">
                    <Image
                      src="/images/vikas.png"
                      alt="Vikas Manwatkar"
                      fill
                      sizes="(max-width: 768px) 192px, 192px"
                      className="object-cover transition-all duration-700 hover:scale-105"
                    />
                  </div>

                  <div className="space-y-8 flex-1">
                    <div>
                      <h3 className="text-4xl font-black text-foreground tracking-tightest uppercase">Vikas Manwatkar</h3>
                      <p className="text-sm font-black text-foreground/40 uppercase tracking-widest mt-2 italic">Founder</p>
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/20 mt-4 leading-relaxed">Business Leadership Coach | Design Thinker</p>
                    </div>

                    <div className="h-px w-16 bg-foreground/10" />

                    <p className="text-sm text-foreground/40 font-bold leading-relaxed uppercase tracking-widest pr-4">
                      A seasoned business leadership coach with over 20 years of expertise in supply chain management, data analytics, and digital transformation at Tata, Infosys, and IBM.
                    </p>

                    <ul className="space-y-4">
                      {[
                        "Visiting faculty at IITs and NITs",
                        "Expert in Industry 4.0 and digital transformation",
                        "Specialized in psychometric career assessment",
                        "Mentored 1000+ students and professionals"
                      ].map((item, idx) => (
                        <li key={idx} className="flex items-center space-x-4 text-[10px] font-black uppercase tracking-[0.25em] text-foreground/60">
                          <div className="w-1 h-1 bg-foreground" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>

              {/* Ashutosh Tewari */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="bg-secondary/30 border border-foreground/5 p-12 lg:p-16 relative overflow-hidden group shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                <div className="flex flex-col items-center text-center lg:items-start lg:text-left h-full">
                  <div className="relative w-48 h-48 mb-12 shadow-3xl bg-secondary border border-foreground/10 overflow-hidden">
                    <Image
                      src="/images/ashutosh.png"
                      alt="Ashutosh Tewari"
                      fill
                      sizes="(max-width: 768px) 192px, 192px"
                      className="object-cover transition-all duration-700 hover:scale-105"
                    />
                  </div>

                  <div className="space-y-8 flex-1">
                    <div>
                      <h3 className="text-4xl font-black text-foreground tracking-tightest uppercase">Ashutosh Tewari</h3>
                      <p className="text-sm font-black text-foreground/40 uppercase tracking-widest mt-2 italic">Co-Founder</p>
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/20 mt-4 leading-relaxed">Career Coach | Startup Mentor | PhD Scholar</p>
                    </div>

                    <div className="h-px w-16 bg-foreground/10" />

                    <p className="text-sm text-foreground/40 font-bold leading-relaxed uppercase tracking-widest pr-4">
                      A Career Coach and Startup Mentor with 17+ years across IT Services and Management Consulting. A PhD Scholar focused on high-impact Social Innovation.
                    </p>

                    <ul className="space-y-4">
                      {[
                        "Certified Behaviour & Mentoring Analyst",
                        "Coached 1,000+ individuals",
                        "Mentored 100+ startups",
                        "Associated with Startup India & E-Cell IIT Bombay"
                      ].map((item, idx) => (
                        <li key={idx} className="flex items-center space-x-4 text-[10px] font-black uppercase tracking-[0.25em] text-foreground/60">
                          <div className="w-1 h-1 bg-foreground" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Team CTA */}
      <section className="py-48 text-center bg-foreground text-background">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto space-y-16">
            <h2 className="text-6xl md:text-9xl font-black tracking-tightest leading-[0.82] uppercase mb-12">
              Join the <br />
              <span>Revolution.</span>
            </h2>
            <p className="text-xl md:text-2xl font-bold uppercase tracking-tighter opacity-50">
              We&apos;re building a world where the word &apos;work&apos; is synonymous with &apos;purpose&apos;. Join the 15k+ community.
            </p>
            <div className="flex justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-16 py-8 bg-background text-foreground font-black text-sm uppercase tracking-[0.5em] transition-all"
              >
                Initialize Journey
              </motion.button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
