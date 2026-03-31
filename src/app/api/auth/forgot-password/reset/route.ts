import { NextResponse } from "next/server";
import { resetPasswordWithToken } from "@/lib/auth";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        const ip = getClientIp(req.headers);
        const ipRate = consumeRateLimit({
            key: `auth:forgot:reset:ip:${ip}`,
            limit: 20,
            windowMs: 10 * 60 * 1000,
        });
        if (!ipRate.ok) {
            return NextResponse.json(
                { success: false, message: "Too many requests. Try again later." },
                { status: 429, headers: { "Retry-After": String(ipRate.retryAfterSeconds) } }
            );
        }

        const body = await req.json();
        await resetPasswordWithToken({
            resetToken: body?.resetToken ?? "",
            password: body?.password ?? "",
        });

        return NextResponse.json({
            success: true,
            message: "Password reset successful. You can now log in with your new password.",
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to reset password.";
        return NextResponse.json({ success: false, message }, { status: 400 });
    }
}