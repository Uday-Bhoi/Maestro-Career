"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AdminLoginPage() {
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const resp = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, password }),
            });
            const data = await resp.json();

            if (!resp.ok || !data.success) {
                throw new Error(data.message || "Security mismatch. Please re-authenticate.");
            }

            router.push("/admin/dashboard");
            router.refresh();
        } catch (loginError) {
            setError(loginError instanceof Error ? loginError.message : "Security mismatch. Please re-authenticate.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-background text-foreground selection:bg-primary/30 transition-colors duration-500">
            <Header />

            <div className="relative min-h-[90vh] flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="rounded-3xl border border-border/20 bg-card p-10 shadow-sm text-center">
                        <div className="mb-10">
                            <h1 className="text-3xl font-bold text-foreground">
                                Admin Login
                            </h1>
                            <p className="mt-2 text-foreground/60 text-sm">Enter your credentials to access the dashboard</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2 text-left">
                                <label className="block text-sm font-medium text-foreground/80">Username</label>
                                <input
                                    type="text"
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value)}
                                    className="w-full rounded-xl border border-border/30 bg-background px-4 py-3 text-sm focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition placeholder:text-foreground/40"
                                    placeholder="Enter username"
                                    required
                                />
                            </div>

                            <div className="space-y-2 text-left">
                                <label className="block text-sm font-medium text-foreground/80">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full rounded-xl border border-border/30 bg-background px-4 py-3 pr-12 text-sm focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition placeholder:text-foreground/40"
                                        placeholder="Enter password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center text-foreground/50 transition hover:text-primary"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                                    {error}
                                </div>
                            )}

                            <button
                                disabled={loading}
                                className="w-full relative flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 mt-2"
                            >
                                {loading ? "Logging in..." : "Login"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
