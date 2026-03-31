"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type AuthMode = "login" | "register";
type LoginMode = "password" | "otp";
type RegisterStep = 1 | 2 | 3;
type UserType = "student" | "working_professional";
type ForgotStep = "request" | "verify" | "reset";

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

function normalizeMobile(countryCode: string, mobile: string) {
    const c = countryCode.replace(/\D/g, "");
    const m = mobile.replace(/\D/g, "");
    return `+${c}${m}`;
}

function isValidName(value: string) {
    return /^[A-Za-z][A-Za-z .'-]{1,99}$/.test(value.trim());
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

export default function AuthPage() {
    const router = useRouter();

    const [authMode, setAuthMode] = useState<AuthMode>("login");
    const [loginMode, setLoginMode] = useState<LoginMode>("password");
    const [registerStep, setRegisterStep] = useState<RegisterStep>(1);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [otpCooldown, setOtpCooldown] = useState(0);
    const [forgotOpen, setForgotOpen] = useState(false);
    const [forgotStep, setForgotStep] = useState<ForgotStep>("request");

    const [registerData, setRegisterData] = useState({
        fullName: "",
        email: "",
        countryCode: "+91",
        mobile: "",
        password: "",
        dateOfBirth: "",
        acceptedTerms: false,
        otp: "",
        debugOtp: "",
        userType: "student" as UserType,
        studyField: "",
        domain: "",
        companyRole: "",
        city: "",
    });

    const [loginPasswordData, setLoginPasswordData] = useState({
        identifier: "",
        password: "",
        rememberMe: true,
    });

    const [loginOtpData, setLoginOtpData] = useState({
        countryCode: "+91",
        mobile: "",
        otp: "",
        otpRequested: false,
        debugOtp: "",
    });

    const [forgotData, setForgotData] = useState({
        identifier: "",
        otp: "",
        resetToken: "",
        password: "",
        confirmPassword: "",
        debugOtp: "",
    });

    useEffect(() => {
        if (otpCooldown <= 0) {
            return;
        }

        const timer = window.setInterval(() => {
            setOtpCooldown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => window.clearInterval(timer);
    }, [otpCooldown]);

    const registerPasswordRules = useMemo(
        () => passwordRuleFlags(registerData.password),
        [registerData.password]
    );

    const isRegisterStepOneValid = useMemo(() => {
        const mobileFull = normalizeMobile(registerData.countryCode, registerData.mobile);
        return (
            isValidName(registerData.fullName) &&
            isValidEmail(registerData.email) &&
            /^\+\d{8,15}$/.test(mobileFull) &&
            isStrongPassword(registerData.password) &&
            !!registerData.dateOfBirth &&
            registerData.acceptedTerms
        );
    }, [registerData]);

    const profileSubmitDisabled = useMemo(() => {
        if (!isValidName(registerData.fullName)) {
            return true;
        }
        if (!registerData.city.trim()) {
            return true;
        }
        if (registerData.userType === "student" && registerData.studyField.trim().length < 2) {
            return true;
        }
        if (
            registerData.userType === "working_professional" &&
            (registerData.domain.trim().length < 2 || registerData.companyRole.trim().length < 2)
        ) {
            return true;
        }
        return false;
    }, [registerData]);

    const clearFeedback = () => {
        setError("");
        setMessage("");
    };

    const switchMode = (mode: AuthMode) => {
        setAuthMode(mode);
        clearFeedback();
    };

    const handleRegisterRequestOtp = async (e: FormEvent) => {
        e.preventDefault();
        if (!isRegisterStepOneValid) {
            return;
        }

        clearFeedback();
        setLoading(true);

        try {
            const resp = await fetch("/api/auth/register/request-otp", {
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
            const data = await resp.json();
            if (!resp.ok || !data.success) {
                throw new Error(data.message || "Failed to request OTP.");
            }

            setRegisterData((prev) => ({
                ...prev,
                debugOtp: data.debugOtp ?? "",
                otp: "",
            }));
            setMessage(`OTP sent to ${data.targets?.email} and ${data.targets?.mobile}.`);
            setRegisterStep(2);
            setOtpCooldown(30);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to request OTP.");
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterVerifyOtp = async (e: FormEvent) => {
        e.preventDefault();
        clearFeedback();
        setLoading(true);

        try {
            const resp = await fetch("/api/auth/register/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: registerData.email,
                    countryCode: registerData.countryCode,
                    mobile: registerData.mobile,
                    otp: registerData.otp,
                }),
            });
            const data = await resp.json();
            if (!resp.ok || !data.success) {
                throw new Error(data.message || "Failed to verify OTP.");
            }

            setMessage("OTP verified. Complete your profile to continue.");
            setRegisterStep(3);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to verify OTP.");
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteProfile = async (e: FormEvent) => {
        e.preventDefault();
        if (profileSubmitDisabled) {
            return;
        }

        clearFeedback();
        setLoading(true);

        try {
            const resp = await fetch("/api/auth/profile/setup", {
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
            const data = await resp.json();
            if (!resp.ok || !data.success) {
                throw new Error(data.message || "Failed to save profile.");
            }

            setMessage("Registration complete. Redirecting to dashboard...");
            router.push("/dashboard");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save profile.");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordLogin = async (e: FormEvent) => {
        e.preventDefault();
        clearFeedback();
        setLoading(true);

        try {
            const resp = await fetch("/api/auth/login/password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    identifier: loginPasswordData.identifier,
                    password: loginPasswordData.password,
                    rememberMe: loginPasswordData.rememberMe,
                }),
            });
            const data = await resp.json();
            if (!resp.ok || !data.success) {
                throw new Error(data.message || "Failed to login with password.");
            }

            setMessage("Login successful. Redirecting to dashboard...");
            router.push("/dashboard");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to login with password.");
        } finally {
            setLoading(false);
        }
    };

    const handleLoginRequestOtp = async (e: FormEvent) => {
        e.preventDefault();
        clearFeedback();
        setLoading(true);

        try {
            const identifier = normalizeMobile(loginOtpData.countryCode, loginOtpData.mobile);
            const resp = await fetch("/api/auth/login/request-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identifier }),
            });
            const data = await resp.json();
            if (!resp.ok || !data.success) {
                throw new Error(data.message || "Failed to request OTP.");
            }

            setLoginOtpData((prev) => ({
                ...prev,
                otpRequested: true,
                debugOtp: data.debugOtp ?? "",
                otp: "",
            }));
            setMessage(`OTP sent to ${data.target}.`);
            setOtpCooldown(30);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to request OTP.");
        } finally {
            setLoading(false);
        }
    };

    const handleLoginVerifyOtp = async (e: FormEvent) => {
        e.preventDefault();
        clearFeedback();
        setLoading(true);

        try {
            const identifier = normalizeMobile(loginOtpData.countryCode, loginOtpData.mobile);
            const resp = await fetch("/api/auth/login/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    identifier,
                    otp: loginOtpData.otp,
                }),
            });
            const data = await resp.json();
            if (!resp.ok || !data.success) {
                throw new Error(data.message || "Failed to verify OTP.");
            }

            setMessage("Login successful. Redirecting to dashboard...");
            router.push("/dashboard");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to verify OTP.");
        } finally {
            setLoading(false);
        }
    };

    const handleForgotRequestOtp = async (e: FormEvent) => {
        e.preventDefault();
        clearFeedback();
        setLoading(true);

        try {
            const resp = await fetch("/api/auth/forgot-password/request-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identifier: forgotData.identifier }),
            });
            const data = await resp.json();
            if (!resp.ok || !data.success) {
                throw new Error(data.message || "Failed to request OTP.");
            }

            setForgotData((prev) => ({
                ...prev,
                otp: "",
                debugOtp: data.debugOtp ?? "",
            }));
            setForgotStep("verify");
            setOtpCooldown(30);
            setMessage(`OTP sent to ${data.target}.`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to request OTP.");
        } finally {
            setLoading(false);
        }
    };

    const handleForgotVerifyOtp = async (e: FormEvent) => {
        e.preventDefault();
        clearFeedback();
        setLoading(true);

        try {
            const resp = await fetch("/api/auth/forgot-password/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    identifier: forgotData.identifier,
                    otp: forgotData.otp,
                }),
            });
            const data = await resp.json();
            if (!resp.ok || !data.success) {
                throw new Error(data.message || "Failed to verify OTP.");
            }

            setForgotData((prev) => ({
                ...prev,
                resetToken: data.resetToken,
            }));
            setForgotStep("reset");
            setMessage("OTP verified. Set your new password.");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to verify OTP.");
        } finally {
            setLoading(false);
        }
    };

    const handleForgotResetPassword = async (e: FormEvent) => {
        e.preventDefault();
        clearFeedback();

        if (forgotData.password !== forgotData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const resp = await fetch("/api/auth/forgot-password/reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    resetToken: forgotData.resetToken,
                    password: forgotData.password,
                }),
            });
            const data = await resp.json();
            if (!resp.ok || !data.success) {
                throw new Error(data.message || "Failed to reset password.");
            }

            setMessage("Password reset successful. Please log in.");
            setForgotOpen(false);
            setForgotStep("request");
            setForgotData({
                identifier: "",
                otp: "",
                resetToken: "",
                password: "",
                confirmPassword: "",
                debugOtp: "",
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to reset password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-[#eef6ff] via-[#f8fbff] to-[#ecfff7]">
            <Header />

            <section className="py-10 md:py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_1.15fr]">
                        <aside className="rounded-3xl border border-sky-100 bg-[#0a2f4a] p-6 text-white shadow-[0_20px_60px_rgba(10,47,74,0.25)] md:p-8">
                            <p className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]">
                                Maestro Career
                            </p>
                            <h1 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
                                Login and registration built for a global learner journey.
                            </h1>
                            <p className="mt-4 text-sm text-sky-100 md:text-base">
                                Use password login or mobile OTP. New users can onboard in 3 guided steps with strong
                                security and profile personalization.
                            </p>
                            <div className="mt-8 space-y-3 text-sm text-sky-100">
                                <p>1. Dual auth: email/password and mobile OTP.</p>
                                <p>2. OTP expires in 5 minutes with resend cooldown.</p>
                                <p>3. Profile-based dashboard personalization.</p>
                            </div>
                        </aside>

                        <div className="rounded-3xl border border-[#d7e7f7] bg-white p-5 shadow-[0_20px_60px_rgba(19,69,105,0.12)] md:p-8">
                            <div className="inline-flex rounded-xl bg-slate-100 p-1">
                                <button
                                    type="button"
                                    onClick={() => switchMode("login")}
                                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${authMode === "login" ? "bg-white text-slate-900 shadow" : "text-slate-600"
                                        }`}
                                >
                                    Login
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        switchMode("register");
                                        setRegisterStep(1);
                                    }}
                                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${authMode === "register" ? "bg-white text-slate-900 shadow" : "text-slate-600"
                                        }`}
                                >
                                    Create Account
                                </button>
                            </div>

                            {message && (
                                <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                                    {message}
                                </div>
                            )}
                            {error && (
                                <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                    {error}
                                </div>
                            )}

                            {authMode === "login" && (
                                <div className="mt-6 space-y-6">
                                    <div className="inline-flex rounded-xl bg-slate-100 p-1">
                                        <button
                                            type="button"
                                            onClick={() => setLoginMode("password")}
                                            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${loginMode === "password"
                                                    ? "bg-white text-slate-900 shadow"
                                                    : "text-slate-600"
                                                }`}
                                        >
                                            Email + Password
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setLoginMode("otp")}
                                            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${loginMode === "otp" ? "bg-white text-slate-900 shadow" : "text-slate-600"
                                                }`}
                                        >
                                            Mobile + OTP
                                        </button>
                                    </div>

                                    {loginMode === "password" && (
                                        <form onSubmit={handlePasswordLogin} className="space-y-4">
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-slate-700">
                                                    Email or Mobile (with country code)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={loginPasswordData.identifier}
                                                    onChange={(e) =>
                                                        setLoginPasswordData((prev) => ({ ...prev, identifier: e.target.value }))
                                                    }
                                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                                                    placeholder="you@example.com or +919876543210"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
                                                <input
                                                    type="password"
                                                    value={loginPasswordData.password}
                                                    onChange={(e) =>
                                                        setLoginPasswordData((prev) => ({ ...prev, password: e.target.value }))
                                                    }
                                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                                                    placeholder="Enter your password"
                                                    required
                                                />
                                            </div>
                                            <label className="flex items-center gap-2 text-sm text-slate-600">
                                                <input
                                                    type="checkbox"
                                                    checked={loginPasswordData.rememberMe}
                                                    onChange={(e) =>
                                                        setLoginPasswordData((prev) => ({
                                                            ...prev,
                                                            rememberMe: e.target.checked,
                                                        }))
                                                    }
                                                />
                                                Remember me
                                            </label>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full rounded-xl bg-[#0d3f63] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0a3350] disabled:opacity-70"
                                            >
                                                {loading ? "Signing in..." : "Login"}
                                            </button>
                                        </form>
                                    )}

                                    {loginMode === "password" && <div className="relative text-center text-xs text-slate-500">
                                        <span className="relative z-10 bg-white px-3">or continue with mobile OTP</span>
                                        <div className="absolute left-0 top-1/2 w-full border-t border-slate-200" />
                                    </div>}

                                    {(loginMode === "otp" || loginMode === "password") && <form onSubmit={handleLoginRequestOtp} className="space-y-4">
                                        <div className="grid grid-cols-[140px_1fr] gap-3">
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-slate-700">Code</label>
                                                <select
                                                    value={loginOtpData.countryCode}
                                                    onChange={(e) =>
                                                        setLoginOtpData((prev) => ({
                                                            ...prev,
                                                            countryCode: e.target.value,
                                                        }))
                                                    }
                                                    className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-sky-500"
                                                >
                                                    {COUNTRY_CODES.map((item) => (
                                                        <option key={item.code} value={item.code}>
                                                            {item.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-slate-700">Mobile Number</label>
                                                <input
                                                    type="tel"
                                                    value={loginOtpData.mobile}
                                                    onChange={(e) =>
                                                        setLoginOtpData((prev) => ({
                                                            ...prev,
                                                            mobile: e.target.value,
                                                        }))
                                                    }
                                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                                                    placeholder="9876543210"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {!loginOtpData.otpRequested && (
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full rounded-xl border border-[#0d3f63] px-4 py-3 text-sm font-semibold text-[#0d3f63] transition hover:bg-[#f2f9ff] disabled:opacity-70"
                                            >
                                                {loading ? "Sending OTP..." : "Login via OTP"}
                                            </button>
                                        )}
                                    </form>}

                                    {loginOtpData.otpRequested && (
                                        <form onSubmit={handleLoginVerifyOtp} className="space-y-4 rounded-2xl border border-slate-200 p-4">
                                            <label className="block text-sm font-medium text-slate-700">Enter OTP</label>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                value={loginOtpData.otp}
                                                onChange={(e) =>
                                                    setLoginOtpData((prev) => ({
                                                        ...prev,
                                                        otp: maskOtpInput(e.target.value),
                                                    }))
                                                }
                                                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-center text-lg tracking-[0.45em] outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                                                maxLength={6}
                                                placeholder="123456"
                                                required
                                            />
                                            {loginOtpData.debugOtp && (
                                                <p className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-700">
                                                    Debug OTP: <span className="font-semibold">{loginOtpData.debugOtp}</span>
                                                </p>
                                            )}
                                            <div className="flex items-center justify-between">
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleLoginRequestOtp(e as unknown as FormEvent)}
                                                    disabled={otpCooldown > 0 || loading}
                                                    className="text-sm font-medium text-sky-700 disabled:text-slate-400"
                                                >
                                                    {otpCooldown > 0 ? `Resend in ${otpCooldown}s` : "Resend OTP"}
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="rounded-xl bg-[#0d3f63] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0a3350] disabled:opacity-70"
                                                >
                                                    {loading ? "Verifying..." : "Verify Login"}
                                                </button>
                                            </div>
                                        </form>
                                    )}

                                    <div className="flex items-center justify-between text-sm">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setForgotOpen((prev) => !prev);
                                                clearFeedback();
                                            }}
                                            className="font-medium text-sky-700"
                                        >
                                            Forgot Password?
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => switchMode("register")}
                                            className="font-medium text-sky-700"
                                        >
                                            Create an Account
                                        </button>
                                    </div>

                                    {forgotOpen && (
                                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                            <h3 className="text-sm font-semibold text-slate-900">Forgot Password</h3>

                                            {forgotStep === "request" && (
                                                <form onSubmit={handleForgotRequestOtp} className="mt-3 space-y-3">
                                                    <input
                                                        type="text"
                                                        value={forgotData.identifier}
                                                        onChange={(e) =>
                                                            setForgotData((prev) => ({
                                                                ...prev,
                                                                identifier: e.target.value,
                                                            }))
                                                        }
                                                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-sky-500"
                                                        placeholder="Email or +countrycode mobile"
                                                        required
                                                    />
                                                    <button
                                                        type="submit"
                                                        disabled={loading}
                                                        className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-70"
                                                    >
                                                        Send OTP
                                                    </button>
                                                </form>
                                            )}

                                            {forgotStep === "verify" && (
                                                <form onSubmit={handleForgotVerifyOtp} className="mt-3 space-y-3">
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        value={forgotData.otp}
                                                        onChange={(e) =>
                                                            setForgotData((prev) => ({
                                                                ...prev,
                                                                otp: maskOtpInput(e.target.value),
                                                            }))
                                                        }
                                                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-center text-base tracking-[0.35em] outline-none transition focus:border-sky-500"
                                                        maxLength={6}
                                                        placeholder="123456"
                                                        required
                                                    />
                                                    {forgotData.debugOtp && (
                                                        <p className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-700">
                                                            Debug OTP: <span className="font-semibold">{forgotData.debugOtp}</span>
                                                        </p>
                                                    )}
                                                    <button
                                                        type="submit"
                                                        disabled={loading}
                                                        className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-70"
                                                    >
                                                        Verify OTP
                                                    </button>
                                                </form>
                                            )}

                                            {forgotStep === "reset" && (
                                                <form onSubmit={handleForgotResetPassword} className="mt-3 space-y-3">
                                                    <input
                                                        type="password"
                                                        value={forgotData.password}
                                                        onChange={(e) =>
                                                            setForgotData((prev) => ({
                                                                ...prev,
                                                                password: e.target.value,
                                                            }))
                                                        }
                                                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-sky-500"
                                                        placeholder="New password"
                                                        required
                                                    />
                                                    <input
                                                        type="password"
                                                        value={forgotData.confirmPassword}
                                                        onChange={(e) =>
                                                            setForgotData((prev) => ({
                                                                ...prev,
                                                                confirmPassword: e.target.value,
                                                            }))
                                                        }
                                                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-sky-500"
                                                        placeholder="Confirm password"
                                                        required
                                                    />
                                                    <button
                                                        type="submit"
                                                        disabled={loading}
                                                        className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-70"
                                                    >
                                                        Reset Password
                                                    </button>
                                                </form>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {authMode === "register" && (
                                <div className="mt-6 space-y-6">
                                    <div className="flex items-center gap-3">
                                        {[1, 2, 3].map((step) => (
                                            <div key={step} className="flex items-center gap-3">
                                                <div
                                                    className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${registerStep >= step
                                                            ? "bg-[#0d3f63] text-white"
                                                            : "bg-slate-200 text-slate-600"
                                                        }`}
                                                >
                                                    {step}
                                                </div>
                                                {step < 3 && <div className="h-[2px] w-8 bg-slate-200" />}
                                            </div>
                                        ))}
                                    </div>

                                    {registerStep === 1 && (
                                        <form onSubmit={handleRegisterRequestOtp} className="space-y-4">
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-slate-700">Full Name</label>
                                                <input
                                                    type="text"
                                                    value={registerData.fullName}
                                                    onChange={(e) =>
                                                        setRegisterData((prev) => ({ ...prev, fullName: e.target.value }))
                                                    }
                                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                                                    placeholder="John Doe"
                                                    required
                                                />
                                                {registerData.fullName && !isValidName(registerData.fullName) && (
                                                    <p className="mt-1 text-xs text-rose-600">Enter a valid alphabetic full name.</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-slate-700">Email Address</label>
                                                <input
                                                    type="email"
                                                    value={registerData.email}
                                                    onChange={(e) =>
                                                        setRegisterData((prev) => ({ ...prev, email: e.target.value }))
                                                    }
                                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                                                    placeholder="you@example.com"
                                                    required
                                                />
                                                {registerData.email && !isValidEmail(registerData.email) && (
                                                    <p className="mt-1 text-xs text-rose-600">Enter a valid email address.</p>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-[140px_1fr] gap-3">
                                                <div>
                                                    <label className="mb-1 block text-sm font-medium text-slate-700">
                                                        Country
                                                    </label>
                                                    <select
                                                        value={registerData.countryCode}
                                                        onChange={(e) =>
                                                            setRegisterData((prev) => ({
                                                                ...prev,
                                                                countryCode: e.target.value,
                                                            }))
                                                        }
                                                        className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-sky-500"
                                                    >
                                                        {COUNTRY_CODES.map((item) => (
                                                            <option key={item.code} value={item.code}>
                                                                {item.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="mb-1 block text-sm font-medium text-slate-700">
                                                        Mobile Number
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        value={registerData.mobile}
                                                        onChange={(e) =>
                                                            setRegisterData((prev) => ({ ...prev, mobile: e.target.value }))
                                                        }
                                                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                                                        placeholder="9876543210"
                                                        required
                                                    />
                                                    {!/^\+\d{8,15}$/.test(
                                                        normalizeMobile(registerData.countryCode, registerData.mobile)
                                                    ) &&
                                                        registerData.mobile && (
                                                            <p className="mt-1 text-xs text-rose-600">
                                                                Enter a valid number with selected country code.
                                                            </p>
                                                        )}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-slate-700">Create Password</label>
                                                <input
                                                    type="password"
                                                    value={registerData.password}
                                                    onChange={(e) =>
                                                        setRegisterData((prev) => ({ ...prev, password: e.target.value }))
                                                    }
                                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                                                    placeholder="Create a strong password"
                                                    required
                                                />
                                                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                                                    <p className={registerPasswordRules.length ? "text-emerald-700" : "text-slate-500"}>8+ characters</p>
                                                    <p className={registerPasswordRules.upper ? "text-emerald-700" : "text-slate-500"}>1 uppercase</p>
                                                    <p className={registerPasswordRules.lower ? "text-emerald-700" : "text-slate-500"}>1 lowercase</p>
                                                    <p className={registerPasswordRules.number ? "text-emerald-700" : "text-slate-500"}>1 number</p>
                                                    <p className={registerPasswordRules.special ? "text-emerald-700" : "text-slate-500"}>1 special</p>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-slate-700">Date of Birth</label>
                                                <input
                                                    type="date"
                                                    value={registerData.dateOfBirth}
                                                    onChange={(e) =>
                                                        setRegisterData((prev) => ({ ...prev, dateOfBirth: e.target.value }))
                                                    }
                                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                                                    required
                                                />
                                            </div>

                                            <label className="flex items-start gap-2 text-sm text-slate-700">
                                                <input
                                                    type="checkbox"
                                                    checked={registerData.acceptedTerms}
                                                    onChange={(e) =>
                                                        setRegisterData((prev) => ({
                                                            ...prev,
                                                            acceptedTerms: e.target.checked,
                                                        }))
                                                    }
                                                    className="mt-1"
                                                />
                                                <span>I agree to the Terms, Privacy Policy, and OTP communication consent.</span>
                                            </label>

                                            <button
                                                type="submit"
                                                disabled={!isRegisterStepOneValid || loading}
                                                className="w-full rounded-xl bg-[#0d3f63] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0a3350] disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {loading ? "Sending OTP..." : "Continue"}
                                            </button>
                                        </form>
                                    )}

                                    {registerStep === 2 && (
                                        <form onSubmit={handleRegisterVerifyOtp} className="space-y-4 rounded-2xl border border-slate-200 p-4">
                                            <p className="text-sm text-slate-600">Enter the OTP sent to your email and mobile.</p>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                value={registerData.otp}
                                                onChange={(e) =>
                                                    setRegisterData((prev) => ({ ...prev, otp: maskOtpInput(e.target.value) }))
                                                }
                                                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-center text-lg tracking-[0.45em] outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                                                placeholder="123456"
                                                maxLength={6}
                                                required
                                            />
                                            {registerData.debugOtp && (
                                                <p className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-700">
                                                    Debug OTP: <span className="font-semibold">{registerData.debugOtp}</span>
                                                </p>
                                            )}
                                            <div className="flex items-center justify-between">
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleRegisterRequestOtp(e as unknown as FormEvent)}
                                                    disabled={otpCooldown > 0 || loading}
                                                    className="text-sm font-medium text-sky-700 disabled:text-slate-400"
                                                >
                                                    {otpCooldown > 0 ? `Resend in ${otpCooldown}s` : "Resend OTP"}
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="rounded-xl bg-[#0d3f63] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0a3350] disabled:opacity-70"
                                                >
                                                    {loading ? "Verifying..." : "Verify & Continue"}
                                                </button>
                                            </div>
                                        </form>
                                    )}

                                    {registerStep === 3 && (
                                        <form onSubmit={handleCompleteProfile} className="space-y-4">
                                            <div>
                                                <p className="mb-2 text-sm font-medium text-slate-700">User Type</p>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setRegisterData((prev) => ({ ...prev, userType: "student" }))
                                                        }
                                                        className={`rounded-xl border px-3 py-2 text-sm font-medium ${registerData.userType === "student"
                                                                ? "border-[#0d3f63] bg-[#e6f2fb] text-[#0d3f63]"
                                                                : "border-slate-300 text-slate-600"
                                                            }`}
                                                    >
                                                        Student
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setRegisterData((prev) => ({
                                                                ...prev,
                                                                userType: "working_professional",
                                                            }))
                                                        }
                                                        className={`rounded-xl border px-3 py-2 text-sm font-medium ${registerData.userType === "working_professional"
                                                                ? "border-[#0d3f63] bg-[#e6f2fb] text-[#0d3f63]"
                                                                : "border-slate-300 text-slate-600"
                                                            }`}
                                                    >
                                                        Working Professional
                                                    </button>
                                                </div>
                                            </div>

                                            {registerData.userType === "student" && (
                                                <div>
                                                    <label className="mb-1 block text-sm font-medium text-slate-700">
                                                        What are you studying?
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={registerData.studyField}
                                                        onChange={(e) =>
                                                            setRegisterData((prev) => ({
                                                                ...prev,
                                                                studyField: e.target.value,
                                                            }))
                                                        }
                                                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                                                        placeholder="B.Tech Computer Science"
                                                        required
                                                    />
                                                </div>
                                            )}

                                            {registerData.userType === "working_professional" && (
                                                <>
                                                    <div>
                                                        <label className="mb-1 block text-sm font-medium text-slate-700">
                                                            Domain / Industry
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={registerData.domain}
                                                            onChange={(e) =>
                                                                setRegisterData((prev) => ({ ...prev, domain: e.target.value }))
                                                            }
                                                            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                                                            placeholder="Software, Finance, Design..."
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="mb-1 block text-sm font-medium text-slate-700">
                                                            Company Name / Role
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={registerData.companyRole}
                                                            onChange={(e) =>
                                                                setRegisterData((prev) => ({
                                                                    ...prev,
                                                                    companyRole: e.target.value,
                                                                }))
                                                            }
                                                            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                                                            placeholder="Acme Corp / Product Analyst"
                                                            required
                                                        />
                                                    </div>
                                                </>
                                            )}

                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-slate-700">City</label>
                                                <input
                                                    list="city-suggestions"
                                                    value={registerData.city}
                                                    onChange={(e) =>
                                                        setRegisterData((prev) => ({ ...prev, city: e.target.value }))
                                                    }
                                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                                                    placeholder="Enter your city"
                                                    required
                                                />
                                                <datalist id="city-suggestions">
                                                    {CITY_SUGGESTIONS.map((city) => (
                                                        <option key={city} value={city} />
                                                    ))}
                                                </datalist>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={profileSubmitDisabled || loading}
                                                className="w-full rounded-xl bg-[#0d3f63] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0a3350] disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {loading ? "Saving..." : "Take Me to Dashboard"}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
