import { SupabaseClient, User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPublicServerClient } from "@/lib/supabase/public";
import { getSupabaseConfig, getSupabaseConfigError } from "@/lib/supabase/config";

const MIN_SIGNUP_AGE = 13;
const DEFAULT_OTP_EXPIRY_SECONDS = 24 * 60 * 60;
const EMAIL_OTP_DIGITS = 6;

type LoginMethod = "otp" | "password";
type UserType = "student" | "working_professional";

interface RegistrationMetadata {
    full_name?: string;
    mobile?: string;
    country_code?: string;
    date_of_birth?: string;
    terms_accepted_at?: string;
}

interface ProfileRow {
    id: string;
    email: string;
    full_name: string;
    mobile: string;
    country_code: string;
    date_of_birth: string | null;
    terms_accepted_at: string;
    onboarding_completed: boolean;
    preferred_services: string[];
    user_type: UserType | null;
    study_field: string | null;
    domain: string | null;
    company_role: string | null;
    city: string | null;
    last_login_at: string | null;
    last_login_method: LoginMethod | null;
    login_count: number;
    inquiry_count: number;
    selected_plan_id: string | null;
    payment_status: "paid" | "unpaid" | null;
    payment_id: string | null;
    transaction_id: string | null;
    payment_token: string | null;
    psychometric_test_link: string | null;
    created_at: string;
    updated_at: string;
}

interface ActivityRow {
    id: string;
    user_id: string;
    type: "registration" | "login" | "profile" | "password_reset";
    message: string;
    created_at: string;
}

export interface PublicUser {
    id: string;
    name: string;
    email: string;
    mobile: string;
    countryCode: string;
    onboardingCompleted: boolean;
    hasPassword: boolean;
    createdAt: string;
    updatedAt: string;
    lastLoginAt?: string;
    lastLoginMethod?: LoginMethod;
    loginCount: number;
    inquiryCount: number;
    preferredServices: string[];
    userType?: UserType;
    studyField?: string;
    domain?: string;
    companyRole?: string;
    city?: string;
    selectedPlanId?: string;
    paymentStatus?: "paid" | "unpaid";
    paymentId?: string;
    transactionId?: string;
    paymentToken?: string;
    psychometricTestLink?: string;
}

export interface DashboardData {
    profile: PublicUser;
    metrics: {
        accountAgeDays: number;
        totalLogins: number;
        inquiryCount: number;
    };
    recentActivity: Array<{
        id: string;
        userId: string;
        type: "registration" | "login" | "profile" | "password_reset";
        message: string;
        at: string;
    }>;
    websiteModules: Array<{ title: string; route: string; description: string }>;
}

function ensureSupabaseConfigured() {
    const error = getSupabaseConfigError();
    if (error) {
        throw new Error(error);
    }
}

function nowIso() {
    return new Date().toISOString();
}

function normalizeEmail(value: string) {
    return String(value ?? "").trim().toLowerCase();
}

function normalizeCountryCode(value: string) {
    const digits = String(value ?? "").replace(/\D/g, "");
    return digits ? `+${digits}` : "+1";
}

function normalizeMobileLocal(value: string) {
    return String(value ?? "").replace(/\D/g, "");
}

function normalizeMobileWithCountryCode(countryCode: string, mobile: string) {
    return `${normalizeCountryCode(countryCode)}${normalizeMobileLocal(mobile)}`;
}

function isValidEmail(value: string) {
    return /^\S+@\S+\.\S+$/.test(value);
}

function isValidMobile(value: string) {
    return /^\+\d{8,15}$/.test(value);
}

function isValidName(value: string) {
    return /^[A-Za-z][A-Za-z .'-]{1,99}$/.test(value.trim());
}

function validateStrongPassword(password: string) {
    if (password.length < 8) {
        throw new Error("Password must be at least 8 characters.");
    }
    if (!/[A-Z]/.test(password)) {
        throw new Error("Password must include at least 1 uppercase letter.");
    }
    if (!/[a-z]/.test(password)) {
        throw new Error("Password must include at least 1 lowercase letter.");
    }
    if (!/\d/.test(password)) {
        throw new Error("Password must include at least 1 number.");
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
        throw new Error("Password must include at least 1 special character.");
    }
}

function calculateAgeYears(dateOfBirthIso: string) {
    const dob = new Date(dateOfBirthIso);
    if (Number.isNaN(dob.getTime())) {
        return -1;
    }

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDelta = today.getMonth() - dob.getMonth();

    if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < dob.getDate())) {
        age -= 1;
    }

    return age;
}

