import { randomBytes, randomUUID, scryptSync, timingSafeEqual, createHash } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { AUTH_CONFIG } from "@/lib/auth-config";
import { deliverOtp } from "@/lib/otp-delivery";

export const AUTH_COOKIE_NAME = "maestro_auth_session";

const MIN_SIGNUP_AGE = 13;

type LoginMethod = "otp" | "password";
type OtpPurpose = "register" | "login" | "forgot_password";
type OtpChannel = "mobile" | "email";
type UserType = "student" | "working_professional";

interface User {
    id: string;
    name: string;
    email: string;
    mobile: string;
    countryCode: string;
    dateOfBirth: string;
    termsAcceptedAt: string;
    onboardingCompleted: boolean;
    passwordHash: string;
    passwordSalt: string;
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
}

interface OtpChallenge {
    id: string;
    purpose: OtpPurpose;
    identifier: string;
    channel: OtpChannel;
    otpHash?: string;
    otpSalt?: string;
    otp?: string;
    expiresAt: string;
    attempts: number;
    createdAt: string;
    registerPayload?: {
        fullName: string;
        email: string;
        mobile: string;
        countryCode: string;
        dateOfBirth: string;
        termsAcceptedAt: string;
        passwordHash: string;
        passwordSalt: string;
    };
    userId?: string;
}

interface Session {
    id: string;
    userId: string;
    tokenHash: string;
    createdAt: string;
    expiresAt: string;
}

interface PasswordResetSession {
    id: string;
    userId: string;
    tokenHash: string;
    createdAt: string;
    expiresAt: string;
}

interface UserActivity {
    id: string;
    userId: string;
    type: "registration" | "login" | "profile" | "password_reset";
    message: string;
    at: string;
}

interface AuthDb {
    users: User[];
    otpChallenges: OtpChallenge[];
    sessions: Session[];
    passwordResetSessions: PasswordResetSession[];
    activities: UserActivity[];
}

interface PublicUser {
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
}

interface DashboardData {
    profile: PublicUser;
    metrics: {
        accountAgeDays: number;
        totalLogins: number;
        inquiryCount: number;
    };
    recentActivity: UserActivity[];
    websiteModules: Array<{ title: string; route: string; description: string }>;
}

const DB_PATH = path.join(process.cwd(), "data", "auth-prototype.json");
const PASSWORD_RESET_TTL_MS = 10 * 60 * 1000;

const DEFAULT_DB: AuthDb = {
    users: [],
    otpChallenges: [],
    sessions: [],
    passwordResetSessions: [],
    activities: [],
};

function nowIso() {
    return new Date().toISOString();
}

function sha256(value: string) {
    return createHash("sha256").update(value).digest("hex");
}

function normalizeEmail(value: string) {
    return value.trim().toLowerCase();
}

function normalizeCountryCode(value: string) {
    const digits = String(value ?? "").replace(/\D/g, "");
    if (!digits) {
        return "+1";
    }
    return `+${digits}`;
}

function normalizeMobileLocal(value: string) {
    return String(value ?? "").replace(/\D/g, "");
}

function normalizeMobileWithCountryCode(countryCode: string, mobile: string) {
    const normalizedCountryCode = normalizeCountryCode(countryCode);
    const mobileDigits = normalizeMobileLocal(mobile);
    return `${normalizedCountryCode}${mobileDigits}`;
}

function normalizeIdentifier(identifier: string) {
    const trimmed = String(identifier ?? "").trim();
    if (trimmed.includes("@")) {
        return { channel: "email" as const, value: normalizeEmail(trimmed) };
    }

    const withPlus = trimmed.startsWith("+") ? trimmed : `+${trimmed}`;
    const value = `+${withPlus.replace(/\D/g, "")}`;
    return { channel: "mobile" as const, value };
}

