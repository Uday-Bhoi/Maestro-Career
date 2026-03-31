"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X, Sun, Moon, ArrowRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";

interface MeResponse {
    success: boolean;
    data?: {
        profile: {
            name: string;
            email: string;
            mobile?: string;
            countryCode?: string;
            city?: string;
            userType?: "student" | "working_professional";
        };
    };
}

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [profileName, setProfileName] = useState("");
    const [profileEmail, setProfileEmail] = useState("");
    const [profileMobile, setProfileMobile] = useState("");
    const [profileCity, setProfileCity] = useState("");
    const [profileType, setProfileType] = useState("");
    const { theme, setTheme } = useTheme();
    const router = useRouter();
    const pathname = usePathname();
    const isHome = pathname === "/";
    const profileMenuRef = useRef<HTMLDivElement | null>(null);

    // Scroll Progress Logic
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        let alive = true;

        const loadAuthState = async () => {
            try {
                const response = await fetch("/api/auth/me", { method: "GET", cache: "no-store" });
                const data: MeResponse = await response.json();
                if (!alive) {
                    return;
                }

                if (response.ok && data.success && data.data?.profile) {
                    const profile = data.data.profile;
                    setIsAuthenticated(true);
                    setProfileName(profile.name || profile.email || "User");
                    setProfileEmail(profile.email || "-");
                    setProfileMobile(profile.mobile || "-");
                    setProfileCity(profile.city || "-");
                    setProfileType(profile.userType === "working_professional" ? "Working Professional" : profile.userType === "student" ? "Student" : "-");
                    return;
                }

                setIsAuthenticated(false);
                setProfileName("");
                setProfileEmail("");
                setProfileMobile("");
                setProfileCity("");
                setProfileType("");
            } catch {
                if (!alive) {
                    return;
                }
                setIsAuthenticated(false);
                setProfileName("");
                setProfileEmail("");
                setProfileMobile("");
                setProfileCity("");
                setProfileType("");
            } finally {
                if (alive) {
                    setAuthLoading(false);
                }
            }
        };

        loadAuthState();

        return () => {
            alive = false;
        };
    }, [pathname]);

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (!profileMenuRef.current) {
                return;
            }

            if (!profileMenuRef.current.contains(event.target as Node)) {
                setIsProfileMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, []);

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } finally {
            setIsProfileMenuOpen(false);
            setIsAuthenticated(false);
            router.push("/auth");
            router.refresh();
        }
    };

    const profileInitial = profileName.trim().charAt(0).toUpperCase() || "U";

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

                        {!authLoading && !isAuthenticated && (
                            <Link
                                href="/auth"
                                className="flex items-center gap-2 px-6 py-3 bg-foreground text-background text-xs font-black uppercase tracking-widest hover:opacity-90 transition-opacity"
                            >
                                Get Started
                                <ArrowRight size={14} />
                            </Link>
                        )}

                        {!authLoading && isAuthenticated && (
                            <div className="flex items-center gap-3" ref={profileMenuRef}>
                                <Link
                                    href="/dashboard"
                                    className="px-5 py-3 bg-foreground text-background text-xs font-black uppercase tracking-widest hover:opacity-90 transition-opacity"
                                >
                                    Dashboard
                                </Link>
                                <button
                                    type="button"
                                    aria-label="Open profile"
                                    title="Open profile"
                                    onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                                    className="h-10 w-10 rounded-full border border-foreground/20 text-foreground flex items-center justify-center text-sm font-black"
                                >
                                    {profileInitial}
                                </button>

                                <AnimatePresence>
                                    {isProfileMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.98 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.98 }}
                                            className="absolute right-12 top-[76px] w-72 rounded-2xl border border-foreground/10 bg-background p-4 shadow-2xl"
                                        >
                                            <p className="text-sm font-black text-foreground">{profileName || "User"}</p>
                                            <p className="mt-1 text-xs text-foreground/60">{profileEmail}</p>

                                            <div className="mt-4 space-y-2 rounded-xl border border-foreground/10 p-3 text-xs text-foreground/80">
                                                <p><span className="font-semibold">Mobile:</span> {profileMobile}</p>
                                                <p><span className="font-semibold">User Type:</span> {profileType}</p>
                                                <p><span className="font-semibold">City:</span> {profileCity}</p>
                                            </div>

                                            <div className="mt-4 grid gap-2">
                                                <Link
                                                    href="/dashboard"
                                                    onClick={() => setIsProfileMenuOpen(false)}
                                                    className="w-full rounded-lg border border-foreground/15 px-3 py-2 text-center text-xs font-bold uppercase tracking-wide text-foreground hover:bg-foreground/5"
                                                >
                                                    Open Profile
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={handleLogout}
                                                    className="w-full rounded-lg bg-red-600 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-red-700"
                                                >
                                                    Logout
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
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
                                {!authLoading && !isAuthenticated && (
                                    <Link
                                        href="/auth"
                                        className="block w-full py-5 text-center font-black uppercase tracking-widest text-background bg-foreground text-sm"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Launch Platform
                                    </Link>
                                )}
                                {!authLoading && isAuthenticated && (
                                    <>
                                        <Link
                                            href="/dashboard"
                                            className="block w-full py-5 text-center font-black uppercase tracking-widest text-background bg-foreground text-sm"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Dashboard
                                        </Link>
                                        <Link
                                            href="/dashboard"
                                            className="block w-full py-5 text-center font-black uppercase tracking-widest text-foreground border border-foreground/10 text-sm"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Profile
                                        </Link>
                                        <button
                                            type="button"
                                            className="block w-full py-5 text-center font-black uppercase tracking-widest text-white bg-red-600 text-sm"
                                            onClick={async () => {
                                                await handleLogout();
                                                setIsOpen(false);
                                            }}
                                        >
                                            Logout
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
