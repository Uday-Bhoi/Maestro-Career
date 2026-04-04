"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Script from "next/script";
import { formatInr, getPlanById } from "@/data/plans";
import { ChevronRight, CreditCard, ExternalLink, ShieldCheck, LogOut, LayoutDashboard, User, Activity, Sparkles, Building, Briefcase, GraduationCap, MapPin, TabletSmartphone } from "lucide-react";

import { DashboardData } from "@/lib/auth-supabase";

interface DashboardResponse {
    success: boolean;
    data?: DashboardData;
    message?: string;
}

const SERVICE_OPTIONS = [
    "Career Coaching",
    "Psychometric Assessment",
    "Interview Prep",
    "Skill Mapping",
    "College Guidance",
];

export default function DashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [error, setError] = useState("");
    const [profileMessage, setProfileMessage] = useState("");
    const [dashboard, setDashboard] = useState<DashboardResponse["data"]>(undefined);
    const [isPaying, setIsPaying] = useState(false);

    const selectedPlan = dashboard?.profile.selectedPlanId ? getPlanById(dashboard.profile.selectedPlanId) : null;

    const [onboardingData, setOnboardingData] = useState({
        name: "",
        preferredServices: [] as string[],
        password: "",
    });

    const loadData = async () => {
        try {
            const resp = await fetch("/api/auth/me", { method: "GET" });
            const data: DashboardResponse = await resp.json();

            if (!resp.ok || !data.success || !data.data) {
                router.replace("/auth");
                return;
            }

            const profile = data.data.profile;
            setDashboard(data.data);
            setOnboardingData((prev) => ({
                ...prev,
                name: profile.name === "Learner" ? "" : profile.name,
                preferredServices: profile.preferredServices,
            }));
        } catch {
            setError("Unable to load dashboard right now.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [router]);

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/auth");
    };

    const toggleService = (service: string) => {
        setOnboardingData((prev) => {
            const exists = prev.preferredServices.includes(service);
            if (exists) {
                return {
                    ...prev,
                    preferredServices: prev.preferredServices.filter((item) => item !== service),
                };
            }
            if (prev.preferredServices.length >= 5) {
                return prev;
            }
            return {
                ...prev,
                preferredServices: [...prev.preferredServices, service],
            };
        });
    };

    const handleCompleteProfile = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setProfileMessage("");
        setSavingProfile(true);

        try {
            const resp = await fetch("/api/auth/profile/setup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(onboardingData),
            });
            const data = await resp.json();

            if (!resp.ok || !data.success) {
                throw new Error(data.message || "Unable to complete profile.");
            }

            setProfileMessage("Profile setup completed. You can now access everything.");
            await loadData();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to complete profile.");
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePayNow = async () => {
        if (!selectedPlan || !dashboard) return;

        setError("");
        const razorpayCtor = (window as any).Razorpay;
        if (!razorpayCtor) {
            setError("Payment gateway did not load. Please refresh.");
            return;
        }

        setIsPaying(true);

        try {
            const orderResp = await fetch("/api/payments/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    planId: selectedPlan.id,
                    buyerName: dashboard.profile.name,
                    buyerEmail: dashboard.profile.email,
                    buyerMobile: dashboard.profile.mobile,
                }),
            });

            const orderData = await orderResp.json();
            if (!orderResp.ok || !orderData.success) {
                throw new Error(orderData.message || "Unable to start payment.");
            }

            const options = {
                key: orderData.keyId,
                amount: orderData.order.amount,
                currency: orderData.order.currency,
                name: "Maestro Career",
                description: `${selectedPlan.name} Plan`,
                order_id: orderData.order.id,
                prefill: {
                    name: dashboard.profile.name,
                    email: dashboard.profile.email,
                    contact: dashboard.profile.mobile,
                },
                theme: { color: "#1294DD" },
                handler: async function (response: any) {
                    try {
                        const verifyResp = await fetch("/api/payments/verify", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(response),
                        });
                        const verifyData = await verifyResp.json();

                        if (verifyResp.ok && verifyData.success) {
                            await loadData();
                        } else {
                            throw new Error(verifyData.message || "Verification failed.");
                        }
                    } catch (err) {
                        setError(err instanceof Error ? err.message : "Payment verification failed.");
                    } finally {
                        setIsPaying(false);
                    }
                },
                modal: {
                    ondismiss: function () {
                        setIsPaying(false);
                    }
                }
            };

            const razorpay = new razorpayCtor(options);
            razorpay.open();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not start payment.");
            setIsPaying(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#F8FAFC]">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
            <Header />

            <section className="py-14 md:py-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    {loading && (
                        <div className="max-w-4xl mx-auto rounded-3xl border border-blue-100 bg-white p-20 text-center shadow-xl shadow-blue-500/5 animate-pulse">
                            <div className="flex flex-col items-center gap-6">
                                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                                    <Sparkles className="w-8 h-8 text-primary animate-spin-slow" />
                                </div>
                                <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-xs">Authenticating Session</p>
                            </div>
                        </div>
                    )}

                    {!loading && error && (
                        <div className="max-w-4xl mx-auto rounded-3xl border border-rose-100 bg-rose-50 p-8 text-rose-700 shadow-xl shadow-rose-500/5 text-center">
                            <div className="mb-4 inline-flex items-center justify-center w-12 h-12 bg-rose-100 rounded-full">
                                <Activity className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-black uppercase tracking-tight mb-2">Operation Halted</h3>
                            <p className="text-sm font-medium opacity-80">{error}</p>
                            <button onClick={loadData} className="mt-6 px-8 py-3 bg-rose-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-700 transition-all">Retry Synchronization</button>
                        </div>
                    )}

                    {!loading && dashboard && (
                        <div className="max-w-7xl mx-auto space-y-8">
                            {/* Top Header Card */}
                            <div className="rounded-[2.5rem] border border-white bg-white/40 backdrop-blur-3xl p-8 md:p-12 shadow-2xl shadow-blue-500/5 flex flex-col md:flex-row md:items-center md:justify-between gap-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none group-hover:bg-primary/10 transition-all duration-1000" />
                                <div className="relative z-10 flex flex-col items-start gap-4">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Secure Portal Active</span>
                                    </div>
                                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-dark tracking-tightest leading-none uppercase italic">
                                        Welcome, <span className="text-primary">{dashboard.profile.name}</span>
                                    </h1>
                                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Maestro Dashboard v2.0</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="relative z-10 rounded-2xl bg-dark hover:bg-black text-white px-10 py-5 font-black uppercase tracking-[0.3em] text-[10px] transition-all hover:scale-[1.05] shadow-2xl shadow-black/20 flex items-center gap-3 active:scale-95"
                                >
                                    <LogOut className="w-4 h-4" />
                                    End Session
                                </button>
                            </div>

                            {/* Plan and Assessment Section */}
                            <div className="grid lg:grid-cols-2 gap-8">
                                {dashboard.profile.selectedPlanId ? (
                                    <div className="rounded-[2rem] border border-primary/20 bg-primary/5 p-10 shadow-xl shadow-primary/5 flex flex-col justify-between relative group overflow-hidden">
                                        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 p-20 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <CreditCard className="w-64 h-64 text-primary" />
                                        </div>
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-4 mb-8">
                                                <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 shadow-lg shadow-primary/10">
                                                    <CreditCard className="w-6 h-6 text-primary" />
                                                </div>
                                                <h2 className="text-xl font-black text-dark tracking-wide uppercase italic">Career Path Selected</h2>
                                            </div>
                                            <h3 className="text-5xl font-black text-dark tracking-tightest leading-tight uppercase italic mb-4">{selectedPlan?.name}</h3>

                                            <div className="mt-10 flex items-center justify-between bg-white/70 backdrop-blur-md border border-white rounded-[2rem] p-8 shadow-inner">
                                                <div>
                                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2">Total Investment</p>
                                                    <p className="text-4xl font-black text-primary leading-none tracking-tighter">{formatInr(selectedPlan?.priceInr || 0)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2">Account Status</p>
                                                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest ${dashboard.profile.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-200' : 'bg-rose-500/10 text-rose-600 border border-rose-200'}`}>
                                                        {dashboard.profile.paymentStatus === 'paid' && <ShieldCheck className="w-3 h-3" />}
                                                        {dashboard.profile.paymentStatus?.toUpperCase() || 'UNPAID'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-12 relative z-10">
                                            {dashboard.profile.paymentStatus === 'paid' ? (
                                                <div className="flex items-center gap-4 text-emerald-600 font-black bg-white rounded-2xl p-6 justify-center shadow-xl shadow-emerald-500/5 group/verified transition-all hover:scale-[1.02] border border-emerald-50">
                                                    <div className="w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center group-hover/verified:scale-110 transition-transform">
                                                        <ShieldCheck className="w-5 h-5" />
                                                    </div>
                                                    <span className="uppercase tracking-[0.2em] text-xs font-black">Lifecycle Verified</span>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={handlePayNow}
                                                    disabled={isPaying}
                                                    className="w-full group/pay relative overflow-hidden rounded-[1.5rem] bg-primary hover:bg-primary-dark text-white font-black uppercase tracking-[0.4em] text-[11px] py-7 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 shadow-2xl shadow-primary/40"
                                                >
                                                    {isPaying ? "Synchronizing with Gateway..." : "Finalize & Pay Now"}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-[2rem] border border-dashed border-primary/20 bg-white/50 p-12 flex flex-col items-center justify-center text-center group hover:bg-primary/5 transition-all duration-500 hover:border-solid hover:border-primary/40">
                                        <div className="p-8 bg-white rounded-full shadow-2xl shadow-blue-500/10 mb-8 group-hover:scale-110 transition-transform duration-500">
                                            <Sparkles className="w-12 h-12 text-primary" />
                                        </div>
                                        <h3 className="text-2xl font-black text-dark uppercase italic tracking-tightest mb-4">No Plan Locked</h3>
                                        <p className="text-gray-400 font-bold text-sm max-w-xs leading-relaxed uppercase tracking-widest text-[10px]">Your career intelligence path is waiting. Explore our premium plans to begin your journey.</p>
                                        <Link href="/#pricing" className="mt-10 px-10 py-5 bg-dark text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/20">
                                            Explore Plans <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                )}

                                {dashboard.profile.psychometricTestLink ? (
                                    <div className="rounded-[2rem] border border-accent-purple/20 bg-accent-purple/5 p-10 shadow-xl shadow-accent-purple/5 flex flex-col justify-between relative group overflow-hidden">
                                        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 p-20 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <ExternalLink className="w-64 h-64 text-accent-purple" />
                                        </div>
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-4 mb-8">
                                                <div className="p-3 bg-accent-purple/10 rounded-2xl border border-accent-purple/20 shadow-lg shadow-accent-purple/10">
                                                    <ExternalLink className="w-6 h-6 text-accent-purple" />
                                                </div>
                                                <h2 className="text-xl font-black text-dark tracking-wide uppercase italic">Assessment Issued</h2>
                                            </div>
                                            <p className="text-gray-500 font-bold text-sm leading-loose uppercase tracking-widest text-[10px]">Our experts have finalized your personalized industrial psychometric test link. Access the partner portal below.</p>
                                        </div>
                                        <div className="mt-12 relative z-10">
                                            <a
                                                href={dashboard.profile.psychometricTestLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full inline-flex items-center justify-center rounded-[1.5rem] bg-accent-purple hover:bg-accent-purple/90 text-white font-black uppercase tracking-[0.4em] text-[11px] py-7 transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-accent-purple/40"
                                            >
                                                Launch Assessment <ChevronRight className="ml-2 w-4 h-4" />
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-[2rem] border border-dashed border-gray-200 bg-white/50 p-12 flex flex-col items-center justify-center text-center">
                                        <div className="p-8 bg-white rounded-full shadow-2xl shadow-gray-500/10 mb-8">
                                            <ShieldCheck className="w-12 h-12 text-gray-200" />
                                        </div>
                                        <h3 className="text-2xl font-black text-gray-400 uppercase italic tracking-tightest mb-4">Awaiting Link</h3>
                                        <p className="text-gray-400 font-bold text-sm max-w-xs leading-relaxed uppercase tracking-widest text-[10px]">Following plan selection and verification, our expert team will distribute your assessment link within 24-48 hours.</p>
                                    </div>
                                )}
                            </div>

                            {!dashboard.profile.onboardingCompleted && (
                                <div className="rounded-[3rem] border border-white bg-white p-12 shadow-2xl shadow-blue-500/5 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                                        <Sparkles className="w-32 h-32 text-primary" />
                                    </div>
                                    <div className="relative z-10">
                                        <h2 className="text-3xl font-black text-dark tracking-tightest uppercase italic mb-2">Finalize Credentials</h2>
                                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-10">Tailoring your Maestro Career experience.</p>

                                        {profileMessage && (
                                            <div className="mb-8 rounded-2xl border border-emerald-100 bg-emerald-50 px-6 py-4 text-xs font-black uppercase tracking-widest text-emerald-700">
                                                {profileMessage}
                                            </div>
                                        )}

                                        <form onSubmit={handleCompleteProfile} className="space-y-8 max-w-2xl">
                                            <div className="space-y-3">
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Full Name</label>
                                                <div className="relative">
                                                    <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                                    <input
                                                        type="text"
                                                        value={onboardingData.name}
                                                        onChange={(e) => setOnboardingData((prev) => ({ ...prev, name: e.target.value }))}
                                                        className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 pl-14 pr-6 py-5 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-dark"
                                                        placeholder="ENTER YOUR FULL NAME"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Target Verticals (SELECT UP TO 5)</p>
                                                <div className="flex flex-wrap gap-3">
                                                    {SERVICE_OPTIONS.map((service) => {
                                                        const selected = onboardingData.preferredServices.includes(service);
                                                        return (
                                                            <button
                                                                key={service}
                                                                type="button"
                                                                onClick={() => toggleService(service)}
                                                                className={`rounded-xl border px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${selected ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105" : "bg-white text-gray-400 border-gray-100 hover:border-primary hover:text-primary"}`}
                                                            >
                                                                {service}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={savingProfile}
                                                className="relative group overflow-hidden rounded-2xl bg-dark hover:bg-black text-white px-12 py-6 font-black uppercase tracking-[0.4em] text-[10px] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 shadow-2xl shadow-black/20"
                                            >
                                                {savingProfile ? "Writing Data..." : "Apply Profile Updates"}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {/* Stats Cards */}
                            <div className="grid md:grid-cols-3 gap-8">
                                {[
                                    { label: "Session Duration", value: `${dashboard.metrics.accountAgeDays}d`, icon: Sparkles },
                                    { label: "Synchronization Density", value: dashboard.metrics.totalLogins, icon: LayoutDashboard },
                                    { label: "Direct Inquiries", value: dashboard.metrics.inquiryCount, icon: User },
                                ].map((stat, idx) => (
                                    <div key={idx} className="rounded-[2.5rem] bg-white border border-white p-10 shadow-2xl shadow-blue-500/5 group hover:scale-[1.02] transition-all relative overflow-hidden">
                                        <stat.icon className="absolute -bottom-4 -right-4 w-24 h-24 text-gray-50 group-hover:text-primary/5 transition-colors" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 relative z-10">{stat.label}</p>
                                        <p className="text-5xl font-black text-dark mt-4 tracking-tighter relative z-10">{stat.value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="grid lg:grid-cols-2 gap-8">
                                {/* Profile Details Card */}
                                <div className="rounded-[3rem] border border-white bg-white p-12 shadow-2xl shadow-blue-500/5 relative group">
                                    <h2 className="text-2xl font-black text-dark tracking-tightest uppercase italic mb-10 flex items-center gap-3">
                                        Account <span className="text-primary">Intelligence</span>
                                    </h2>
                                    <div className="space-y-6">
                                        {[
                                            { label: "Entity Name", value: dashboard.profile.name, icon: User },
                                            { label: "Digital Mail", value: dashboard.profile.email, icon: Building },
                                            { label: "Mobile Uplink", value: dashboard.profile.mobile, icon: TabletSmartphone },
                                            { label: "Onboarding", value: dashboard.profile.onboardingCompleted ? "SECURE" : "INCOMPLETE", icon: ShieldCheck },
                                            { label: "Locality", value: dashboard.profile.city || "PENDING", icon: MapPin },
                                        ].map((info, idx) => (
                                            <div key={idx} className="flex items-center justify-between py-4 border-b border-gray-50 group/item">
                                                <div className="flex items-center gap-4">
                                                    <info.icon className="w-4 h-4 text-gray-300 group-hover/item:text-primary transition-colors" />
                                                    <span className="text-[11px] font-black uppercase tracking-widest text-gray-300">{info.label}</span>
                                                </div>
                                                <span className="text-xs font-black text-dark tracking-tight italic uppercase">{info.value || "—"}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-12 flex flex-wrap gap-2">
                                        {dashboard.profile.preferredServices.map((item) => (
                                            <span
                                                key={item}
                                                className="inline-flex items-center rounded-full bg-primary/5 text-primary border border-primary/20 px-4 py-2 text-[10px] font-black uppercase tracking-widest"
                                            >
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Activity Log Card */}
                                <div className="rounded-[3rem] border border-white bg-white p-12 shadow-2xl shadow-blue-500/5 relative group">
                                    <h2 className="text-2xl font-black text-dark tracking-tightest uppercase italic mb-10 flex items-center gap-3">
                                        Synchronization <span className="text-primary">Log</span>
                                    </h2>
                                    <div className="space-y-6">
                                        {dashboard.recentActivity.length === 0 && (
                                            <div className="py-20 text-center">
                                                <Activity className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">No activity data found</p>
                                            </div>
                                        )}
                                        {dashboard.recentActivity.map((item) => (
                                            <div key={item.id} className="relative pl-8 group/activity">
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-200 rounded-full group-hover/activity:bg-primary transition-colors" />
                                                <p className="text-xs font-black text-dark tracking-tight uppercase italic mb-1">{item.message}</p>
                                                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{new Date(item.at).toLocaleDateString()} @ {new Date(item.at).toLocaleTimeString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Modules Panel */}
                            <div className="rounded-[3rem] border border-white bg-white p-12 shadow-2xl shadow-blue-500/5">
                                <h2 className="text-2xl font-black text-dark tracking-tightest uppercase italic mb-10">System <span className="text-primary">Modules</span></h2>
                                <div className="grid md:grid-cols-3 gap-8">
                                    {dashboard.websiteModules.map((module) => (
                                        <Link
                                            key={module.title}
                                            href={module.route}
                                            className="group relative rounded-[2rem] border border-gray-100 p-8 hover:border-primary hover:bg-primary/5 transition-all overflow-hidden"
                                        >
                                            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/5 rounded-full rotate-12 translate-y-12 translate-x-12 opacity-0 group-hover:opacity-100 transition-all duration-700" />
                                            <p className="text-xl font-black text-dark group-hover:text-primary tracking-tightest leading-none uppercase italic mb-4">{module.title}</p>
                                            <p className="text-[10px] font-bold text-gray-400 leading-relaxed uppercase tracking-widest">{module.description}</p>
                                            <div className="mt-8 flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all">
                                                Access Module <ChevronRight className="w-3 h-3" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </main>
    );
}
