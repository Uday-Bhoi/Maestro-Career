"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Edit3, RefreshCw, Save, Users, X } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { formatInr, getPlanById, PLANS } from "@/data/plans";

type PaymentStatus = "paid" | "unpaid";
type PaymentMethod = "razorpay" | "cash" | "manual_upi";
type UserType = "student" | "working_professional";

interface AdminUser {
    id: string;
    full_name: string;
    email: string;
    mobile: string;
    date_of_birth: string | null;
    user_type: UserType | null;
    city: string | null;
    selected_plan_id: string | null;
    payment_status: PaymentStatus | null;
    payment_method: PaymentMethod | null;
    payment_id: string | null;
    transaction_id: string | null;
    payment_token: string | null;
    manual_cash_amount: number | null;
    manual_payment_notes: string | null;
    psychometric_test_link: string | null;
    created_at: string;
}

interface AdminStats {
    uniqueVisitors: number;
}

interface AdminEditForm {
    fullName: string;
    mobile: string;
    dateOfBirth: string;
    userType: UserType;
    city: string;
    selectedPlanId: string;
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod;
    paymentId: string;
    transactionId: string;
    paymentToken: string;
    manualCashAmount: string;
    manualPaymentNotes: string;
    psychometricTestLink: string;
}

function inferPaymentMethod(user: AdminUser): PaymentMethod {
    if (user.payment_method === "razorpay" || user.payment_method === "cash" || user.payment_method === "manual_upi") {
        return user.payment_method;
    }

    if (user.payment_id) {
        return "razorpay";
    }
    if (user.manual_cash_amount !== null && user.manual_cash_amount !== undefined) {
        return "cash";
    }

    return "razorpay";
}

function createEditForm(user: AdminUser): AdminEditForm {
    return {
        fullName: user.full_name ?? "",
        mobile: user.mobile ?? "",
        dateOfBirth: user.date_of_birth ? user.date_of_birth.split("T")[0] : "",
        userType: user.user_type ?? "student",
        city: user.city ?? "",
        selectedPlanId: user.selected_plan_id ?? "",
        paymentStatus: user.payment_status === "paid" ? "paid" : "unpaid",
        paymentMethod: inferPaymentMethod(user),
        paymentId: user.payment_id ?? "",
        transactionId: user.transaction_id ?? "",
        paymentToken: user.payment_token ?? "",
        manualCashAmount:
            user.manual_cash_amount !== null && user.manual_cash_amount !== undefined
                ? String(user.manual_cash_amount)
                : "",
        manualPaymentNotes: user.manual_payment_notes ?? "",
        psychometricTestLink: user.psychometric_test_link ?? "",
    };
}

function formatAge(dateOfBirth: string | null) {
    if (!dateOfBirth) {
        return "-";
    }

    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDelta = today.getMonth() - birthDate.getMonth();

    if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birthDate.getDate())) {
        age -= 1;
    }

    return age;
}

function getPaymentMethodLabel(method: PaymentMethod) {
    if (method === "cash") {
        return "Manual Cash";
    }
    if (method === "manual_upi") {
        return "Manual UPI";
    }

    return "Razorpay";
}

function formatManualCash(value: number | null) {
    if (value === null || value === undefined) {
        return "TBD";
    }

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(value);
}

