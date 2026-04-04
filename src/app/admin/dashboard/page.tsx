"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getPlanById, formatInr } from "@/data/plans";
import {
    Search, User, Mail, Smartphone, Calendar, Briefcase,
    CreditCard, ExternalLink, ShieldCheck, Activity,
    Database, Filter, ChevronRight, LogOut, LayoutDashboard, Sparkles
} from "lucide-react";

interface AdminUser {
    id: string;
    full_name: string;
    email: string;
    mobile: string;
    date_of_birth: string;
    user_type: "student" | "working_professional";
    selected_plan_id: string;
    payment_status: "paid" | "unpaid";
    payment_id: string;
    transaction_id: string;
    payment_token: string;
    psychometric_test_link: string;
    created_at: string;
}

export default function AdminDashboardPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [linkInput, setLinkInput] = useState<{ [userId: string]: string }>({});
    const [sendingLink, setSendingLink] = useState<{ [userId: string]: boolean }>({});
    const router = useRouter();

    useEffect(() => {
        const session = localStorage.getItem("admin_session");
        if (!session) {
            router.replace("/admin");
            return;
        }

        const fetchUsers = async () => {
            try {
                const resp = await fetch("/api/admin/users");
                const data = await resp.json();
                if (data.success) {
                    setUsers(data.data);
                } else {
                    setError("Failed to fetch user database.");
                }
            } catch {
                setError("Unable to connect to administrative core.");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [router]);

    const handleSendLink = async (userId: string) => {
        const link = linkInput[userId];
        if (!link) return;

        setSendingLink({ ...sendingLink, [userId]: true });

        try {
            const resp = await fetch(`/api/admin/users/${userId}/send-link`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ psychometricTestLink: link }),
            });
            const data = await resp.json();
            if (data.success) {
                setUsers(users.map(u => u.id === userId ? { ...u, psychometric_test_link: link } : u));
                alert("Psychometric Link distribution successful.");
            } else {
                alert(data.message || "Failed to distribute link.");
            }
        } catch {
            alert("Network error. Link distribution halted.");
        } finally {
            setSendingLink({ ...sendingLink, [userId]: false });
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("admin_session");
        router.push("/admin");
    };

    const calculateAge = (dob: string) => {
        if (!dob) return "-";
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const filteredUsers = users.filter(u =>
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <main className="min-h-screen bg-[#F8FAFC]">
            <Header />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col gap-10">

                    {/* Dash Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-dark rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-black/10">
                                <Database className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-dark tracking-tightest uppercase italic">Administrative Core</h1>
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-1">Lead & Payment Monitoring System</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex flex-col text-right">
                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Active Leads</p>
                                <p className="text-2xl font-black text-dark leading-none">{users.length}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="px-8 py-4 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-dark hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all flex items-center gap-3 active:scale-95"
                            >
                                <LogOut className="w-4 h-4" />
                                Terminate Session
                            </button>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="grid md:grid-cols-4 gap-6">
                        <div className="md:col-span-3 relative group">
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-hover:text-primary transition-colors">
                                <Search className="w-full h-full" />
                            </div>
                            <input
                                type="text"
                                placeholder="SEARCH DATA BY NAME OR DIGITAL MAIL..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-16 pr-6 py-5 rounded-2xl border border-white bg-white/40 backdrop-blur-xl focus:bg-white focus:border-primary outline-none transition-all font-bold text-[11px] uppercase tracking-widest text-dark shadow-xl shadow-blue-500/5 placeholder:text-gray-300"
                            />
                        </div>
                        <button className="flex items-center justify-center gap-3 bg-white border border-white rounded-2xl font-black uppercase tracking-widest text-[10px] text-gray-400 hover:text-primary transition-all shadow-xl shadow-blue-500/5">
                            <Filter className="w-4 h-4" />
                            Advanced Filter
                        </button>
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="rounded-[2.5rem] bg-white p-20 text-center border border-white shadow-3xl shadow-blue-500/5 animate-pulse">
                            <Sparkles className="w-12 h-12 text-primary/20 mx-auto mb-6 animate-spin-slow" />
                            <p className="text-gray-300 font-black uppercase tracking-[0.3em] text-[10px]">Compiling User Matrices</p>
                        </div>
                    ) : error ? (
                        <div className="rounded-[2.5rem] bg-rose-50 p-12 text-center border border-rose-100 shadow-3xl shadow-rose-500/5">
                            <Activity className="w-12 h-12 text-rose-300 mx-auto mb-6" />
                            <h3 className="text-xl font-black text-rose-700 uppercase italic mb-2 tracking-tight">Access Restricted</h3>
                            <p className="text-rose-500 font-bold uppercase tracking-widest text-[10px]">{error}</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-8">
                            {filteredUsers.length === 0 ? (
                                <div className="text-center py-20 bg-white/40 rounded-[2.5rem] border border-dashed border-gray-200 uppercase tracking-widest text-gray-400 font-black text-[10px]">
                                    No records matching search parameters found in core.
                                </div>
                            ) : (
                                <div className="grid gap-6">
                                    {filteredUsers.map((user) => {
                                        const plan = user.selected_plan_id ? getPlanById(user.selected_plan_id) : null;
                                        return (
                                            <div key={user.id} className="group relative rounded-[2rem] bg-white border border-white p-8 md:p-10 shadow-2xl shadow-blue-500/5 transition-all hover:scale-[1.01] hover:shadow-primary/10 overflow-hidden">

                                                <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity translate-x-12 -translate-y-12">
                                                    <LayoutDashboard className="w-64 h-64 text-dark" />
                                                </div>

                                                <div className="grid lg:grid-cols-12 gap-8 relative z-10">
                                                    {/* User Core Bio */}
                                                    <div className="lg:col-span-4 flex flex-col gap-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10">
                                                                <User className="w-6 h-6 text-primary" />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-2xl font-black text-dark uppercase tracking-tight leading-none italic">{user.full_name || "Anonymous Learner"}</h3>
                                                                <div className="flex items-center gap-2 mt-2">
                                                                    <div className={`w-2 h-2 rounded-full ${user.payment_status === 'paid' ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
                                                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-300">Sync Active : {new Date(user.created_at).toLocaleDateString()}</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100 flex items-center gap-3">
                                                                <Mail className="w-3.5 h-3.5 text-gray-300" />
                                                                <p className="text-[10px] font-black text-dark uppercase truncate">{user.email || "-"}</p>
                                                            </div>
                                                            <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100 flex items-center gap-3">
                                                                <Smartphone className="w-3.5 h-3.5 text-gray-300" />
                                                                <p className="text-[10px] font-black text-dark uppercase">{user.mobile || "-"}</p>
                                                            </div>
                                                            <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100 flex items-center gap-3">
                                                                <Calendar className="w-3.5 h-3.5 text-gray-300" />
                                                                <p className="text-[10px] font-black text-dark uppercase">AGE: {calculateAge(user.date_of_birth)}</p>
                                                            </div>
                                                            <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100 flex items-center gap-3">
                                                                <Briefcase className="w-3.5 h-3.5 text-gray-300" />
                                                                <p className="text-[10px] font-black text-dark uppercase">{user.user_type === 'working_professional' ? 'Professional' : 'Student'}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Plan & Payment Data */}
                                                    <div className="lg:col-span-4 bg-gray-50/30 rounded-[1.5rem] border border-gray-100 p-6 flex flex-col justify-between">
                                                        <div className="flex items-center justify-between mb-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-3 h-3 bg-primary rounded-full" />
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Transaction Profile</p>
                                                            </div>
                                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${user.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                                                {user.payment_status?.toUpperCase() || 'UNPAID'}
                                                            </span>
                                                        </div>

                                                        <div className="space-y-4">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Plan Locked</span>
                                                                <span className="text-xs font-black text-dark uppercase italic">{plan?.name || "TBD"}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Investment</span>
                                                                <span className="text-xs font-black text-primary italic uppercase">{plan ? formatInr(plan.priceInr) : "—"}</span>
                                                            </div>
                                                            <div className="flex flex-col gap-1 pt-4 border-t border-gray-100">
                                                                <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Payment ID/Token</span>
                                                                <span className="text-[10px] font-bold text-dark truncate font-mono tracking-tighter opacity-50">{user.payment_id || user.payment_token || "PENDING ISSUANCE"}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Distribute Assessment Link */}
                                                    <div className="lg:col-span-4 flex flex-col justify-between h-full">
                                                        <div className="flex items-center gap-3 mb-6">
                                                            <div className="p-2 bg-dark/5 rounded-lg border border-dark/10">
                                                                <ExternalLink className="w-4 h-4 text-dark" />
                                                            </div>
                                                            <h4 className="text-xs font-black text-dark uppercase tracking-widest">Psychometric Distribution</h4>
                                                        </div>

                                                        <div className="space-y-4">
                                                            <div className="relative group">
                                                                <input
                                                                    type="text"
                                                                    placeholder="PASTE TEST URL HERE..."
                                                                    value={linkInput[user.id] || ""}
                                                                    onChange={(e) => setLinkInput({ ...linkInput, [user.id]: e.target.value })}
                                                                    className="w-full pl-6 pr-6 py-5 rounded-2xl border border-gray-100 bg-white focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-[10px] text-dark shadow-sm uppercase placeholder:tracking-[0.1em]"
                                                                />
                                                            </div>
                                                            <button
                                                                onClick={() => handleSendLink(user.id)}
                                                                disabled={sendingLink[user.id] || !linkInput[user.id]}
                                                                className="w-full group/btn relative overflow-hidden flex items-center justify-center gap-3 bg-dark hover:bg-black text-white px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all disabled:opacity-50 active:scale-95 shadow-xl shadow-black/10"
                                                            >
                                                                {sendingLink[user.id] ? "Transmitting..." : (
                                                                    <>
                                                                        Issue Assessment <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                                                    </>
                                                                )}
                                                            </button>
                                                        </div>

                                                        {user.psychometric_test_link && (
                                                            <div className="mt-4 flex items-center gap-2 text-emerald-600 font-black text-[9px] uppercase tracking-widest">
                                                                <ShieldCheck className="w-3.5 h-3.5" />
                                                                Link Active in User Dashboard
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </main>
    );
}
