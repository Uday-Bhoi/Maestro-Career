"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, LayoutDashboard, Sparkles, ShieldCheck, ChevronRight, ArrowRight, Mail, Phone, Calendar, User, MapPin, AlertCircle } from "lucide-react";
import { Session } from "@supabase/supabase-js";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InteractiveBackground from "@/components/InteractiveBackground";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

type AuthMode = "login" | "register";
type LoginMode = "password" | "otp";
type RegisterStep = 1 | 2 | 3;
type UserType = "student" | "working_professional";

const COUNTRY_CODES = [
    { code: "+1", label: "US/CA (+1)" },
    { code: "+44", label: "UK (+44)" },
    { code: "+61", label: "Australia (+61)" },
    { code: "+65", label: "Singapore (+65)" },
    { code: "+91", label: "India (+91)" },
    { code: "+971", label: "UAE (+971)" },
];

const CITY_SUGGESTIONS = [
    "Bengaluru",
    "Mumbai",
    "Delhi",
    "Hyderabad",
    "Pune",
    "Chennai",
    "Dubai",
    "London",
    "New York",
    "Singapore",
];

function isValidEmail(value: string) {
    return /^\S+@\S+\.\S+$/.test(value.trim());
}

function isValidName(value: string) {
    return /^[A-Za-z][A-Za-z .'-]{1,99}$/.test(value.trim());
}

function normalizeMobile(countryCode: string, mobile: string) {
    const c = countryCode.replace(/\D/g, "");
    const m = mobile.replace(/\D/g, "");
    return `+${c}${m}`;
}

function passwordRuleFlags(password: string) {
    return {
        length: password.length >= 8,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[^A-Za-z0-9]/.test(password),
    };
}

function isStrongPassword(password: string) {
    const rules = passwordRuleFlags(password);
    return rules.length && rules.upper && rules.lower && rules.number && rules.special;
}

function maskOtpInput(value: string) {
    return value.replace(/\D/g, "").slice(0, 6);
}

async function parseResponse(response: Response) {
    try {
        return await response.json();
    } catch {
        return {} as Record<string, unknown>;
    }
}

function PasswordField({
    label,
    value,
    onChange,
    placeholder,
    visible,
    onToggle,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    visible: boolean;
    onToggle: () => void;
}) {
    return (
        <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-widest text-[#88D0F5]/50 ml-2">{label}</label>
            <div className="relative group">
                <input
                    type={visible ? "text" : "password"}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    className="w-full rounded-2xl border border-white/5 bg-white/[0.03] px-6 py-4 pr-14 text-sm font-bold text-white outline-none transition-all focus:bg-white/[0.05] focus:border-primary focus:ring-4 focus:ring-primary/10 placeholder:text-white/10"
                    placeholder={placeholder}
                    required
                />
                <button
                    type="button"
                    onClick={onToggle}
                    className="absolute inset-y-0 right-0 inline-flex w-14 items-center justify-center rounded-r-2xl text-white/20 transition-all hover:text-primary group-focus-within:text-primary/60"
                    aria-label={visible ? "Hide password" : "Show password"}
                    title={visible ? "Hide password" : "Show password"}
                >
                    <span className={`transition-transform duration-300 ${visible ? "scale-110 rotate-12" : "scale-100 rotate-0"}`}>
                        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </span>
                </button>
            </div>
        </div>
    );
}

export default function AuthPageClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const recoveryMode = searchParams.get("recovery") === "1";
    const recoveryError = searchParams.get("error");
    const resetSuccess = searchParams.get("reset") === "success";

    const [authMode, setAuthMode] = useState<AuthMode>("login");
    const [loginMode, setLoginMode] = useState<LoginMode>("password");
    const [registerStep, setRegisterStep] = useState<RegisterStep>(1);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [otpCooldown, setOtpCooldown] = useState(0);
    const [forgotOpen, setForgotOpen] = useState(false);
    const [forgotRequestSent, setForgotRequestSent] = useState(false);

    const [registerData, setRegisterData] = useState({
        fullName: "",
        email: "",
        countryCode: "+91",
        mobile: "",
        password: "",
        dateOfBirth: "",
        acceptedTerms: false,
        otp: "",
        userType: "student" as UserType,
        studyField: "",
        domain: "",
        companyRole: "",
        city: "",
    });

    const [loginPasswordData, setLoginPasswordData] = useState({
        email: "",
        password: "",
    });

    const [loginOtpData, setLoginOtpData] = useState({
        email: "",
        otp: "",
        otpRequested: false,
    });

    const [forgotEmail, setForgotEmail] = useState("");
    const [recoveryData, setRecoveryData] = useState({
        password: "",
        confirmPassword: "",
    });
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showRecoveryPassword, setShowRecoveryPassword] = useState(false);
    const [showRecoveryConfirmPassword, setShowRecoveryConfirmPassword] = useState(false);

    useEffect(() => {
        if (otpCooldown <= 0) {
            return;
        }

        const timer = window.setInterval(() => {
            setOtpCooldown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => window.clearInterval(timer);
    }, [otpCooldown]);

    useEffect(() => {
        const supabase = createBrowserSupabaseClient();
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string) => {
            if (event === "SIGNED_IN" && !recoveryMode) {
                // If we just signed in and there's a recovery fragment, switch to recovery view
                if (typeof window !== "undefined" && window.location.hash.includes("type=recovery")) {
                    router.replace("/auth?recovery=1");
                }
            }
        });
        return () => subscription.unsubscribe();
    }, [recoveryMode, router]);

    useEffect(() => {
        if (recoveryMode && !resetSuccess && !recoveryError) {
            setError("");
            setMessage("Checking your recovery link...");
        }
    }, [recoveryMode, resetSuccess, recoveryError]);

    useEffect(() => {
        if (!recoveryMode || resetSuccess || recoveryError) {
            return;
        }

        let active = true;
        let retryCount = 0;
        const maxRetries = 10; // Increased retries

        const supabase = createBrowserSupabaseClient();

        // 1. Listen for the EXACT moment the session is established via hash
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: Session | null) => {
            if (active && (event === "SIGNED_IN" || event === "PASSWORD_RECOVERY") && session) {
                setMessage("Link verified! You can now set your new password.");
                setError("");
            }
        });

        // 2. Poll getSession as a backup (with manual hash fallback)
        const syncRecoverySession = async () => {
            try {
                const { data: { session: existingSession } } = await supabase.auth.getSession();

                // If it's still missing, try to manually set it from the hash
                if (!existingSession && typeof window !== "undefined" && window.location.hash.includes("access_token=")) {
                    const hash = window.location.hash.substring(1);
                    const params = new URLSearchParams(hash);
                    const accessToken = params.get("access_token");
                    const refreshToken = params.get("refresh_token");

                    if (accessToken && refreshToken) {
                        const { data: { session: newSession }, error: setSessionError } = await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken,
                        });

                        if (newSession && active) {
                            setError("");
                            setMessage("Link verified! (Manual) You can now set your new password.");
                            return;
                        }
                        if (setSessionError) {
                            console.error("Manual setSession failed:", setSessionError.message);
                        }
                    }
                }

                if (!existingSession && active) {
                    const hasAccess = typeof window !== "undefined" && (window.location.hash.includes("access_token=") || window.location.hash.includes("type=recovery"));
                    const hasCode = searchParams.get("code");

                    if (retryCount < maxRetries) {
                        retryCount++;
                        const delay = (hasAccess || hasCode) ? 1500 : 800;
                        setTimeout(syncRecoverySession, delay);
                        return;
                    }

                    // Only show formal error if we have waited long enough and no signs of login exist
                    if (!hasAccess && !hasCode) {
                        setError("Auth session missing! Please ensure you use the latest link from your email and cookies are enabled.");
                    }
                } else if (existingSession && active) {
                    setError((prev) => prev.includes("Auth session") ? "" : prev);
                    setMessage("Link verified! You can now set your new password.");
                }
            } catch (sessionError) {
                if (!active) return;
                setError(sessionError instanceof Error ? sessionError.message : "Unable to prepare password recovery.");
            }
        };

        syncRecoverySession();
        return () => {
            active = false;
            subscription.unsubscribe();
        };
    }, [recoveryMode, resetSuccess, recoveryError, searchParams]);

    useEffect(() => {
        if (recoveryError === "otp_only") {
            setError("Email sign-in links are disabled. Please use the 6-digit OTP from your email to continue.");
            setMessage("");
            return;
        }

        if (recoveryError === "invalid_or_expired_link") {
            const details = searchParams.get("details");
            const detailMsg = details ? ` (${details})` : "";
            setError(`This recovery link is invalid or expired. Please request a new password reset email.${detailMsg}`);
            setMessage("");
            return;
        }

        if (resetSuccess) {
            setMessage("Password reset successful. You can now log in with your new password.");
            setError("");
        }
    }, [recoveryError, resetSuccess, searchParams]);

    const registerPasswordRules = passwordRuleFlags(registerData.password);
    const recoveryPasswordRules = passwordRuleFlags(recoveryData.password);
    const normalizedRegisterMobile = normalizeMobile(registerData.countryCode, registerData.mobile);
    const isRegisterStepOneValid =
        isValidName(registerData.fullName) &&
        isValidEmail(registerData.email) &&
        /^\+\d{8,15}$/.test(normalizedRegisterMobile) &&
        isStrongPassword(registerData.password) &&
        Boolean(registerData.dateOfBirth) &&
        registerData.acceptedTerms;
    const isRegisterStepThreeValid =
        isValidName(registerData.fullName) &&
        registerData.city.trim().length > 0 &&
        ((registerData.userType === "student" && registerData.studyField.trim().length >= 2) ||
            (registerData.userType === "working_professional" &&
                registerData.domain.trim().length >= 2 &&
                registerData.companyRole.trim().length >= 2));
    const isRecoveryValid =
        isStrongPassword(recoveryData.password) &&
        recoveryData.password === recoveryData.confirmPassword;

    const clearFeedback = () => {
        setError("");
        setMessage("");
    };

    const pushToDashboard = () => {
        router.push("/dashboard");
        router.refresh();
    };

    const switchMode = (mode: AuthMode) => {
        setAuthMode(mode);
        clearFeedback();
        setForgotOpen(false);
        if (mode === "register") {
            setRegisterStep(1);
        }
    };

    const handleRegisterRequestOtp = async (event?: FormEvent) => {
        event?.preventDefault();
        if (!isRegisterStepOneValid) {
            return;
        }

        clearFeedback();
        setLoading(true);

        try {
            const response = await fetch("/api/auth/register/request-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName: registerData.fullName,
                    email: registerData.email,
                    countryCode: registerData.countryCode,
                    mobile: registerData.mobile,
                    password: registerData.password,
                    dateOfBirth: registerData.dateOfBirth,
                    acceptedTerms: registerData.acceptedTerms,
                }),
            });
            const data = await parseResponse(response);

            if (!response.ok || !data.success) {
                throw new Error((data.message as string) || "Failed to send the verification OTP.");
            }

            setRegisterData((prev) => ({ ...prev, otp: "" }));
            setRegisterStep(2);
            setOtpCooldown(30);
            setMessage(`Email OTP sent to ${(data.target as string) || registerData.email}.`);
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : "Failed to send the verification OTP.");
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterVerifyOtp = async (event: FormEvent) => {
        event.preventDefault();
        clearFeedback();
        setLoading(true);

        try {
            const response = await fetch("/api/auth/register/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: registerData.email,
                    otp: registerData.otp,
                }),
            });
            const data = await parseResponse(response);

            if (!response.ok || !data.success) {
                throw new Error((data.message as string) || "Failed to verify the OTP.");
            }

            setRegisterStep(3);
            setMessage("Email verified. Complete your profile to finish registration.");
        } catch (verifyError) {
            setError(verifyError instanceof Error ? verifyError.message : "Failed to verify the OTP.");
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteProfile = async (event: FormEvent) => {
        event.preventDefault();
        if (!isRegisterStepThreeValid) {
            return;
        }

        clearFeedback();
        setLoading(true);

        try {
            const response = await fetch("/api/auth/profile/setup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: registerData.fullName,
                    preferredServices: [],
                    userType: registerData.userType,
                    studyField: registerData.userType === "student" ? registerData.studyField : "",
                    domain: registerData.userType === "working_professional" ? registerData.domain : "",
                    companyRole: registerData.userType === "working_professional" ? registerData.companyRole : "",
                    city: registerData.city,
                }),
            });
            const data = await parseResponse(response);

            if (!response.ok || !data.success) {
                throw new Error((data.message as string) || "Failed to save your profile.");
            }

            setMessage("Registration complete. Redirecting to your dashboard...");
            pushToDashboard();
        } catch (profileError) {
            setError(profileError instanceof Error ? profileError.message : "Failed to save your profile.");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordLogin = async (event: FormEvent) => {
        event.preventDefault();
        clearFeedback();
        setLoading(true);

        try {
            const response = await fetch("/api/auth/login/password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(loginPasswordData),
            });
            const data = await parseResponse(response);

            if (!response.ok || !data.success) {
                throw new Error((data.message as string) || "Failed to log in with password.");
            }

            setMessage("Login successful. Redirecting to your dashboard...");
            pushToDashboard();
        } catch (loginError) {
            setError(loginError instanceof Error ? loginError.message : "Failed to log in with password.");
        } finally {
            setLoading(false);
        }
    };

    const handleLoginRequestOtp = async (event?: FormEvent) => {
        event?.preventDefault();
        if (!isValidEmail(loginOtpData.email)) {
            setError("Enter a valid email address.");
            return;
        }

        clearFeedback();
        setLoading(true);

        try {
            const response = await fetch("/api/auth/login/request-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: loginOtpData.email }),
            });
            const data = await parseResponse(response);

            if (!response.ok || !data.success) {
                throw new Error((data.message as string) || "Failed to send the login OTP.");
            }

            setLoginOtpData((prev) => ({ ...prev, otpRequested: true, otp: "" }));
            setOtpCooldown(30);
            setMessage(`Login OTP sent to ${(data.target as string) || loginOtpData.email}.`);
        } catch (otpError) {
            setError(otpError instanceof Error ? otpError.message : "Failed to send the login OTP.");
        } finally {
            setLoading(false);
        }
    };

    const handleLoginVerifyOtp = async (event: FormEvent) => {
        event.preventDefault();
        clearFeedback();
        setLoading(true);

        try {
            const response = await fetch("/api/auth/login/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: loginOtpData.email,
                    otp: loginOtpData.otp,
                }),
            });
            const data = await parseResponse(response);

            if (!response.ok || !data.success) {
                throw new Error((data.message as string) || "Failed to verify the login OTP.");
            }

            setMessage("Login successful. Redirecting to your dashboard...");
            pushToDashboard();
        } catch (verifyError) {
            setError(verifyError instanceof Error ? verifyError.message : "Failed to verify the login OTP.");
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPasswordRequest = async (event: FormEvent) => {
        event.preventDefault();
        if (!isValidEmail(forgotEmail)) {
            setError("Enter a valid email address.");
            return;
        }

        clearFeedback();
        setLoading(true);

        try {
            const response = await fetch("/api/auth/forgot-password/request-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: forgotEmail }),
            });
            const data = await parseResponse(response);

            if (!response.ok || !data.success) {
                throw new Error((data.message as string) || "Failed to send the reset email.");
            }

            setForgotRequestSent(true);
            setMessage(`Password reset link sent to ${(data.target as string) || forgotEmail}.`);
        } catch (forgotError) {
            setError(forgotError instanceof Error ? forgotError.message : "Failed to send the reset email.");
        } finally {
            setLoading(false);
        }
    };

    const handleRecoveryReset = async (event: FormEvent) => {
        event.preventDefault();
        if (!isRecoveryValid) {
            if (recoveryData.password !== recoveryData.confirmPassword) {
                setError("Passwords do not match.");
            } else {
                setError("Use a strong password that meets all the rules.");
            }
            return;
        }

        clearFeedback();
        setLoading(true);

        try {
            const supabase = createBrowserSupabaseClient();
            const { error } = await supabase.auth.updateUser({
                password: recoveryData.password,
            });

            if (error) {
                throw new Error(error.message || "Failed to reset your password.");
            }

            try {
                const supabase = createBrowserSupabaseClient();
                await supabase.auth.signOut();
            } catch {
                // Ignore sign-out cleanup errors after a successful password reset.
            }

            setAuthMode("login");
            router.replace("/auth?reset=success");
            router.refresh();
        } catch (resetError) {
            setError(resetError instanceof Error ? resetError.message : "Failed to reset your password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#050B15] selection:bg-primary/30 relative overflow-hidden">
            <InteractiveBackground />
            <Header />

            <section className="relative z-10 py-14 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 lg:items-center">

                        {/* Information Cluster */}
                        <div className="hidden lg:flex flex-col gap-12">
                            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 rounded-full border border-white/10 w-fit">
                                <Sparkles className="w-4 h-4 text-primary" />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50">Next-Gen Career Intelligence</span>
                            </div>

                            <div className="space-y-6">
                                <h1 className="text-7xl xl:text-8xl font-black text-white leading-[0.85] uppercase italic tracking-tightest">
                                    Define <br />
                                    Your <span className="text-primary underline decoration-primary/20 underline-offset-[12px]">Legacy.</span>
                                </h1>
                                <p className="max-w-md text-white/40 font-bold uppercase tracking-widest text-[11px] leading-loose">
                                    Join an elite ecosystem of innovators. Authenticate to access proprietary psychometric frameworks and tailored industrial roadmaps.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-8 max-w-sm">
                                <div className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/5 backdrop-blur-3xl">
                                    <p className="text-4xl font-black text-white tracking-tightest italic">48k+</p>
                                    <p className="mt-2 text-[9px] font-black text-primary uppercase tracking-[0.2em]">Verified Users</p>
                                </div>
                                <div className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/5 backdrop-blur-3xl">
                                    <p className="text-4xl font-black text-white tracking-tightest italic">99%</p>
                                    <p className="mt-2 text-[9px] font-black text-primary uppercase tracking-[0.2em]">Success Index</p>
                                </div>
                            </div>
                        </div>

                        {/* Authentication Module */}
                        <div className="w-full max-w-xl mx-auto">
                            <div className="rounded-[3.5rem] border border-white/10 bg-black/40 backdrop-blur-3xl p-10 md:p-14 shadow-3xl shadow-primary/5 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-primary/20 transition-all duration-1000" />
                                {message && (
                                    <div className="mb-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-emerald-400 animate-in fade-in slide-in-from-top-4 duration-500">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                            {message}
                                        </div>
                                    </div>
                                )}
                                {error && (
                                    <div className="mb-8 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-rose-400 animate-in fade-in slide-in-from-top-4 duration-500 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                                            {error}
                                        </div>
                                    </div>
                                )}

                                <div className="relative z-10">
                                    {recoveryMode ? (
                                        <div className="space-y-10 animate-in fade-in duration-700">
                                            <div className="text-center">
                                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 mb-4">
                                                    <ShieldCheck className="w-3 h-3 text-primary" />
                                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-primary">Secure Recovery</span>
                                                </div>
                                                <h2 className="text-3xl font-black text-white uppercase italic tracking-tightest">Synchronize Password</h2>
                                                <p className="mt-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">Digital signature reset in progress</p>
                                            </div>

                                            <form onSubmit={handleRecoveryReset} className="space-y-6">
                                                <PasswordField
                                                    label="New Credentials"
                                                    value={recoveryData.password}
                                                    onChange={(value) => setRecoveryData((prev) => ({ ...prev, password: value }))}
                                                    placeholder="Enter new password"
                                                    visible={showRecoveryPassword}
                                                    onToggle={() => setShowRecoveryPassword((prev) => !prev)}
                                                />
                                                <PasswordField
                                                    label="Verify Credentials"
                                                    value={recoveryData.confirmPassword}
                                                    onChange={(value) => setRecoveryData((prev) => ({ ...prev, confirmPassword: value }))}
                                                    placeholder="Repeat new password"
                                                    visible={showRecoveryConfirmPassword}
                                                    onToggle={() => setShowRecoveryConfirmPassword((prev) => !prev)}
                                                />

                                                <div className="grid grid-cols-2 gap-3 py-2">
                                                    {[
                                                        { label: "Complexity", met: recoveryPasswordRules.length },
                                                        { label: "Uppercase", met: recoveryPasswordRules.upper },
                                                        { label: "Lowercase", met: recoveryPasswordRules.lower },
                                                        { label: "Numerical", met: recoveryPasswordRules.number },
                                                        { label: "Symbolic", met: recoveryPasswordRules.special },
                                                        { label: "Registry Match", met: recoveryData.password === recoveryData.confirmPassword && recoveryData.confirmPassword }
                                                    ].map((rule, i) => (
                                                        <div key={i} className="flex items-center gap-2">
                                                            <div className={`w-1 h-1 rounded-full ${rule.met ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-white/10'}`} />
                                                            <span className={`text-[9px] font-black uppercase tracking-widest ${rule.met ? 'text-white/70' : 'text-white/20'}`}>{rule.label}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                <button
                                                    type="submit"
                                                    disabled={loading || !isRecoveryValid}
                                                    className="w-full relative group/btn overflow-hidden bg-primary hover:bg-primary/90 text-white px-8 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all disabled:opacity-50 active:scale-95 shadow-xl shadow-primary/20"
                                                >
                                                    <span className="relative z-10 flex items-center justify-center gap-3">
                                                        {loading ? "Reconfiguring..." : "Calibrate Access"} <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                                    </span>
                                                </button>
                                            </form>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                                                <div className="flex gap-4 p-2 bg-white/5 rounded-[2.2rem] border border-white/5 mb-12">
                                                    <button
                                                        onClick={() => switchMode("login")}
                                                        className={`flex-1 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${authMode === 'login' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                                                    >
                                                        Access Portal
                                                    </button>
                                                    <button
                                                        onClick={() => switchMode("register")}
                                                        className={`flex-1 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${authMode === 'register' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                                                    >
                                                        Enlist
                                                    </button>
                                                </div>

                                                {authMode === "login" && (
                                                    <div className="space-y-10">
                                                        <div className="flex items-center gap-6 border-b border-white/5 pb-10">
                                                            <button
                                                                onClick={() => { clearFeedback(); setLoginMode("password"); setForgotOpen(false); }}
                                                                className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors relative ${loginMode === 'password' ? 'text-primary' : 'text-white/30 hover:text-white/60'}`}
                                                            >
                                                                Password Cluster
                                                                {loginMode === 'password' && <div className="absolute -bottom-[41px] left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_#22d3ee]" />}
                                                            </button>
                                                            <button
                                                                onClick={() => { clearFeedback(); setLoginMode("otp"); setForgotOpen(false); }}
                                                                className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors relative ${loginMode === 'otp' ? 'text-primary' : 'text-white/30 hover:text-white/60'}`}
                                                            >
                                                                OTP Synchronization
                                                                {loginMode === 'otp' && <div className="absolute -bottom-[41px] left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_#22d3ee]" />}
                                                            </button>
                                                        </div>

                                                        {loginMode === "password" && (
                                                            <form onSubmit={handlePasswordLogin} className="space-y-6">
                                                                <div className="space-y-2">
                                                                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#88D0F5]/50 ml-2">Digital Mail</label>
                                                                    <div className="relative group">
                                                                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-primary transition-colors" />
                                                                        <input
                                                                            type="email"
                                                                            value={loginPasswordData.email}
                                                                            onChange={(e) => setLoginPasswordData(prev => ({ ...prev, email: e.target.value }))}
                                                                            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-white outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-white/5"
                                                                            placeholder="identifier@maestro.com"
                                                                            required
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <PasswordField
                                                                    label="Security Key"
                                                                    value={loginPasswordData.password}
                                                                    onChange={(v) => setLoginPasswordData(prev => ({ ...prev, password: v }))}
                                                                    placeholder="Enter security token"
                                                                    visible={showLoginPassword}
                                                                    onToggle={() => setShowLoginPassword(!showLoginPassword)}
                                                                />
                                                                <div className="flex items-center justify-between pt-6">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => { clearFeedback(); setForgotOpen(!forgotOpen); setForgotRequestSent(false); setForgotEmail(loginPasswordData.email); }}
                                                                        className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors"
                                                                    >
                                                                        Decrypt Access?
                                                                    </button>
                                                                    <button
                                                                        type="submit"
                                                                        disabled={loading}
                                                                        className="bg-white text-black px-10 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-primary hover:text-white transition-all active:scale-95 shadow-2xl shadow-primary/10"
                                                                    >
                                                                        {loading ? "Authenticating..." : "Establish Access"}
                                                                    </button>
                                                                </div>
                                                            </form>
                                                        )}

                                                        {loginMode === "otp" && (
                                                            <form onSubmit={loginOtpData.otpRequested ? handleLoginVerifyOtp : handleLoginRequestOtp} className="space-y-8 animate-in fade-in duration-500">
                                                                <div className="space-y-2">
                                                                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#88D0F5]/50 ml-2">Distribution Node (Email)</label>
                                                                    <div className="relative group">
                                                                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-primary transition-colors" />
                                                                        <input
                                                                            type="email"
                                                                            value={loginOtpData.email}
                                                                            onChange={(e) => setLoginOtpData(prev => ({ ...prev, email: e.target.value, otpRequested: prev.email === e.target.value ? prev.otpRequested : false, otp: "" }))}
                                                                            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-white outline-none focus:border-primary transition-all"
                                                                            placeholder="identifier@nexus.com"
                                                                            required
                                                                        />
                                                                    </div>
                                                                </div>

                                                                {loginOtpData.otpRequested && (
                                                                    <div className="space-y-4">
                                                                        <label className="block text-[10px] font-black uppercase tracking-widest text-primary ml-2">6-Digit Sync Hash</label>
                                                                        <input
                                                                            type="text"
                                                                            value={loginOtpData.otp}
                                                                            onChange={(e) => setLoginOtpData(prev => ({ ...prev, otp: maskOtpInput(e.target.value) }))}
                                                                            className="w-full bg-white/[0.05] border border-primary/30 rounded-2xl px-6 py-6 text-center text-4xl font-black text-white tracking-[0.6em] outline-none shadow-xl shadow-primary/5 focus:ring-8 focus:ring-primary/5"
                                                                            placeholder="000000"
                                                                            maxLength={6}
                                                                            required
                                                                        />
                                                                    </div>
                                                                )}

                                                                <div className="flex items-center justify-between pt-4">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => void handleLoginRequestOtp()}
                                                                        disabled={otpCooldown > 0 || loading}
                                                                        className="text-[10px] font-black uppercase tracking-widest text-white/30 disabled:text-primary/40 hover:text-white transition-colors"
                                                                    >
                                                                        {otpCooldown > 0 ? `SYNC LOCK: ${otpCooldown}s` : "RESEND PROTOCOL"}
                                                                    </button>
                                                                    <button
                                                                        type="submit"
                                                                        disabled={loading || (loginOtpData.otpRequested && loginOtpData.otp.length !== 6)}
                                                                        className="bg-primary text-white px-10 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all active:scale-95 shadow-xl shadow-primary/20"
                                                                    >
                                                                        {loading ? "Transmitting..." : loginOtpData.otpRequested ? "Verify Sync" : "Request OTP"}
                                                                    </button>
                                                                </div>
                                                            </form>
                                                        )}

                                                        {forgotOpen && (
                                                            <form onSubmit={handleForgotPasswordRequest} className="mt-12 p-10 rounded-[3rem] bg-rose-500/5 border border-rose-500/10 animate-in zoom-in-95 duration-500">
                                                                <div className="flex items-center gap-3 mb-6">
                                                                    <ShieldCheck className="w-4 h-4 text-rose-500" />
                                                                    <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Identity Recovery</h3>
                                                                </div>
                                                                <input
                                                                    type="email"
                                                                    value={forgotEmail}
                                                                    onChange={(e) => setForgotEmail(e.target.value)}
                                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 text-sm font-bold text-white outline-none focus:border-rose-500 transition-all mb-8 placeholder:text-white/10"
                                                                    placeholder="Email for recovery link"
                                                                    required
                                                                />
                                                                <div className="flex items-center justify-between">
                                                                    <button type="button" onClick={() => { setForgotOpen(false); setForgotRequestSent(false); clearFeedback(); }} className="text-[10px] font-black text-white/20 hover:text-white uppercase tracking-widest">Abort</button>
                                                                    <button type="submit" disabled={loading} className="bg-rose-500 text-white px-10 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/10">Transmit Link</button>
                                                                </div>
                                                                {forgotRequestSent && <p className="mt-6 text-[9px] font-black text-emerald-400 uppercase tracking-widest text-center italic border-t border-white/5 pt-6">Signal Sent successfully. verify your grid.</p>}
                                                            </form>
                                                        )}
                                                    </div>
                                                )}

                                                {authMode === "register" && (
                                                    <div className="space-y-10 animate-in fade-in translate-y-4 duration-700">
                                                        <div className="grid grid-cols-3 gap-2">
                                                            {[1, 2, 3].map((s) => (
                                                                <div key={s} className="space-y-3">
                                                                    <div className={`h-1.5 rounded-full transition-all duration-700 ${registerStep >= s ? 'bg-primary shadow-[0_0_10px_#22d3ee]' : 'bg-white/5'}`} />
                                                                    <p className={`text-[8px] font-black uppercase tracking-[0.2em] text-center ${registerStep === s ? 'text-white' : 'text-white/20'}`}>Node 0{s}</p>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {registerStep === 1 && (
                                                            <form onSubmit={handleRegisterRequestOtp} className="space-y-6">
                                                                <div className="space-y-2">
                                                                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#88D0F5]/50 ml-2">Legal Name</label>
                                                                    <div className="relative group">
                                                                        <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-primary transition-colors" />
                                                                        <input type="text" value={registerData.fullName} onChange={(e) => setRegisterData(prev => ({ ...prev, fullName: e.target.value }))} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-white outline-none focus:border-primary transition-all placeholder:text-white/5" placeholder="Your full name" required />
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#88D0F5]/50 ml-2">Communication Node (Email)</label>
                                                                    <div className="relative group">
                                                                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-primary transition-colors" />
                                                                        <input type="email" value={registerData.email} onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-white outline-none focus:border-primary transition-all placeholder:text-white/5" placeholder="identifier@domain.com" required />
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-[120px_1fr] gap-4">
                                                                    <div className="space-y-2">
                                                                        <label className="block text-[10px] font-black uppercase tracking-widest text-[#88D0F5]/50 ml-2">Area Code</label>
                                                                        <select value={registerData.countryCode} onChange={(e) => setRegisterData(prev => ({ ...prev, countryCode: e.target.value }))} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-4 py-4 text-sm font-bold text-white outline-none focus:border-primary transition-all appearance-none cursor-pointer">
                                                                            {COUNTRY_CODES.map(c => <option key={c.code} value={c.code} className="bg-[#050B15] text-white">{c.code}</option>)}
                                                                        </select>
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <label className="block text-[10px] font-black uppercase tracking-widest text-[#88D0F5]/50 ml-2">Link Number</label>
                                                                        <div className="relative group">
                                                                            <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-primary transition-colors" />
                                                                            <input type="tel" value={registerData.mobile} onChange={(e) => setRegisterData(prev => ({ ...prev, mobile: e.target.value }))} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-white outline-none focus:border-primary transition-all placeholder:text-white/5" placeholder="9876543210" required />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <PasswordField label="Access Token" value={registerData.password} onChange={(v) => setRegisterData(prev => ({ ...prev, password: v }))} placeholder="Create robust password" visible={showRegisterPassword} onToggle={() => setShowRegisterPassword(!showRegisterPassword)} />
                                                                <div className="space-y-2">
                                                                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#88D0F5]/50 ml-2">Origin Date (DOB)</label>
                                                                    <div className="relative group">
                                                                        <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-primary transition-colors" />
                                                                        <input type="date" value={registerData.dateOfBirth} onChange={(e) => setRegisterData(prev => ({ ...prev, dateOfBirth: e.target.value }))} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-white outline-none focus:border-primary transition-all" required />
                                                                    </div>
                                                                </div>
                                                                <label className="flex items-baseline gap-4 cursor-pointer group/check">
                                                                    <input type="checkbox" checked={registerData.acceptedTerms} onChange={(e) => setRegisterData(prev => ({ ...prev, acceptedTerms: e.target.checked }))} className="mt-1 accent-primary" />
                                                                    <span className="text-[10px] font-bold text-white/30 group-hover/check:text-white/60 transition-colors uppercase tracking-[0.1em] leading-relaxed">Accept Maestro protocols, privacy index, and digital verification flow.</span>
                                                                </label>
                                                                <button type="submit" disabled={!isRegisterStepOneValid || loading} className="w-full bg-primary hover:bg-white hover:text-black text-white py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-xl shadow-primary/20 active:scale-95 disabled:opacity-50">
                                                                    {loading ? "Initializing..." : "Proceed to Node 02"}
                                                                </button>
                                                            </form>
                                                        )}

                                                        {registerStep === 2 && (
                                                            <form onSubmit={handleRegisterVerifyOtp} className="space-y-8 animate-in zoom-in-95 duration-500">
                                                                <div className="text-center">
                                                                    <h3 className="text-2xl font-black text-white uppercase italic mb-2">Sync Verification</h3>
                                                                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-loose">Enter the verification hash dispatched to <br /> <span className="text-primary">{registerData.email}</span></p>
                                                                </div>
                                                                <input type="text" value={registerData.otp} onChange={(e) => setRegisterData(prev => ({ ...prev, otp: maskOtpInput(e.target.value) }))} className="w-full bg-white/[0.05] border border-primary/30 rounded-[2.5rem] px-6 py-10 text-center text-5xl font-black text-white tracking-[0.8em] outline-none focus:ring-[12px] focus:ring-primary/5 transition-all shadow-3xl shadow-primary/5" placeholder="000000" maxLength={6} required />
                                                                <div className="flex items-center justify-between">
                                                                    <button type="button" onClick={() => setRegisterStep(1)} className="text-[10px] font-black text-white/20 hover:text-white uppercase tracking-widest transition-colors">Reconfigure</button>
                                                                    <button type="submit" disabled={loading || registerData.otp.length !== 6} className="bg-white text-black px-12 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-primary hover:text-white transition-all shadow-2xl active:scale-95">Validate Node</button>
                                                                </div>
                                                            </form>
                                                        )}

                                                        {registerStep === 3 && (
                                                            <form onSubmit={handleCompleteProfile} className="space-y-8 animate-in slide-in-from-right-8 duration-700">
                                                                <div className="space-y-4">
                                                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#88D0F5]/50 ml-2">Legacy Class</label>
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <button type="button" onClick={() => setRegisterData(prev => ({ ...prev, userType: 'student', domain: '', companyRole: '' }))} className={`py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${registerData.userType === 'student' ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20' : 'bg-white/5 border-white/5 text-white/30 hover:text-white hover:bg-white/10'}`}>Student Entry</button>
                                                                        <button type="button" onClick={() => setRegisterData(prev => ({ ...prev, userType: 'working_professional', studyField: '' }))} className={`py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${registerData.userType === 'working_professional' ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20' : 'bg-white/5 border-white/5 text-white/30 hover:text-white hover:bg-white/10'}`}>Pro Entry</button>
                                                                    </div>
                                                                </div>

                                                                {registerData.userType === 'student' ? (
                                                                    <div className="space-y-2">
                                                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#88D0F5]/50 ml-2">Current Stream</label>
                                                                        <input type="text" value={registerData.studyField} onChange={(e) => setRegisterData(prev => ({ ...prev, studyField: e.target.value }))} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-primary transition-all placeholder:text-white/5" placeholder="B.Tech, MBA, etc" required />
                                                                    </div>
                                                                ) : (
                                                                    <div className="space-y-6">
                                                                        <div className="space-y-2">
                                                                            <label className="text-[10px] font-black uppercase tracking-widest text-[#88D0F5]/50 ml-2">Active Domain</label>
                                                                            <input type="text" value={registerData.domain} onChange={(e) => setRegisterData(prev => ({ ...prev, domain: e.target.value }))} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-primary transition-all placeholder:text-white/5" placeholder="Software, Design, etc" required />
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <label className="text-[10px] font-black uppercase tracking-widest text-[#88D0F5]/50 ml-2">Designation</label>
                                                                            <input type="text" value={registerData.companyRole} onChange={(e) => setRegisterData(prev => ({ ...prev, companyRole: e.target.value }))} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-primary transition-all placeholder:text-white/5" placeholder="Current Role" required />
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                <div className="space-y-2">
                                                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#88D0F5]/50 ml-2">Geo-Location (City)</label>
                                                                    <div className="relative group">
                                                                        <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-primary transition-colors" />
                                                                        <input list="auth-city-suggestions" value={registerData.city} onChange={(e) => setRegisterData(prev => ({ ...prev, city: e.target.value }))} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-white outline-none focus:border-primary transition-all placeholder:text-white/5" placeholder="Current City" required />
                                                                        <datalist id="auth-city-suggestions">{CITY_SUGGESTIONS.map(c => <option key={c} value={c} />)}</datalist>
                                                                    </div>
                                                                </div>

                                                                <button type="submit" disabled={loading || !isRegisterStepThreeValid} className="w-full bg-white text-black py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.4em] hover:bg-primary hover:text-white transition-all shadow-2xl active:scale-95 shadow-white/5 overflow-hidden relative group/btn">
                                                                    <span className="relative z-10 flex items-center justify-center gap-3">
                                                                        {loading ? "Establishing Nexus..." : "Launch Dashboard"} <Sparkles className="w-4 h-4" />
                                                                    </span>
                                                                </button>
                                                            </form>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