function maskEmail(email: string) {
    const [name, domain] = email.split("@");
    if (!name || !domain) {
        return email;
    }
    if (name.length <= 2) {
        return `${name[0] ?? ""}*@${domain}`;
    }

    return `${name[0]}${"*".repeat(Math.max(name.length - 2, 1))}${name[name.length - 1]}@${domain}`;
}

function normalizeOptionalText(value: unknown) {
    const trimmed = String(value ?? "").trim();
    return trimmed || null;
}

function getRegistrationMetadata(user: User): RegistrationMetadata {
    const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
    return {
        full_name: normalizeOptionalText(metadata.full_name) ?? undefined,
        mobile: normalizeOptionalText(metadata.mobile) ?? undefined,
        country_code: normalizeOptionalText(metadata.country_code) ?? undefined,
        date_of_birth: normalizeOptionalText(metadata.date_of_birth) ?? undefined,
        terms_accepted_at: normalizeOptionalText(metadata.terms_accepted_at) ?? undefined,
    };
}

function normalizeLoginMethod(value: string | null | undefined): LoginMethod | undefined {
    return value === "otp" || value === "password" ? value : undefined;
}

function normalizeUserType(value: string | null | undefined): UserType | undefined {
    return value === "student" || value === "working_professional" ? value : undefined;
}

function formatSupabaseError(message: string | undefined, fallback: string) {
    const normalized = (message ?? "").trim();
    if (!normalized) {
        return fallback;
    }

    if (/invalid login credentials/i.test(normalized)) {
        return "Invalid email or password.";
    }
    if (/email not confirmed/i.test(normalized)) {
        return "Please verify your email to finish registration.";
    }
    if (/user not found|not registered|no user/i.test(normalized)) {
        return "No account found for this email address.";
    }
    if (/user already registered/i.test(normalized)) {
        return "An account already exists for this email address.";
    }
    if (/signups not allowed for otp/i.test(normalized)) {
        return "No account found for this email address. Please register first.";
    }
    if (/otp/i.test(normalized) && /expired|invalid/i.test(normalized)) {
        return "Invalid or expired OTP. Please request a new one.";
    }

    return normalized;
}

function isValidEmailOtp(otp: string) {
    return new RegExp(`^\\d{${EMAIL_OTP_DIGITS}}$`).test(otp);
}

async function findAuthUserByEmail(email: string) {
    const admin = createAdminClient();
    let page = 1;
    const perPage = 200;

    while (true) {
        const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
        if (error) {
            throw new Error(formatSupabaseError(error.message, "Unable to read user accounts from Supabase."));
        }

        const match = data.users.find((item) => normalizeEmail(item.email ?? "") === email);
        if (match) {
            return match;
        }

        if (data.users.length < perPage) {
            return null;
        }

        page += 1;
    }
}

async function getProfileById(userId: string) {
    const admin = createAdminClient();
    const { data, error } = await admin.from("profiles").select("*").eq("id", userId).maybeSingle<ProfileRow>();
    if (error) {
        throw new Error(error.message);
    }

    return data ?? null;
}

async function getRecentActivity(userId: string) {
    const admin = createAdminClient();
    const { data, error } = await admin
        .from("auth_activity")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(8)
        .returns<ActivityRow[]>();

    if (error) {
        throw new Error(error.message);
    }

    return data ?? [];
}

async function insertActivity(
    userId: string,
    type: ActivityRow["type"],
    message: string
) {
    const admin = createAdminClient();
    const { error } = await admin.from("auth_activity").insert({
        user_id: userId,
        type,
        message,
    });

    if (error) {
        throw new Error(error.message);
    }
}

