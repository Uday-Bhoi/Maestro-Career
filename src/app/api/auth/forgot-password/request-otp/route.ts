import { NextResponse } from "next/server";
import { requestForgotPasswordOtp } from "@/lib/auth";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        const ip = getClientIp(req.headers);
        const ipRate = consumeRateLimit({
            key: `auth:forgot:request:ip:${ip}`,
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
        const identifier = String(body?.identifier ?? "").trim().toLowerCase();
        if (identifier) {
            const identifierRate = consumeRateLimit({
                key: `auth:forgot:request:identifier:${identifier}`,
                limit: 6,
                windowMs: 10 * 60 * 1000,
            });
            if (!identifierRate.ok) {
                return NextResponse.json(
                    { success: false, message: "Too many OTP requests. Please wait and retry." },
                    { status: 429, headers: { "Retry-After": String(identifierRate.retryAfterSeconds) } }
                );
            }
        }

        const result = await requestForgotPasswordOtp({
            identifier: body?.identifier ?? "",
        });

        return NextResponse.json({
            success: true,
            message: `OTP sent to your ${result.channel}.`,
            target: result.target,
            channel: result.channel,
            expiresInSeconds: result.expiresInSeconds,
            ...(result.debugOtp ? { debugOtp: result.debugOtp } : {}),
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to request OTP.";
        return NextResponse.json({ success: false, message }, { status: 400 });
    }
}