function maskValue(channel: OtpChannel, value: string) {
    if (channel === "mobile") {
        const mobileDigits = value.replace(/\D/g, "");
        if (mobileDigits.length <= 4) {
            return value;
        }
        return `${value.slice(0, 3)}${"*".repeat(Math.max(mobileDigits.length - 7, 2))}${mobileDigits.slice(-4)}`;
    }

    const [name, domain] = value.split("@");
    if (!name || !domain) {
        return value;
    }
    if (name.length <= 2) {
        return `${name[0] ?? ""}*@${domain}`;
    }

    return `${name[0]}${"*".repeat(Math.max(name.length - 2, 1))}${name[name.length - 1]}@${domain}`;
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

function hashPassword(password: string, salt: string) {
    return scryptSync(password, salt, 64).toString("hex");
}

function hashOtp(otp: string, salt: string) {
    return scryptSync(otp, salt, 32).toString("hex");
}

function generateOtp() {
    const num = Math.floor(100000 + Math.random() * 900000);
    return String(num);
}

function compareHashedOtp(challenge: OtpChallenge, otp: string) {
    if (challenge.otpHash && challenge.otpSalt) {
        const expected = Buffer.from(challenge.otpHash, "hex");
        const actual = Buffer.from(hashOtp(otp, challenge.otpSalt), "hex");
        return expected.length === actual.length && timingSafeEqual(expected, actual);
    }

    if (!challenge.otp) {
        return false;
    }

    return challenge.otp === otp;
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

function normalizeExistingUser(raw: Partial<User>): User {
    return {
        id: String(raw.id ?? randomUUID()),
        name: String(raw.name ?? "Learner"),
        email: normalizeEmail(String(raw.email ?? "")),
        mobile: String(raw.mobile ?? ""),
        countryCode: String(raw.countryCode ?? "+1"),
        dateOfBirth: String(raw.dateOfBirth ?? ""),
        termsAcceptedAt: String(raw.termsAcceptedAt ?? raw.createdAt ?? nowIso()),
        onboardingCompleted: Boolean(raw.onboardingCompleted ?? false),
        passwordHash: String(raw.passwordHash ?? ""),
        passwordSalt: String(raw.passwordSalt ?? ""),
        createdAt: String(raw.createdAt ?? nowIso()),
        updatedAt: String(raw.updatedAt ?? raw.createdAt ?? nowIso()),
        lastLoginAt: raw.lastLoginAt,
        lastLoginMethod: raw.lastLoginMethod,
        loginCount: Number(raw.loginCount ?? 0),
        inquiryCount: Number(raw.inquiryCount ?? 0),
        preferredServices: Array.isArray(raw.preferredServices) ? raw.preferredServices : [],
        userType: raw.userType,
        studyField: raw.studyField,
        domain: raw.domain,
        companyRole: raw.companyRole,
        city: raw.city,
    };
}

function cleanupDb(db: AuthDb) {
    const now = Date.now();
    db.otpChallenges = db.otpChallenges.filter((item) => new Date(item.expiresAt).getTime() > now);
    db.sessions = db.sessions.filter((item) => new Date(item.expiresAt).getTime() > now);
    db.passwordResetSessions = db.passwordResetSessions.filter((item) => new Date(item.expiresAt).getTime() > now);
}

async function ensureDbFile() {
    const dir = path.dirname(DB_PATH);
    await fs.mkdir(dir, { recursive: true });
    try {
        await fs.access(DB_PATH);
    } catch {
        await fs.writeFile(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2), "utf8");
    }
}

async function readDb(): Promise<AuthDb> {
    await ensureDbFile();
    const raw = await fs.readFile(DB_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<AuthDb>;

    const db: AuthDb = {
        users: (parsed.users ?? []).map((user) => normalizeExistingUser(user)),
        otpChallenges: (parsed.otpChallenges ?? []) as OtpChallenge[],
        sessions: (parsed.sessions ?? []) as Session[],
        passwordResetSessions: (parsed.passwordResetSessions ?? []) as PasswordResetSession[],
        activities: (parsed.activities ?? []) as UserActivity[],
    };

    cleanupDb(db);
    return db;
}

async function writeDb(db: AuthDb) {
    cleanupDb(db);
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

function toPublicUser(user: User): PublicUser {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        countryCode: user.countryCode,
        onboardingCompleted: user.onboardingCompleted,
        hasPassword: Boolean(user.passwordHash && user.passwordSalt),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLoginAt: user.lastLoginAt,
        lastLoginMethod: user.lastLoginMethod,
        loginCount: user.loginCount,
        inquiryCount: user.inquiryCount,
        preferredServices: user.preferredServices,
        userType: user.userType,
        studyField: user.studyField,
        domain: user.domain,
        companyRole: user.companyRole,
        city: user.city,
    };
}

function findUserByIdentifier(db: AuthDb, identifier: string) {
    const normalized = normalizeIdentifier(identifier);
    if (normalized.channel === "email") {
        return db.users.find((user) => user.email === normalized.value);
    }
    return db.users.find((user) => user.mobile === normalized.value);
}

function addActivity(db: AuthDb, userId: string, type: UserActivity["type"], message: string) {
    db.activities.unshift({
        id: randomUUID(),
        userId,
        type,
        message,
        at: nowIso(),
    });
    db.activities = db.activities.slice(0, 300);
}

function applySuccessfulLogin(user: User, method: LoginMethod) {
    user.lastLoginAt = nowIso();
    user.lastLoginMethod = method;
    user.loginCount += 1;
    user.updatedAt = nowIso();
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

    const db = await readDb();
    const duplicateEmail = db.users.find((user) => user.email === email);
    if (duplicateEmail) {
        throw new Error("An account already exists for this email address.");
    }

    const duplicateMobile = db.users.find((user) => user.mobile === mobile);
    if (duplicateMobile) {
        throw new Error("An account already exists for this mobile number.");
    }

    db.otpChallenges = db.otpChallenges.filter(
        (challenge) => !(challenge.purpose === "register" && challenge.registerPayload?.email === email)
    );

    const otp = generateOtp();
    const otpSalt = randomBytes(16).toString("hex");
    const passwordSalt = randomBytes(16).toString("hex");

    await Promise.all([
        deliverOtp({
            channel: "email",
            target: email,
            otp,
            purpose: "register",
        }),
        deliverOtp({
            channel: "mobile",
            target: mobile,
            otp,
            purpose: "register",
        }),
    ]);

    const challenge: OtpChallenge = {
        id: randomUUID(),
        purpose: "register",
        identifier: email,
        channel: "email",
        otpHash: hashOtp(otp, otpSalt),
        otpSalt,
        expiresAt: new Date(Date.now() + AUTH_CONFIG.otpTtlMs).toISOString(),
        attempts: 0,
        createdAt: nowIso(),
        registerPayload: {
            fullName,
            email,
            mobile,
            countryCode,
            dateOfBirth: new Date(input.dateOfBirth).toISOString(),
            termsAcceptedAt: nowIso(),
            passwordHash: hashPassword(password, passwordSalt),
            passwordSalt,
        },
    };

    db.otpChallenges.push(challenge);
    await writeDb(db);

    return {
        emailTarget: maskValue("email", email),
        mobileTarget: maskValue("mobile", mobile),
        expiresInSeconds: Math.floor(AUTH_CONFIG.otpTtlMs / 1000),
        ...(AUTH_CONFIG.debugOtpEnabled ? { debugOtp: otp } : {}),
    };
}

export async function verifyRegistrationOtp(input: {
    email: string;
    mobile: string;
    countryCode: string;
    otp: string;
}) {
    const email = normalizeEmail(input.email);
    const mobile = normalizeMobileWithCountryCode(input.countryCode, input.mobile);
    const otp = String(input.otp ?? "").trim();
    const db = await readDb();

    const challenge = db.otpChallenges.find(
        (item) => item.purpose === "register" && item.registerPayload?.email === email
    );

    if (!challenge || !challenge.registerPayload || challenge.registerPayload.mobile !== mobile) {
        throw new Error(
            AUTH_CONFIG.strictAuthErrors
                ? "Invalid or expired OTP. Please request a new OTP."
                : "No active registration OTP found. Please request a new OTP."
        );
    }

    if (challenge.attempts >= AUTH_CONFIG.otpMaxAttempts) {
        db.otpChallenges = db.otpChallenges.filter((item) => item.id !== challenge.id);
        await writeDb(db);
        throw new Error(
            AUTH_CONFIG.strictAuthErrors
                ? "Invalid or expired OTP. Please request a new OTP."
                : "Too many invalid attempts. Please request a new OTP."
        );
    }

    if (!compareHashedOtp(challenge, otp)) {
        challenge.attempts += 1;
        await writeDb(db);
        throw new Error(
            AUTH_CONFIG.strictAuthErrors
                ? "Invalid or expired OTP. Please request a new OTP."
                : "Invalid OTP."
        );
    }

    const registerPayload = challenge.registerPayload;

    const duplicateEmail = db.users.find((user) => user.email === registerPayload.email);
    if (duplicateEmail) {
        db.otpChallenges = db.otpChallenges.filter((item) => item.id !== challenge.id);
        await writeDb(db);
        throw new Error("An account already exists for this email address.");
    }

    const duplicateMobile = db.users.find((user) => user.mobile === registerPayload.mobile);
    if (duplicateMobile) {
        db.otpChallenges = db.otpChallenges.filter((item) => item.id !== challenge.id);
        await writeDb(db);
        throw new Error("An account already exists for this mobile number.");
    }

    const user: User = {
        id: randomUUID(),
        name: registerPayload.fullName,
        email: registerPayload.email,
        mobile: registerPayload.mobile,
        countryCode: registerPayload.countryCode,
        dateOfBirth: registerPayload.dateOfBirth,
        termsAcceptedAt: registerPayload.termsAcceptedAt,
        onboardingCompleted: false,
        passwordHash: registerPayload.passwordHash,
        passwordSalt: registerPayload.passwordSalt,
        createdAt: nowIso(),
        updatedAt: nowIso(),
        loginCount: 0,
        inquiryCount: 0,
        preferredServices: [],
    };

    applySuccessfulLogin(user, "otp");

    db.users.push(user);
    db.otpChallenges = db.otpChallenges.filter((item) => item.id !== challenge.id);
    addActivity(db, user.id, "registration", "Completed registration via OTP verification.");

    const sessionToken = randomBytes(32).toString("hex");
    db.sessions.push({
        id: randomUUID(),
        userId: user.id,
        tokenHash: sha256(sessionToken),
        createdAt: nowIso(),
        expiresAt: new Date(Date.now() + AUTH_CONFIG.sessionTtlMs).toISOString(),
    });

    await writeDb(db);

    return {
        user: toPublicUser(user),
        sessionToken,
    };
}

export async function requestLoginOtp(input: { identifier: string }) {
    const normalized = normalizeIdentifier(input.identifier);
    if (normalized.channel === "mobile" && !isValidMobile(normalized.value)) {
        throw new Error("Enter a valid mobile number with country code.");
    }
    if (normalized.channel === "email" && !isValidEmail(normalized.value)) {
        throw new Error("Enter a valid email address.");
    }

    const db = await readDb();
    const user = findUserByIdentifier(db, normalized.value);
    if (!user && !AUTH_CONFIG.strictAuthErrors) {
        throw new Error("No account found for the provided identifier.");
    }

    db.otpChallenges = db.otpChallenges.filter(
        (challenge) => !(challenge.purpose === "login" && challenge.identifier === normalized.value)
    );

    const otp = generateOtp();
    const otpSalt = randomBytes(16).toString("hex");

    if (user) {
        const challenge: OtpChallenge = {
            id: randomUUID(),
            purpose: "login",
            identifier: normalized.value,
            channel: normalized.channel,
            otpHash: hashOtp(otp, otpSalt),
            otpSalt,
            expiresAt: new Date(Date.now() + AUTH_CONFIG.otpTtlMs).toISOString(),
            attempts: 0,
            createdAt: nowIso(),
            userId: user.id,
        };

        await deliverOtp({
            channel: normalized.channel,
            target: normalized.value,
            otp,
            purpose: "login",
        });

        db.otpChallenges.push(challenge);
        await writeDb(db);
    }

    return {
        target: maskValue(normalized.channel, normalized.value),
        channel: normalized.channel,
        ...(AUTH_CONFIG.debugOtpEnabled && user ? { debugOtp: otp } : {}),
        expiresInSeconds: Math.floor(AUTH_CONFIG.otpTtlMs / 1000),
    };
}

export async function verifyLoginOtp(input: { identifier: string; otp: string }) {
    const normalized = normalizeIdentifier(input.identifier);
    const otp = input.otp.trim();
    const db = await readDb();

    const challenge = db.otpChallenges.find(
        (item) => item.purpose === "login" && item.identifier === normalized.value
    );

    if (!challenge || !challenge.userId) {
        throw new Error(
            AUTH_CONFIG.strictAuthErrors
                ? "Invalid or expired OTP. Please request a new OTP."
                : "No active login OTP found. Please request a new OTP."
        );
    }

    if (challenge.attempts >= AUTH_CONFIG.otpMaxAttempts) {
        db.otpChallenges = db.otpChallenges.filter((item) => item.id !== challenge.id);
        await writeDb(db);
        throw new Error(
            AUTH_CONFIG.strictAuthErrors
                ? "Invalid or expired OTP. Please request a new OTP."
                : "Too many invalid attempts. Please request a new OTP."
        );
    }

    if (!compareHashedOtp(challenge, otp)) {
        challenge.attempts += 1;
        await writeDb(db);
        throw new Error(
            AUTH_CONFIG.strictAuthErrors
                ? "Invalid or expired OTP. Please request a new OTP."
                : "Invalid OTP."
        );
    }

    const user = db.users.find((item) => item.id === challenge.userId);
    if (!user) {
        db.otpChallenges = db.otpChallenges.filter((item) => item.id !== challenge.id);
        await writeDb(db);
        throw new Error("User account no longer exists.");
    }

    applySuccessfulLogin(user, "otp");
    db.otpChallenges = db.otpChallenges.filter((item) => item.id !== challenge.id);
    addActivity(db, user.id, "login", `Logged in via ${challenge.channel.toUpperCase()} OTP.`);

    const sessionToken = randomBytes(32).toString("hex");
    db.sessions.push({
        id: randomUUID(),
        userId: user.id,
        tokenHash: sha256(sessionToken),
        createdAt: nowIso(),
        expiresAt: new Date(Date.now() + AUTH_CONFIG.sessionTtlMs).toISOString(),
    });

    await writeDb(db);

    return {
        user: toPublicUser(user),
        sessionToken,
    };
}

export async function loginWithPassword(input: { identifier: string; password: string }) {
    const normalized = normalizeIdentifier(input.identifier);
    const password = input.password;

    if (!password) {
        throw new Error("Password is required.");
    }

    const db = await readDb();
    const user = findUserByIdentifier(db, normalized.value);
    if (!user || !user.passwordHash || !user.passwordSalt) {
        throw new Error("This account does not have password login enabled.");
    }

    const computedHash = hashPassword(password, user.passwordSalt);
    const storedBuf = Buffer.from(user.passwordHash, "hex");
    const computedBuf = Buffer.from(computedHash, "hex");

    if (storedBuf.length !== computedBuf.length || !timingSafeEqual(storedBuf, computedBuf)) {
        throw new Error("Invalid credentials.");
    }

    applySuccessfulLogin(user, "password");
    addActivity(db, user.id, "login", "Logged in via password.");

    const sessionToken = randomBytes(32).toString("hex");
    db.sessions.push({
        id: randomUUID(),
        userId: user.id,
        tokenHash: sha256(sessionToken),
        createdAt: nowIso(),
        expiresAt: new Date(Date.now() + AUTH_CONFIG.sessionTtlMs).toISOString(),
    });

    await writeDb(db);

    return {
        user: toPublicUser(user),
        sessionToken,
    };
}

export async function requestForgotPasswordOtp(input: { identifier: string }) {
    const normalized = normalizeIdentifier(input.identifier);
    if (normalized.channel === "mobile" && !isValidMobile(normalized.value)) {
        throw new Error("Enter a valid mobile number with country code.");
    }
    if (normalized.channel === "email" && !isValidEmail(normalized.value)) {
        throw new Error("Enter a valid email address.");
    }

    const db = await readDb();
    const user = findUserByIdentifier(db, normalized.value);
    if (!user && !AUTH_CONFIG.strictAuthErrors) {
        throw new Error("No account found for the provided identifier.");
    }

    db.otpChallenges = db.otpChallenges.filter(
        (challenge) => !(challenge.purpose === "forgot_password" && challenge.identifier === normalized.value)
    );

    const otp = generateOtp();
    const otpSalt = randomBytes(16).toString("hex");

    if (user) {
        const challenge: OtpChallenge = {
            id: randomUUID(),
            purpose: "forgot_password",
            identifier: normalized.value,
            channel: normalized.channel,
            otpHash: hashOtp(otp, otpSalt),
            otpSalt,
            expiresAt: new Date(Date.now() + AUTH_CONFIG.otpTtlMs).toISOString(),
            attempts: 0,
            createdAt: nowIso(),
            userId: user.id,
        };

        await deliverOtp({
            channel: normalized.channel,
            target: normalized.value,
            otp,
            purpose: "forgot_password",
        });

        db.otpChallenges.push(challenge);
        await writeDb(db);
    }

    return {
        target: maskValue(normalized.channel, normalized.value),
        channel: normalized.channel,
        ...(AUTH_CONFIG.debugOtpEnabled && user ? { debugOtp: otp } : {}),
        expiresInSeconds: Math.floor(AUTH_CONFIG.otpTtlMs / 1000),
    };
}

export async function verifyForgotPasswordOtp(input: { identifier: string; otp: string }) {
    const normalized = normalizeIdentifier(input.identifier);
    const otp = String(input.otp ?? "").trim();
    const db = await readDb();

    const challenge = db.otpChallenges.find(
        (item) => item.purpose === "forgot_password" && item.identifier === normalized.value
    );

    if (!challenge || !challenge.userId) {
        throw new Error(
            AUTH_CONFIG.strictAuthErrors
                ? "Invalid or expired OTP. Please request a new OTP."
                : "No active reset OTP found. Please request a new OTP."
        );
    }

    if (challenge.attempts >= AUTH_CONFIG.otpMaxAttempts) {
        db.otpChallenges = db.otpChallenges.filter((item) => item.id !== challenge.id);
        await writeDb(db);
        throw new Error(
            AUTH_CONFIG.strictAuthErrors
                ? "Invalid or expired OTP. Please request a new OTP."
                : "Too many invalid attempts. Please request a new OTP."
        );
    }

    if (!compareHashedOtp(challenge, otp)) {
        challenge.attempts += 1;
        await writeDb(db);
        throw new Error(
            AUTH_CONFIG.strictAuthErrors
                ? "Invalid or expired OTP. Please request a new OTP."
                : "Invalid OTP."
        );
    }

    const user = db.users.find((item) => item.id === challenge.userId);
    if (!user) {
        db.otpChallenges = db.otpChallenges.filter((item) => item.id !== challenge.id);
        await writeDb(db);
        throw new Error("User account no longer exists.");
    }

    const resetToken = randomBytes(32).toString("hex");
    db.passwordResetSessions.push({
        id: randomUUID(),
        userId: user.id,
        tokenHash: sha256(resetToken),
        createdAt: nowIso(),
        expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS).toISOString(),
    });

    db.otpChallenges = db.otpChallenges.filter((item) => item.id !== challenge.id);
    await writeDb(db);

    return {
        resetToken,
        expiresInSeconds: Math.floor(PASSWORD_RESET_TTL_MS / 1000),
    };
}

export async function resetPasswordWithToken(input: { resetToken: string; password: string }) {
    const token = String(input.resetToken ?? "").trim();
    const password = String(input.password ?? "").trim();
    if (!token) {
        throw new Error("Invalid reset session.");
    }

    validateStrongPassword(password);

    const db = await readDb();
    const tokenHash = sha256(token);
    const resetSession = db.passwordResetSessions.find((item) => item.tokenHash === tokenHash);
    if (!resetSession) {
        throw new Error("Invalid or expired reset session.");
    }

    const user = db.users.find((item) => item.id === resetSession.userId);
    if (!user) {
        throw new Error("User account no longer exists.");
    }

    const salt = randomBytes(16).toString("hex");
    user.passwordSalt = salt;
    user.passwordHash = hashPassword(password, salt);
    user.updatedAt = nowIso();

    db.passwordResetSessions = db.passwordResetSessions.filter((item) => item.id !== resetSession.id);
    addActivity(db, user.id, "password_reset", "Password reset completed via OTP.");
    await writeDb(db);

    return { success: true };
}

export async function completeProfileFromSessionToken(
    token: string | undefined,
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
    if (!token) {
        throw new Error("Unauthorized");
    }

    const db = await readDb();
    const tokenHash = sha256(token);
    const session = db.sessions.find((item) => item.tokenHash === tokenHash);
    if (!session) {
        throw new Error("Unauthorized");
    }

    const user = db.users.find((item) => item.id === session.userId);
    if (!user) {
        throw new Error("Unauthorized");
    }

    const name = String(input.name ?? "").trim();
    if (!isValidName(name)) {
        throw new Error("Enter a valid full name.");
    }

    const preferredServices = (input.preferredServices ?? [])
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 5);

    user.name = name;
    user.preferredServices = preferredServices;

    const userType = input.userType;
    if (userType) {
        if (userType !== "student" && userType !== "working_professional") {
            throw new Error("Choose a valid user type.");
        }

        user.userType = userType;
        user.studyField = undefined;
        user.domain = undefined;
        user.companyRole = undefined;

        if (userType === "student") {
            const studyField = String(input.studyField ?? "").trim();
            if (studyField.length < 2) {
                throw new Error("Please enter what you are studying.");
            }
            user.studyField = studyField;
        }

        if (userType === "working_professional") {
            const domain = String(input.domain ?? "").trim();
            const companyRole = String(input.companyRole ?? "").trim();
            if (domain.length < 2) {
                throw new Error("Please enter your domain or industry.");
            }
            if (companyRole.length < 2) {
                throw new Error("Please enter your company name or role.");
            }
            user.domain = domain;
            user.companyRole = companyRole;
        }
    }

    const city = String(input.city ?? "").trim();
    if (city) {
        user.city = city;
    }

    const password = input.password?.trim() ?? "";
    if (password) {
        validateStrongPassword(password);
        const salt = randomBytes(16).toString("hex");
        user.passwordSalt = salt;
        user.passwordHash = hashPassword(password, salt);
    }

    user.onboardingCompleted = true;
    user.updatedAt = nowIso();
    addActivity(db, user.id, "profile", "Completed profile setup.");
    await writeDb(db);

    return toPublicUser(user);
}

export async function getUserFromSessionToken(token?: string) {
    if (!token) {
        return null;
    }

    const db = await readDb();
    const tokenHash = sha256(token);
    const session = db.sessions.find((item) => item.tokenHash === tokenHash);
    if (!session) {
        return null;
    }

    const user = db.users.find((item) => item.id === session.userId);
    if (!user) {
        return null;
    }

    return toPublicUser(user);
}

export async function logoutFromSessionToken(token?: string) {
    if (!token) {
        return;
    }

    const db = await readDb();
    const tokenHash = sha256(token);
    db.sessions = db.sessions.filter((item) => item.tokenHash !== tokenHash);
    await writeDb(db);
}

export async function getDashboardData(token?: string): Promise<DashboardData | null> {
    const publicUser = await getUserFromSessionToken(token);
    if (!publicUser) {
        return null;
    }

    const db = await readDb();
    const recentActivity = db.activities
        .filter((item) => item.userId === publicUser.id)
        .slice(0, 8);

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
        recentActivity,
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

export function getCookieMaxAgeSeconds() {
    return Math.floor(AUTH_CONFIG.sessionTtlMs / 1000);
}
