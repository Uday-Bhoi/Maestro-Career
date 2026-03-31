import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, completeProfileFromSessionToken } from "@/lib/auth";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        const ip = getClientIp(req.headers);
        const ipRate = consumeRateLimit({
            key: `auth:profile:setup:ip:${ip}`,
            limit: 20,
            windowMs: 10 * 60 * 1000,
        });
        if (!ipRate.ok) {
            return NextResponse.json(
                { success: false, message: "Too many requests. Try again later." },
                { status: 429, headers: { "Retry-After": String(ipRate.retryAfterSeconds) } }
            );
        }

        const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
        const body = await req.json();

        const user = await completeProfileFromSessionToken(token, {
            name: body?.name ?? "",
            preferredServices: Array.isArray(body?.preferredServices) ? body.preferredServices : [],
            password: body?.password ?? "",
            userType: body?.userType,
            studyField: body?.studyField,
            domain: body?.domain,
            companyRole: body?.companyRole,
            city: body?.city,
        });

        return NextResponse.json({
            success: true,
            message: "Profile completed successfully.",
            user,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to complete profile.";
        const status = message === "Unauthorized" ? 401 : 400;
        return NextResponse.json({ success: false, message }, { status });
    }
}
