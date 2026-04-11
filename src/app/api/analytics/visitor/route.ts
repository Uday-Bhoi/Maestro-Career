import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const VISITOR_COOKIE = "maestro_visitor_id";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

type WebsiteVisitorRow = {
    id: string;
    visitor_key: string;
    visit_count: number;
};

function buildResponse(body: Record<string, unknown>) {
    return NextResponse.json(body, {
        headers: {
            "Cache-Control": "no-store",
        },
    });
}

export async function POST(req: NextRequest) {
    try {
        const admin = createAdminClient();
        const body = await req.json().catch(() => ({}));
        const firstPath = String(body?.path ?? "").trim() || "/";
        const existingVisitorKey = req.cookies.get(VISITOR_COOKIE)?.value?.trim();
        const visitorKey = existingVisitorKey || crypto.randomUUID();

        const { data: existingVisitor, error: fetchError } = await admin
            .from("website_visitors")
            .select("id, visitor_key, visit_count")
            .eq("visitor_key", visitorKey)
            .maybeSingle<WebsiteVisitorRow>();

        if (fetchError) {
            throw fetchError;
        }

        if (existingVisitor) {
            const { error: updateError } = await admin
                .from("website_visitors")
                .update({
                    last_seen_at: new Date().toISOString(),
                    visit_count: (existingVisitor.visit_count ?? 0) + 1,
                })
                .eq("visitor_key", visitorKey);

            if (updateError) {
                throw updateError;
            }
        } else {
            const { error: insertError } = await admin.from("website_visitors").insert({
                visitor_key: visitorKey,
                first_path: firstPath,
                last_seen_at: new Date().toISOString(),
            });

            if (insertError) {
                throw insertError;
            }
        }

        const response = buildResponse({ success: true });
        if (!existingVisitorKey) {
            response.cookies.set(VISITOR_COOKIE, visitorKey, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: ONE_YEAR_SECONDS,
                path: "/",
            });
        }

        return response;
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to record visitor.";
        return buildResponse({ success: false, message });
    }
}
