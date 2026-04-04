"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Sparkles, ShieldCheck, ArrowRight, Lock, User } from "lucide-react";

export default function AdminLoginPage() {
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        // Required credentials
        if (userId === "maestrocareer" && password === "m") {
            // Simple session management for task purposes
            localStorage.setItem("admin_session", "true");
            router.push("/admin/dashboard");
        } else {
            setError("Security mismatch. Please re-authenticate.");
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#050B15] selection:bg-primary/30">
            <Header />

            <div className="relative min-h-[90vh] flex flex-col items-center justify-center p-4">
                {/* Background Kinetic FX */}
                <div className="absolute top-1/4 left-1/4 w-[30rem] h-[30rem] bg-primary/20 rounded-full blur-[120px] mix-blend-screen animate-pulse pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-accent-purple/10 rounded-full blur-[120px] mix-blend-screen animate-pulse pointer-events-none" />

                <div className="relative w-full max-w-xl z-10">
                    <div className="rounded-[3rem] border border-white/10 bg-black/40 backdrop-blur-3xl p-12 md:p-20 shadow-3xl shadow-primary/5 text-center overflow-hidden">

                        <div className="mb-12 inline-flex items-center gap-4 px-6 py-3 bg-white/5 rounded-full border border-white/10 shadow-inner">
                            <ShieldCheck className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50">Admin Interface v4.0</span>
                        </div>

                        <div className="mb-16">
                            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tightest leading-none uppercase italic">
                                Control <span className="text-primary">Center</span>
                            </h1>
                            <p className="mt-4 text-white/30 font-bold uppercase tracking-[0.2em] text-xs">Enter your authorization credentials</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-8">
                            <div className="space-y-3 text-left">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Digital Signature ID</label>
                                <div className="relative">
                                    <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                    <input
                                        type="text"
                                        value={userId}
                                        onChange={(e) => setUserId(e.target.value)}
                                        className="w-full rounded-2xl border border-white/5 bg-white/[0.03] pl-14 pr-6 py-6 focus:bg-white/[0.05] focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-white uppercase placeholder:text-white/10"
                                        placeholder="USER ID"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 text-left">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Cryptographic Key</label>
                                <div className="relative">
                                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full rounded-2xl border border-white/5 bg-white/[0.03] pl-14 pr-6 py-6 focus:bg-white/[0.05] focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-white placeholder:text-white/10"
                                        placeholder="••••••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-widest animate-shake">
                                    {error}
                                </div>
                            )}

                            <button
                                disabled={loading}
                                className="w-full group relative overflow-hidden rounded-[1.5rem] bg-primary hover:bg-primary-dark text-white font-black uppercase tracking-[0.4em] text-[10px] py-7 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 shadow-2xl shadow-primary/40"
                            >
                                {loading ? "Synchronizing..." : (
                                    <div className="flex items-center justify-center gap-3">
                                        Grant Access <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                                    </div>
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="mt-12 text-center">
                        <p className="text-white/10 text-[9px] font-bold uppercase tracking-[0.5em] select-none">
                            Secured by Maestro Career Cyber-Intelligence
                        </p>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