async function upsertProfile(
    user: User,
    overrides: Partial<ProfileRow> = {}
) {
    const admin = createAdminClient();
    const existing = await getProfileById(user.id);
    const metadata = getRegistrationMetadata(user);
    const email = normalizeEmail(user.email ?? overrides.email ?? existing?.email ?? "");

    if (!email) {
        throw new Error("User email is missing.");
    }

    const payload = {
        id: user.id,
        email,
        full_name:
            overrides.full_name ??
            existing?.full_name ??
            metadata.full_name ??
            "Learner",
        mobile:
            overrides.mobile ??
            existing?.mobile ??
            metadata.mobile ??
            "",
        country_code:
            overrides.country_code ??
            existing?.country_code ??
            metadata.country_code ??
            "+1",
        date_of_birth:
            overrides.date_of_birth ??
            existing?.date_of_birth ??
            metadata.date_of_birth ??
            null,
        terms_accepted_at:
            overrides.terms_accepted_at ??
            existing?.terms_accepted_at ??
            metadata.terms_accepted_at ??
            nowIso(),
        onboarding_completed:
            overrides.onboarding_completed ??
            existing?.onboarding_completed ??
            false,
        preferred_services:
            overrides.preferred_services ??
            existing?.preferred_services ??
            [],
        user_type:
            overrides.user_type ??
            existing?.user_type ??
            null,
        study_field:
            overrides.study_field ??
            existing?.study_field ??
            null,
        domain:
            overrides.domain ??
            existing?.domain ??
            null,
        company_role:
            overrides.company_role ??
            existing?.company_role ??
            null,
        city:
            overrides.city ??
            existing?.city ??
            null,
        last_login_at:
            overrides.last_login_at ??
            existing?.last_login_at ??
            null,
        last_login_method:
            overrides.last_login_method ??
            existing?.last_login_method ??
            null,
        login_count:
            overrides.login_count ??
            existing?.login_count ??
            0,
        inquiry_count:
            overrides.inquiry_count ??
            existing?.inquiry_count ??
            0,
        selected_plan_id:
            overrides.selected_plan_id ??
            existing?.selected_plan_id ??
            null,
        payment_status:
            overrides.payment_status ??
            existing?.payment_status ??
            "unpaid",
        payment_id:
            overrides.payment_id ??
            existing?.payment_id ??
            null,
        transaction_id:
            overrides.transaction_id ??
            existing?.transaction_id ??
            null,
        payment_token:
            overrides.payment_token ??
            existing?.payment_token ??
            null,
        psychometric_test_link:
            overrides.psychometric_test_link ??
            existing?.psychometric_test_link ??
            null,
    };

    const { data, error } = await admin
        .from("profiles")
        .upsert(payload, { onConflict: "id" })
        .select("*")
        .single<ProfileRow>();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

function toPublicUser(user: User, profile: ProfileRow | null): PublicUser {
    const metadata = getRegistrationMetadata(user);
    const createdAt = profile?.created_at ?? user.created_at ?? nowIso();
    const updatedAt = profile?.updated_at ?? user.updated_at ?? createdAt;

    return {
        id: user.id,
        name: profile?.full_name ?? metadata.full_name ?? "Learner",
        email: normalizeEmail(user.email ?? profile?.email ?? ""),
        mobile: profile?.mobile ?? metadata.mobile ?? "",
        countryCode: profile?.country_code ?? metadata.country_code ?? "+1",
        onboardingCompleted: profile?.onboarding_completed ?? false,
        hasPassword: true,
        createdAt,
        updatedAt,
        lastLoginAt: profile?.last_login_at ?? user.last_sign_in_at ?? undefined,
        lastLoginMethod: normalizeLoginMethod(profile?.last_login_method),
        loginCount: profile?.login_count ?? 0,
        inquiryCount: profile?.inquiry_count ?? 0,
        preferredServices: profile?.preferred_services ?? [],
        userType: normalizeUserType(profile?.user_type),
        studyField: profile?.study_field ?? undefined,
        domain: profile?.domain ?? undefined,
        companyRole: profile?.company_role ?? undefined,
        city: profile?.city ?? undefined,
        selectedPlanId: profile?.selected_plan_id ?? undefined,
        paymentStatus: profile?.payment_status ?? undefined,
        paymentId: profile?.payment_id ?? undefined,
        transactionId: profile?.transaction_id ?? undefined,
        paymentToken: profile?.payment_token ?? undefined,
        psychometricTestLink: profile?.psychometric_test_link ?? undefined,
    };
}

async function requireAuthenticatedUser(supabase: SupabaseClient) {
    ensureSupabaseConfigured();

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error) {
        throw new Error(formatSupabaseError(error.message, "Unable to read the current session."));
    }
    if (!user) {
        throw new Error("Unauthorized");
    }

    return user;
}

