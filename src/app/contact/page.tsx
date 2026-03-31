"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InquiryForm from "@/components/InquiryForm";
import { motion } from "framer-motion";
import { Mail, MapPin, MessageSquare, Headphones } from "lucide-react";
import React from "react";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden transition-colors duration-500">
      <Header />
      
      <div className="container mx-auto px-4 py-32 relative z-10">
        <div className="max-w-6xl mx-auto">
          
          <div className="grid lg:grid-cols-2 gap-24 items-center mb-32">
            {/* Left side: Narrative & Contact Info */}
            <div className="space-y-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center px-4 py-2 space-x-2 rounded-full bg-primary/5 text-primary border border-primary/10"
              >
                <Headphones className="w-4 h-4" />
                <span className="text-sm font-black uppercase tracking-widest">Support Portal</span>
              </motion.div>
              
              <h1 className="text-6xl md:text-8xl font-black text-foreground tracking-tightest leading-[0.8] mb-8">
                Let&apos;s <br />
                <span className="text-gradient">Connect.</span>
              </h1>
              
              <p className="text-2xl text-muted-foreground font-medium max-w-lg">
                Whether you&apos;re a curious student or a potential partner, our team of career architects is ready to help you navigate the future.
              </p>

              <div className="space-y-8">
                {[
                  { icon: Mail, label: "Email Us", value: "hello@maestrocareer.com", color: "text-blue-500" },
                  { icon: MessageSquare, label: "Live Support", value: "Available 9am - 6pm EST", color: "text-purple-500" },
                  { icon: MapPin, label: "Global HQ", value: "Innovation Nexus, SF, CA", color: "text-orange-500" }
                ].map((item, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    className="flex items-center space-x-6 p-6 rounded-3xl bg-card/40 border border-border/50 hover:bg-card/60 transition-all group cursor-pointer"
                  >
                    <div className={`w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <item.icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">{item.label}</p>
                      <p className="text-xl font-bold text-foreground">{item.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right side: The Form */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-primary/10 blur-[120px] rounded-full -z-10 animate-pulse-slow" />
              <InquiryForm />
            </motion.div>
          </div>

          {/* Bottom FAQ Preview */}
          <div className="text-center bg-card/30 p-12 md:p-24 rounded-[4rem] border border-border/50 backdrop-blur-2xl">
             <h3 className="text-4xl md:text-5xl font-black text-foreground mb-12 tracking-tighter">Frequently Asked <span className="text-muted-foreground/20">Questions.</span></h3>
             <div className="grid md:grid-cols-2 gap-8 text-left max-w-4xl mx-auto">
                <div>
                   <h4 className="text-lg font-black text-primary mb-2 italic">How long does the assessment take?</h4>
                   <p className="text-muted-foreground font-medium">Most students complete our 3D interactive journey in 45-60 minutes.</p>
                </div>
                <div>
                   <h4 className="text-lg font-black text-primary mb-2 italic">Is there a free version available?</h4>
                   <p className="text-muted-foreground font-medium">Yes, our Basic Discovery module is 100% free for first-time explorers.</p>
                </div>
             </div>
          </div>

        </div>
      </div>

      <Footer />

      {/* Decorative Blobs */}
      <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] right-[15%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[40%] left-[5%] w-[300px] h-[300px] bg-accent-purple/5 rounded-full blur-[120px]" />
      </div>
    </main>
  );
}
