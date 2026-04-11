"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function LoadingScreen() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(timer);
                    return 100;
                }
                return prev + 1;
            });
        }, 20);
        return () => clearInterval(timer);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
        >
            {/* Architectural Background Blobs */}
            <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        x: [0, 50, 0],
                        y: [0, 30, 0]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-vibe-blue/10 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        x: [0, -50, 0],
                        y: [0, -30, 0]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[-10%] right-[-10%] w-[35rem] h-[35rem] bg-vibe-purple/10 rounded-full blur-[120px]"
                />
            </div>

            <div className="relative z-10 flex w-full max-w-[26rem] flex-col items-center px-6">
                {/* Logo Animation */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mb-12 relative"
                >
                    <div className="w-24 h-24 bg-foreground rounded-[2rem] flex items-center justify-center shadow-3d overflow-hidden">
                        <Image
                            src="/maestro_logo_only.png"
                            alt="Maestro Logo"
                            width={50}
                            height={50}
                            className="object-contain brightness-0 invert"
                        />
                    </div>
                    {/* Pulsing Ring */}
                    <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 border-2 border-primary/20 rounded-[2rem]"
                    />
                </motion.div>

                {/* Progress Narrative */}
                <div className="w-full space-y-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-foreground/40 mb-2">Systems.Initialize</h2>
                        <h3 className="text-xl font-black tracking-tightest uppercase text-foreground">
                            Decoding Your <span className="text-primary italic">Professional DNA</span>
                        </h3>
                    </motion.div>

                    {/* Minimal Progress Bar */}
                    <div className="mx-auto h-1.5 w-full rounded-full bg-foreground/5 overflow-hidden">
                        <motion.div
                            className="h-full rounded-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.1, ease: "linear" }}
                        />
                    </div>

                    <div className="flex justify-center">
                        <span className="text-[8px] font-black uppercase tracking-widest text-foreground/20">{progress}% Completed</span>
                    </div>
                </div>
            </div>

            {/* Bottom Status Label */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-20">
                <span className="text-[10px] font-black uppercase tracking-[0.8em] select-none">MAESTRO CAREER 2026</span>
            </div>
        </motion.div>
    );
}