async function recordLogin(user: User, method: LoginMethod) {
    const currentProfile = await upsertProfile(user);
    const updatedProfile = await upsertProfile(user, {
        last_login_at: nowIso(),
        last_login_method: method,
        login_count: (currentProfile.login_count ?? 0) + 1,
    });

    await insertActivity(
        user.id,
        "login",
        method === "otp" ? "Logged in via email OTP." : "Logged in via password."
    );

    return updatedProfile;
}

export async function requestRegistrationOtp(input: {
    fullName: string;
    email: string;
    mobile: string;
    countryCode: string;
    password: string;
    dateOfBirth: string;
    acceptedTerms: boolean;
}) {
    ensureSupabaseConfigured();

    const fullName = String(input.fullName ?? "").trim();
    const email = normalizeEmail(input.email);
    const countryCode = normalizeCountryCode(input.countryCode);
    const mobile = normalizeMobileWithCountryCode(countryCode, input.mobile);
    const password = String(input.password ?? "").trim();

    if (!isValidName(fullName)) {
        throw new Error("Enter a valid full name.");
    }
    if (!isValidEmail(email)) {
        throw new Error("Enter a valid email address.");
    }
    if (!isValidMobile(mobile)) {
        throw new Error("Enter a valid mobile number with country code.");
    }
    if (!input.acceptedTerms) {
        throw new Error("You must accept terms and privacy policy to continue.");
    }

    validateStrongPassword(password);

    const age = calculateAgeYears(input.dateOfBirth);
    if (age < MIN_SIGNUP_AGE) {
        throw new Error(`You must be at least ${MIN_SIGNUP_AGE} years old to register.`);
    }
    if (age > 100) {
        throw new Error("Enter a valid date of birth.");
    }

    const admin = createAdminClient();
    const userMetadata = {
        full_name: fullName,
        mobile,
        country_code: countryCode,
        date_of_birth: input.dateOfBirth,
        terms_accepted_at: nowIso(),
    };
    const publicClient = createPublicServerClient();

    const { error: signUpError } = await publicClient.auth.signUp({
        email,
        password,
        options: {
            data: userMetadata,
        },
    });

    if (signUpError) {
        if (/user already registered/i.test(signUpError.message ?? "")) {
            const existingUser = await findAuthUserByEmail(email);
            if (existingUser?.email_confirmed_at) {
                throw new Error("An account already exists for this email address in Supabase Auth.");
            }

            if (existingUser) {
                const { error: deleteUserError } = await admin.auth.admin.deleteUser(existingUser.id);
                if (deleteUserError) {
                    throw new Error(formatSupabaseError(deleteUserError.message, "Unable to clear the stale registration."));
                }

                const { error: retrySignUpError } = await publicClient.auth.signUp({
                    email,
                    password,
                    options: {
                        data: userMetadata,
                    },
                });

                if (retrySignUpError) {
                    throw new Error(formatSupabaseError(retrySignUpError.message, "Unable to start registration."));
                }
            } else {
                throw new Error(formatSupabaseError(signUpError.message, "Unable to start registration."));
            }
        } else {
            throw new Error(formatSupabaseError(signUpError.message, "Unable to start registration."));
        }
    }

    return {
        emailTarget: maskEmail(email),
        expiresInSeconds: DEFAULT_OTP_EXPIRY_SECONDS,
    };
}

