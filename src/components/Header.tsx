"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X, Sun, Moon, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();
    const pathname = usePathname();
    const isHome = pathname === "/";

    // Scroll Progress Logic
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    useEffect(() => setMounted(true), []);

    const navItems = [
        { name: 'Services', href: '/services' },
        { name: 'Solution', href: '/#solution' },
        { name: 'Pricing', href: '/#pricing' },
        { name: 'About Us', href: '/about-us' },
        { name: 'Contact', href: '/#contact' },
    ];

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (isHome && href.startsWith('/') && href.length > 1) {
            const id = href.substring(1);
            const element = document.getElementById(id);
            if (element) {
                e.preventDefault();
                element.scrollIntoView({ behavior: 'smooth' });
                setIsOpen(false);
            }
        }
    };

    if (!mounted) return null;

    return (
        <header className={`sticky top-0 z-50 w-full transition-all duration-300 bg-background/80 backdrop-blur-md border-b border-foreground/5 h-20 flex items-center`}>
            {/* Scroll Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-foreground origin-left z-[60]"
                style={{ scaleX }}
            />

            <div className="container mx-auto px-6 lg:px-12">
                <div className="flex items-center justify-between">
                    <div className="flex-shrink-0">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="relative w-12 h-12 overflow-hidden flex items-center justify-center transition-all bg-white dark:bg-transparent rounded-lg">
                                <Image 
                                    src="/maestro_logo_only.png" 
                                    alt="Logo" 
                                    width={32} 
                                    height={32}
                                    priority
                                    style={{ width: "32px", height: "auto" }}
                                    className="object-contain transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>
                            <span className="text-xl font-black tracking-tightest uppercase text-foreground leading-none">
                                Maestro <br />
                                <span className="text-sm font-bold opacity-30 text-foreground">Career</span>
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center space-x-10">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={(e) => handleNavClick(e, item.href)}
                                className="text-[13px] font-black uppercase tracking-widest text-foreground/40 hover:text-foreground transition-all"
                            >
                                {item.name}
                            </Link>
                        ))}

                        <div className="h-6 w-px bg-foreground/10" />

                        {/* Theme Toggle */}
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="p-2 text-foreground/60 hover:text-foreground transition-colors"
                        >
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </motion.button>

                        <Link
                            href="/auth"
                            className="flex items-center gap-2 px-6 py-3 bg-foreground text-background text-xs font-black uppercase tracking-widest hover:opacity-90 transition-opacity"
                        >
                            Get Started
                            <ArrowRight size={14} />
                        </Link>
                    </nav>

                    {/* Mobile control */}
                    <div className="md:hidden flex items-center gap-6">
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="p-2 text-foreground/60"
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 text-foreground"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Nav */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 w-full bg-background border-b border-foreground/10 md:hidden overflow-hidden z-50 shadow-2xl"
                    >
                        <div className="p-8 space-y-6 bg-background">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className="block text-2xl font-black uppercase tracking-tightest text-foreground hover:opacity-50 transition-opacity"
                                >
                                    {item.name}
                                </Link>
                            ))}
                            <div className="pt-6 border-t border-foreground/5 space-y-4">
                                <Link
                                    href="/auth"
                                    className="block w-full py-5 text-center font-black uppercase tracking-widest text-background bg-foreground text-sm"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Launch Platform
                                </Link>
                                <Link
                                    href="/dashboard"
                                    className="block w-full py-5 text-center font-black uppercase tracking-widest text-foreground border border-foreground/10 text-sm"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Dashboard
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