export default function AdminDashboardPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [stats, setStats] = useState<AdminStats>({ uniqueVisitors: 0 });
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(false);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<AdminEditForm | null>(null);
    const [savingUserId, setSavingUserId] = useState<string | null>(null);
    const [linkInput, setLinkInput] = useState<Record<string, string>>({});
    const [sendingLink, setSendingLink] = useState<Record<string, boolean>>({});
    const router = useRouter();

    const syncLinkInputs = useCallback((nextUsers: AdminUser[]) => {
        setLinkInput((current) => {
            const nextState = { ...current };

            for (const user of nextUsers) {
                nextState[user.id] = user.psychometric_test_link ?? "";
            }

            return nextState;
        });
    }, []);

    const loadStats = useCallback(async () => {
        setStatsLoading(true);

        try {
            const response = await fetch("/api/admin/stats", { cache: "no-store" });
            const data = await response.json();

            if (response.ok && data?.success) {
                setStats(data.data);
            }
        } finally {
            setStatsLoading(false);
        }
    }, []);

    const loadDashboardData = useCallback(async () => {
        setError("");

        try {
            const sessionResp = await fetch("/api/admin/session", { cache: "no-store" });
            const sessionData = await sessionResp.json();

            if (!sessionData?.authenticated) {
                router.replace("/admin");
                return;
            }

            const [usersResp, statsResp] = await Promise.all([
                fetch("/api/admin/users", { cache: "no-store" }),
                fetch("/api/admin/stats", { cache: "no-store" }),
            ]);
            const [usersData, statsData] = await Promise.all([usersResp.json(), statsResp.json()]);

            if (!usersResp.ok || !usersData?.success) {
                throw new Error(usersData?.message || "Failed to fetch user database.");
            }

            setUsers(usersData.data ?? []);
            syncLinkInputs(usersData.data ?? []);

            if (statsResp.ok && statsData?.success) {
                setStats(statsData.data);
            }
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : "Unable to connect to administrative core.");
        } finally {
            setLoading(false);
        }
    }, [router, syncLinkInputs]);

    useEffect(() => {
        void loadDashboardData();
    }, [loadDashboardData]);

    useEffect(() => {
        if (loading) {
            return;
        }

        const intervalId = window.setInterval(() => {
            void loadStats();
        }, 30000);

        return () => window.clearInterval(intervalId);
    }, [loading, loadStats]);

    const handleLogout = () => {
        fetch("/api/admin/logout", { method: "POST" }).finally(() => {
            router.push("/admin");
            router.refresh();
        });
    };

    const handleSendLink = async (userId: string) => {
        const link = (linkInput[userId] ?? "").trim();
        if (!link) {
            return;
        }

        setSendingLink((current) => ({ ...current, [userId]: true }));

        try {
            const resp = await fetch(`/api/admin/users/${userId}/send-link`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ psychometricTestLink: link }),
            });
            const data = await resp.json();

            if (!resp.ok || !data?.success) {
                throw new Error(data?.message || "Failed to distribute link.");
            }

            setUsers((current) =>
                current.map((user) =>
                    user.id === userId ? { ...user, psychometric_test_link: link } : user,
                ),
            );
            window.alert("Psychometric link distribution successful.");
        } catch (sendError) {
            window.alert(sendError instanceof Error ? sendError.message : "Network error. Link distribution halted.");
        } finally {
            setSendingLink((current) => ({ ...current, [userId]: false }));
        }
    };

    const handleEditStart = (user: AdminUser) => {
        setEditingUserId(user.id);
        setEditForm(createEditForm(user));
    };

    const handleEditCancel = () => {
        setEditingUserId(null);
        setEditForm(null);
    };

    const handleEditFieldChange = <K extends keyof AdminEditForm>(field: K, value: AdminEditForm[K]) => {
        setEditForm((current) => (current ? { ...current, [field]: value } : current));
    };

    const handleSaveEdit = async (userId: string) => {
        if (!editForm) {
            return;
        }

        setSavingUserId(userId);

        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editForm),
            });
            const data = await response.json();

            if (!response.ok || !data?.success) {
                throw new Error(data?.message || "Unable to save this registration.");
            }

            const updatedUser = data.data as AdminUser;
            setUsers((current) => current.map((user) => (user.id === userId ? updatedUser : user)));
            setLinkInput((current) => ({
                ...current,
                [userId]: updatedUser.psychometric_test_link ?? "",
            }));
            setEditingUserId(null);
            setEditForm(null);
        } catch (saveError) {
            window.alert(saveError instanceof Error ? saveError.message : "Unable to save this registration.");
        } finally {
            setSavingUserId(null);
        }
    };

    const filteredUsers = users.filter((user) => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) {
            return true;
        }

        return (
            user.full_name?.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query) ||
            user.mobile?.toLowerCase().includes(query)
        );
    });

    return (
        <main className="min-h-screen bg-background text-foreground transition-colors duration-500">
            <Header />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col gap-10">
                    <div className="rounded-3xl border border-border/20 bg-card p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden transition-all shadow-sm w-full">
                        <div className="relative z-10 flex flex-col items-start gap-2">
                            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                                Admin Dashboard
                            </h1>
                            <p className="text-foreground/60 text-sm">Lead, payment, and visitor management</p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-2xl border border-border/20 bg-background px-4 py-3 text-left">
                                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-foreground/45">Active Leads</p>
                                    <p className="mt-1 text-xl font-bold text-foreground">{users.length}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => void loadStats()}
                                    className="rounded-2xl border border-border/20 bg-background px-4 py-3 text-left transition hover:border-primary/30"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-[0.2em] text-foreground/45">Unique Visitors</p>
                                            <p className="mt-1 text-xl font-bold text-foreground">{stats.uniqueVisitors}</p>
                                        </div>
                                        <Users className="h-4 w-4 text-primary" />
                                    </div>
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="relative z-10 rounded-xl bg-background border border-border/20 hover:border-border/40 text-foreground px-6 py-2.5 text-sm font-medium transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row w-full gap-4">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Search leads by name, email, or mobile..."
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                className="block w-full rounded-xl border border-border/30 bg-background px-4 py-3 text-[15px] text-foreground shadow-sm outline-none transition placeholder:text-foreground/40 focus:border-primary focus:ring-4 focus:ring-primary/20"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => void loadDashboardData()}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border/30 bg-card px-6 py-3 text-[15px] font-medium text-foreground hover:bg-background transition-colors hover:border-border/60"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading || statsLoading ? "animate-spin" : ""}`} />
                            Refresh
                        </button>
                    </div>

                    {loading ? (
                        <div className="max-w-4xl mx-auto rounded-3xl border border-border/20 bg-card p-12 text-center shadow-sm animate-pulse">
                            <p className="text-foreground/60 font-medium text-sm">Loading admin dashboard...</p>
                        </div>
                    ) : error ? (
                        <div className="max-w-4xl mx-auto rounded-3xl border border-destructive/20 bg-destructive/10 p-8 text-destructive text-center">
                            <h3 className="text-lg font-semibold mb-2">Error loading data</h3>
                            <p className="text-sm opacity-80">{error}</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-8">
                            {filteredUsers.length === 0 ? (
                                <div className="py-12 text-center border-t border-border/10">
                                    <p className="text-sm text-foreground/50">No users found matching your search.</p>
                                </div>
                            ) : (
                                <div className="grid gap-6">
                                    {filteredUsers.map((user) => {
                                        const plan = user.selected_plan_id ? getPlanById(user.selected_plan_id) : null;
                                        const isEditing = editingUserId === user.id && editForm !== null;
                                        const currentPaymentMethod = isEditing ? editForm.paymentMethod : inferPaymentMethod(user);
                                        const currentPaymentStatus = isEditing ? editForm.paymentStatus : user.payment_status ?? "unpaid";
                                        const displayedLink = linkInput[user.id] ?? user.psychometric_test_link ?? "";

                                        return (
                                            <div
                                                key={user.id}
                                                className="rounded-3xl border border-border/20 bg-card p-8 flex flex-col gap-6 shadow-sm relative overflow-hidden transition-all"
                                            >
                                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-foreground">
                                                            {user.full_name || "Anonymous Learner"}
                                                        </h3>
                                                        <p className="text-xs font-medium text-foreground/50 mt-1">
                                                            Joined: {new Date(user.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-3">
                                                        {isEditing ? (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => void handleSaveEdit(user.id)}
                                                                    disabled={savingUserId === user.id}
                                                                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
                                                                >
                                                                    <Save className="h-4 w-4" />
                                                                    {savingUserId === user.id ? "Saving..." : "Save Changes"}
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={handleEditCancel}
                                                                    className="inline-flex items-center gap-2 rounded-xl border border-border/20 bg-background px-4 py-2.5 text-sm font-medium text-foreground transition hover:border-border/50"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                    Cancel
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleEditStart(user)}
                                                                className="inline-flex items-center gap-2 rounded-xl border border-border/20 bg-background px-4 py-2.5 text-sm font-medium text-foreground transition hover:border-primary/30"
                                                            >
                                                                <Edit3 className="h-4 w-4" />
                                                                Edit Entry
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="grid lg:grid-cols-12 gap-8 w-full">
                                                    <div className="lg:col-span-4 flex flex-col gap-6">
                                                        <div className="space-y-4">
                                                            {isEditing ? (
                                                                <>
                                                                    <div className="space-y-2">
                                                                        <label className="block text-xs font-medium uppercase tracking-[0.18em] text-foreground/45">Full Name</label>
                                                                        <input
                                                                            type="text"
                                                                            value={editForm.fullName}
                                                                            onChange={(event) => handleEditFieldChange("fullName", event.target.value)}
                                                                            className="block w-full rounded-xl border border-border/30 bg-background px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <label className="block text-xs font-medium uppercase tracking-[0.18em] text-foreground/45">Mobile</label>
                                                                        <input
                                                                            type="tel"
                                                                            value={editForm.mobile}
                                                                            onChange={(event) => handleEditFieldChange("mobile", event.target.value)}
                                                                            className="block w-full rounded-xl border border-border/30 bg-background px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <label className="block text-xs font-medium uppercase tracking-[0.18em] text-foreground/45">Date Of Birth</label>
                                                                        <input
                                                                            type="date"
                                                                            value={editForm.dateOfBirth}
                                                                            onChange={(event) => handleEditFieldChange("dateOfBirth", event.target.value)}
                                                                            className="block w-full rounded-xl border border-border/30 bg-background px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
                                                                        />
                                                                    </div>
                                                                    <div className="grid gap-4 sm:grid-cols-2">
                                                                        <div className="space-y-2">
                                                                            <label className="block text-xs font-medium uppercase tracking-[0.18em] text-foreground/45">User Type</label>
                                                                            <select
                                                                                value={editForm.userType}
                                                                                onChange={(event) => handleEditFieldChange("userType", event.target.value as UserType)}
                                                                                className="block w-full rounded-xl border border-border/30 bg-background px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
                                                                            >
                                                                                <option value="student">Student</option>
                                                                                <option value="working_professional">Working Professional</option>
                                                                            </select>
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <label className="block text-xs font-medium uppercase tracking-[0.18em] text-foreground/45">City</label>
                                                                            <input
                                                                                type="text"
                                                                                value={editForm.city}
                                                                                onChange={(event) => handleEditFieldChange("city", event.target.value)}
                                                                                className="block w-full rounded-xl border border-border/30 bg-background px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-sm font-medium text-foreground/60">Email</span>
                                                                        <span className="text-sm font-semibold text-foreground truncate">{user.email || "-"}</span>
                                                                    </div>
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-sm font-medium text-foreground/60">Phone</span>
                                                                        <span className="text-sm font-semibold text-foreground">{user.mobile || "-"}</span>
                                                                    </div>
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-sm font-medium text-foreground/60">Age</span>
                                                                        <span className="text-sm font-semibold text-foreground">{formatAge(user.date_of_birth)}</span>
                                                                    </div>
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-sm font-medium text-foreground/60">Type</span>
                                                                        <span className="text-sm font-semibold text-foreground">
                                                                            {user.user_type === "working_professional" ? "Professional" : "Student"}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-sm font-medium text-foreground/60">City</span>
                                                                        <span className="text-sm font-semibold text-foreground">{user.city || "-"}</span>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="lg:col-span-4 rounded-2xl border border-border/20 bg-background/50 p-6 flex flex-col gap-4">
                                                        <div className="flex items-center justify-between mb-2 gap-3">
                                                            <h3 className="text-sm font-semibold text-foreground">Transaction Profile</h3>
                                                            <span
                                                                className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold uppercase ${
                                                                    currentPaymentStatus === "paid"
                                                                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                                                        : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                                                                }`}
                                                            >
                                                                {currentPaymentStatus}
                                                            </span>
                                                        </div>

                                                        {isEditing ? (
                                                            <div className="space-y-4">
                                                                <div className="space-y-2">
                                                                    <label className="block text-xs font-medium uppercase tracking-[0.18em] text-foreground/45">Plan</label>
                                                                    <select
                                                                        value={editForm.selectedPlanId}
                                                                        onChange={(event) => handleEditFieldChange("selectedPlanId", event.target.value)}
                                                                        className="block w-full rounded-xl border border-border/30 bg-background px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
                                                                    >
                                                                        <option value="">No plan selected</option>
                                                                        {PLANS.map((planOption) => (
                                                                            <option key={planOption.id} value={planOption.id}>
                                                                                {planOption.name} ({formatInr(planOption.priceInr)})
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </div>

                                                                <div className="grid gap-4 sm:grid-cols-2">
                                                                    <div className="space-y-2">
                                                                        <label className="block text-xs font-medium uppercase tracking-[0.18em] text-foreground/45">Payment Status</label>
                                                                        <select
                                                                            value={editForm.paymentStatus}
                                                                            onChange={(event) => handleEditFieldChange("paymentStatus", event.target.value as PaymentStatus)}
                                                                            className="block w-full rounded-xl border border-border/30 bg-background px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
                                                                        >
                                                                            <option value="unpaid">Unpaid</option>
                                                                            <option value="paid">Paid</option>
                                                                        </select>
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <label className="block text-xs font-medium uppercase tracking-[0.18em] text-foreground/45">Payment Method</label>
                                                                        <select
                                                                            value={editForm.paymentMethod}
                                                                            onChange={(event) => handleEditFieldChange("paymentMethod", event.target.value as PaymentMethod)}
                                                                            className="block w-full rounded-xl border border-border/30 bg-background px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
                                                                        >
                                                                            <option value="razorpay">Razorpay</option>
                                                                            <option value="cash">Manual Cash</option>
                                                                            <option value="manual_upi">Manual UPI</option>
                                                                        </select>
                                                                    </div>
                                                                </div>

                                                                {editForm.paymentMethod === "cash" ? (
                                                                    <div className="space-y-2">
                                                                        <label className="block text-xs font-medium uppercase tracking-[0.18em] text-foreground/45">Cash Amount Collected</label>
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            step="0.01"
                                                                            value={editForm.manualCashAmount}
                                                                            onChange={(event) => handleEditFieldChange("manualCashAmount", event.target.value)}
                                                                            placeholder="Enter collected amount"
                                                                            className="block w-full rounded-xl border border-border/30 bg-background px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
                                                                        />
                                                                    </div>
                                                                ) : null}

                                                                {editForm.paymentMethod === "manual_upi" ? (
                                                                    <div className="space-y-2">
                                                                        <label className="block text-xs font-medium uppercase tracking-[0.18em] text-foreground/45">UPI Transaction ID</label>
                                                                        <input
                                                                            type="text"
                                                                            value={editForm.transactionId}
                                                                            onChange={(event) => handleEditFieldChange("transactionId", event.target.value)}
                                                                            placeholder="Payment proof / transaction ID"
                                                                            className="block w-full rounded-xl border border-border/30 bg-background px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
                                                                        />
                                                                    </div>
                                                                ) : null}

                                                                {editForm.paymentMethod === "razorpay" ? (
                                                                    <>
                                                                        <div className="space-y-2">
                                                                            <label className="block text-xs font-medium uppercase tracking-[0.18em] text-foreground/45">Payment ID</label>
                                                                            <input
                                                                                type="text"
                                                                                value={editForm.paymentId}
                                                                                onChange={(event) => handleEditFieldChange("paymentId", event.target.value)}
                                                                                className="block w-full rounded-xl border border-border/30 bg-background px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <label className="block text-xs font-medium uppercase tracking-[0.18em] text-foreground/45">Order / Transaction ID</label>
                                                                            <input
                                                                                type="text"
                                                                                value={editForm.transactionId}
                                                                                onChange={(event) => handleEditFieldChange("transactionId", event.target.value)}
                                                                                className="block w-full rounded-xl border border-border/30 bg-background px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <label className="block text-xs font-medium uppercase tracking-[0.18em] text-foreground/45">Payment Token / Signature</label>
                                                                            <input
                                                                                type="text"
                                                                                value={editForm.paymentToken}
                                                                                onChange={(event) => handleEditFieldChange("paymentToken", event.target.value)}
                                                                                className="block w-full rounded-xl border border-border/30 bg-background px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
                                                                            />
                                                                        </div>
                                                                    </>
                                                                ) : null}

                                                                <div className="space-y-2">
                                                                    <label className="block text-xs font-medium uppercase tracking-[0.18em] text-foreground/45">Admin Notes</label>
                                                                    <textarea
                                                                        value={editForm.manualPaymentNotes}
                                                                        onChange={(event) => handleEditFieldChange("manualPaymentNotes", event.target.value)}
                                                                        rows={3}
                                                                        className="block w-full rounded-xl border border-border/30 bg-background px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
                                                                    />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-4">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-sm font-medium text-foreground/60">Plan</span>
                                                                    <span className="text-sm font-semibold text-foreground">{plan?.name || "TBD"}</span>
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-sm font-medium text-foreground/60">Expected Amount</span>
                                                                    <span className="text-sm font-semibold text-primary">
                                                                        {plan ? formatInr(plan.priceInr) : "TBD"}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-sm font-medium text-foreground/60">Payment Method</span>
                                                                    <span className="text-sm font-semibold text-foreground">{getPaymentMethodLabel(currentPaymentMethod)}</span>
                                                                </div>
                                                                {currentPaymentMethod === "cash" ? (
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-sm font-medium text-foreground/60">Cash Collected</span>
                                                                        <span className="text-sm font-semibold text-foreground">
                                                                            {formatManualCash(user.manual_cash_amount)}
                                                                        </span>
                                                                    </div>
                                                                ) : null}
                                                                <div className="flex flex-col gap-1 pt-4 border-t border-border/10">
                                                                    <span className="text-xs font-medium text-foreground/60">
                                                                        {currentPaymentMethod === "manual_upi" ? "UPI Transaction ID" : "Payment ID"}
                                                                    </span>
                                                                    <span className="text-xs font-mono text-foreground truncate opacity-80">
                                                                        {currentPaymentMethod === "manual_upi"
                                                                            ? user.transaction_id || "TBD"
                                                                            : user.payment_id || "TBD"}
                                                                    </span>
                                                                </div>
                                                                <div className="flex flex-col gap-1">
                                                                    <span className="text-xs font-medium text-foreground/60">
                                                                        {currentPaymentMethod === "razorpay" ? "Order / Transaction ID" : "Payment Proof"}
                                                                    </span>
                                                                    <span className="text-xs font-mono text-foreground truncate opacity-80">
                                                                        {user.transaction_id || "TBD"}
                                                                    </span>
                                                                </div>
                                                                <div className="flex flex-col gap-1">
                                                                    <span className="text-xs font-medium text-foreground/60">Payment Token / Notes</span>
                                                                    <span className="text-xs font-mono text-foreground truncate opacity-80">
                                                                        {user.payment_token || user.manual_payment_notes || "TBD"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="lg:col-span-4 rounded-xl flex flex-col justify-between gap-4">
                                                        <div>
                                                            <h3 className="text-sm font-semibold text-foreground mb-4">Assessment Link</h3>

                                                            {isEditing ? (
                                                                <div className="space-y-2">
                                                                    <label className="block text-xs font-medium uppercase tracking-[0.18em] text-foreground/45">Psychometric Link</label>
                                                                    <input
                                                                        type="text"
                                                                        value={editForm.psychometricTestLink}
                                                                        onChange={(event) => handleEditFieldChange("psychometricTestLink", event.target.value)}
                                                                        placeholder="Paste URL here..."
                                                                        className="block w-full rounded-xl border border-border/30 bg-background px-4 py-3 text-[14px] text-foreground shadow-sm outline-none transition placeholder:text-foreground/40 focus:border-primary focus:ring-4 focus:ring-primary/20"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-4">
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Paste URL here..."
                                                                        value={displayedLink}
                                                                        onChange={(event) =>
                                                                            setLinkInput((current) => ({
                                                                                ...current,
                                                                                [user.id]: event.target.value,
                                                                            }))
                                                                        }
                                                                        className="block w-full rounded-xl border border-border/30 bg-background px-4 py-3 text-[14px] text-foreground shadow-sm outline-none transition placeholder:text-foreground/40 focus:border-primary focus:ring-4 focus:ring-primary/20"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => void handleSendLink(user.id)}
                                                                        disabled={sendingLink[user.id] || !displayedLink.trim() || currentPaymentStatus !== "paid"}
                                                                        className="w-full relative flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl text-[14px] font-medium transition-all disabled:opacity-50"
                                                                    >
                                                                        {sendingLink[user.id]
                                                                            ? "Sending..."
                                                                            : currentPaymentStatus === "paid"
                                                                                ? "Issue Assessment ->"
                                                                                : "Await Payment"}
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {currentPaymentStatus !== "paid" ? (
                                                            <p className="text-xs font-medium text-rose-500 border border-rose-500/20 bg-rose-500/10 px-3 py-2 rounded-lg text-center">
                                                                Payment pending.
                                                            </p>
                                                        ) : null}

                                                        {(isEditing ? editForm.psychometricTestLink : user.psychometric_test_link) ? (
                                                            <div className="flex items-center text-emerald-600 font-medium text-sm gap-2">
                                                                <span>Link Active</span>
                                                            </div>
                                                        ) : null}
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