export async function verifyRegistrationOtp(
    supabase: SupabaseClient,
    input: { email: string; otp: string }
) {
    ensureSupabaseConfigured();

    const email = normalizeEmail(input.email);
    const otp = String(input.otp ?? "").trim();

    if (!isValidEmail(email)) {
        throw new Error("Enter a valid email address.");
    }
    if (!isValidEmailOtp(otp)) {
        throw new Error(`Enter a valid ${EMAIL_OTP_DIGITS}-digit OTP.`);
    }

    const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
    });

    if (error) {
        throw new Error(formatSupabaseError(error.message, "Unable to verify the OTP."));
    }

    const user = data.user;
    if (!user) {
        throw new Error("Registration could not be completed.");
    }

    const profile = await upsertProfile(user, {
        email,
        last_login_at: nowIso(),
        last_login_method: "otp",
        login_count: 1,
        onboarding_completed: false,
    });

    await insertActivity(user.id, "registration", "Completed registration via email OTP.");

    return {
        user: toPublicUser(user, profile),
    };
}

export async function requestLoginOtp(input: { email: string }) {
    ensureSupabaseConfigured();

    const email = normalizeEmail(input.email);
    if (!isValidEmail(email)) {
        throw new Error("Enter a valid email address.");
    }

    const existingUser = await findAuthUserByEmail(email);
    if (!existingUser) {
        throw new Error("No account found for this email address. Please register first.");
    }

    const publicClient = createPublicServerClient();
    const { error } = await publicClient.auth.signInWithOtp({
        email,
        options: {
            shouldCreateUser: false,
        },
    });

    if (error) {
        throw new Error(formatSupabaseError(error.message, "Unable to send the login OTP."));
    }

    return {
        target: maskEmail(email),
        channel: "email" as const,
        expiresInSeconds: DEFAULT_OTP_EXPIRY_SECONDS,
    };
}

export async function verifyLoginOtp(
    supabase: SupabaseClient,
    input: { email: string; otp: string }
) {
    ensureSupabaseConfigured();

    const email = normalizeEmail(input.email);
    const otp = String(input.otp ?? "").trim();

    if (!isValidEmail(email)) {
        throw new Error("Enter a valid email address.");
    }
    if (!isValidEmailOtp(otp)) {
        throw new Error(`Enter a valid ${EMAIL_OTP_DIGITS}-digit OTP.`);
    }

    const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
    });

    if (error) {
        throw new Error(formatSupabaseError(error.message, "Unable to verify the OTP."));
    }

    const user = data.user;
    if (!user) {
        throw new Error("Login could not be completed.");
    }

    const profile = await recordLogin(user, "otp");
    return {
        user: toPublicUser(user, profile),
    };
}

export async function loginWithPassword(
    supabase: SupabaseClient,
    input: { email: string; password: string }
) {
    ensureSupabaseConfigured();

    const email = normalizeEmail(input.email);
    const password = String(input.password ?? "");

    if (!isValidEmail(email)) {
        throw new Error("Enter a valid email address.");
    }
    if (!password) {
        throw new Error("Password is required.");
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        throw new Error(formatSupabaseError(error.message, "Unable to login with password."));
    }

    const user = data.user ?? data.session?.user;
    if (!user) {
        throw new Error("Login could not be completed.");
    }

    const profile = await recordLogin(user, "password");
    return {
        user: toPublicUser(user, profile),
    };
}

