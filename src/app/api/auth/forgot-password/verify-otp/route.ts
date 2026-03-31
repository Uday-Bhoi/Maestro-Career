import { NextResponse } from "next/server";
import { verifyForgotPasswordOtp } from "@/lib/auth";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        const ip = getClientIp(req.headers);
        const ipRate = consumeRateLimit({
            key: `auth:forgot:verify:ip:${ip}`,
            limit: 40,
            windowMs: 10 * 60 * 1000,
        });
        if (!ipRate.ok) {
            return NextResponse.json(
                { success: false, message: "Too many attempts. Try again later." },
                { status: 429, headers: { "Retry-After": String(ipRate.retryAfterSeconds) } }
            );
        }

        const body = await req.json();
        const identifier = String(body?.identifier ?? "").trim().toLowerCase();
        if (identifier) {
            const identifierRate = consumeRateLimit({
                key: `auth:forgot:verify:identifier:${identifier}`,
                limit: 10,
                windowMs: 10 * 60 * 1000,
            });
            if (!identifierRate.ok) {
                return NextResponse.json(
                    { success: false, message: "Too many invalid attempts. Please request a new OTP." },
                    { status: 429, headers: { "Retry-After": String(identifierRate.retryAfterSeconds) } }
                );
            }
        }

        const result = await verifyForgotPasswordOtp({
            identifier: body?.identifier ?? "",
            otp: body?.otp ?? "",
        });

        return NextResponse.json({
            success: true,
            message: "OTP verified successfully.",
            resetToken: result.resetToken,
            expiresInSeconds: result.expiresInSeconds,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to verify OTP.";
        return NextResponse.json({ success: false, message }, { status: 400 });
    }
}