export async function requestForgotPasswordEmail(input: { email: string }) {
    ensureSupabaseConfigured();

    const email = normalizeEmail(input.email);
    if (!isValidEmail(email)) {
        throw new Error("Enter a valid email address.");
    }

    const { appUrl } = getSupabaseConfig();
    const publicClient = createPublicServerClient();
    const { error } = await publicClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${appUrl}/auth?recovery=1`,
    });

    if (error) {
        throw new Error(formatSupabaseError(error.message, "Unable to send the password reset email."));
    }

    return {
        target: maskEmail(email),
    };
}

export async function resetPasswordWithSession(
    supabase: SupabaseClient,
    input: { password: string }
) {
    ensureSupabaseConfigured();

    const password = String(input.password ?? "").trim();
    validateStrongPassword(password);

    const user = await requireAuthenticatedUser(supabase);
    const { error } = await supabase.auth.updateUser({
        password,
    });

    if (error) {
        throw new Error(formatSupabaseError(error.message, "Unable to update the password."));
    }

    await insertActivity(user.id, "password_reset", "Password reset completed via recovery link.");
    return { success: true };
}

export async function completeProfileFromSession(
    supabase: SupabaseClient,
    input: {
        name: string;
        preferredServices?: string[];
        password?: string;
        userType?: UserType;
        studyField?: string;
        domain?: string;
        companyRole?: string;
        city?: string;
    }
) {
    ensureSupabaseConfigured();

    const user = await requireAuthenticatedUser(supabase);
    const name = String(input.name ?? "").trim();

    if (!isValidName(name)) {
        throw new Error("Enter a valid full name.");
    }

    const preferredServices = Array.from(
        new Set(
            (input.preferredServices ?? [])
                .map((item) => item.trim())
                .filter(Boolean)
                .slice(0, 5)
        )
    );

    const city = String(input.city ?? "").trim();
    if (!city) {
        throw new Error("Please enter your city.");
    }

    const userType = input.userType;
    if (userType && userType !== "student" && userType !== "working_professional") {
        throw new Error("Choose a valid user type.");
    }

    let studyField: string | null = null;
    let domain: string | null = null;
    let companyRole: string | null = null;

    if (userType === "student") {
        studyField = String(input.studyField ?? "").trim();
        if (studyField.length < 2) {
            throw new Error("Please enter what you are studying.");
        }
    }

    if (userType === "working_professional") {
        domain = String(input.domain ?? "").trim();
        companyRole = String(input.companyRole ?? "").trim();
        if (domain.length < 2) {
            throw new Error("Please enter your domain or industry.");
        }
        if (companyRole.length < 2) {
            throw new Error("Please enter your company name or role.");
        }
    }

    const password = String(input.password ?? "").trim();
    if (password) {
        validateStrongPassword(password);
        const { error } = await supabase.auth.updateUser({
            password,
        });
        if (error) {
            throw new Error(formatSupabaseError(error.message, "Unable to update your password."));
        }
    }

    const profile = await upsertProfile(user, {
        full_name: name,
        onboarding_completed: true,
        preferred_services: preferredServices,
        user_type: userType ?? null,
        study_field: studyField,
        domain,
        company_role: companyRole,
        city,
    });

    await insertActivity(user.id, "profile", "Completed profile setup.");
    return toPublicUser(user, profile);
}

export async function selectPlanFromSession(supabase: SupabaseClient, planId: string) {
    ensureSupabaseConfigured();

    const user = await requireAuthenticatedUser(supabase);
    const profile = await upsertProfile(user, {
        selected_plan_id: planId,
        payment_status: "unpaid",
    });

    await insertActivity(user.id, "profile", `Selected the "${planId}" plan.`);
    return toPublicUser(user, profile);
}

export async function getDashboardData(supabase: SupabaseClient): Promise<DashboardData | null> {
    ensureSupabaseConfigured();

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error) {
        throw new Error(formatSupabaseError(error.message, "Unable to read the current session."));
    }
    if (!user) {
        return null;
    }

    const profile = await getProfileById(user.id);
    const publicUser = toPublicUser(user, profile);
    const recentActivity = await getRecentActivity(user.id);

    const accountAgeDays = Math.max(
        1,
        Math.floor((Date.now() - new Date(publicUser.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    );

    return {
        profile: publicUser,
        metrics: {
            accountAgeDays,
            totalLogins: publicUser.loginCount,
            inquiryCount: publicUser.inquiryCount,
        },
        recentActivity: recentActivity.map((item) => ({
            id: item.id,
            userId: item.user_id,
            type: item.type,
            message: item.message,
            at: item.created_at,
        })),
        websiteModules: [
            {
                title: "Career Assessment",
                route: "/demo-test",
                description: "Take the aptitude + psychometric prototype test.",
            },
            {
                title: "Career Services",
                route: "/#services",
                description: "Review available programs and offerings.",
            },
            {
                title: "Support Contact",
                route: "/#contact",
                description: "Submit your inquiry for guidance.",
            },
        ],
    };
}

export async function logoutFromSession(supabase: SupabaseClient) {
    ensureSupabaseConfigured();

    const { error } = await supabase.auth.signOut();
    if (error) {
        throw new Error(formatSupabaseError(error.message, "Unable to log out."));
    }
}
