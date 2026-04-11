import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminAuthenticatedRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
    try {
        if (!isAdminAuthenticatedRequest(req)) {
            return NextResponse.json({ success: false, message: "Admin authentication required." }, { status: 401 });
        }

        const admin = createAdminClient();
        const { count, error } = await admin
            .from("website_visitors")
            .select("*", { count: "exact", head: true });

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,
            data: {
                uniqueVisitors: count ?? 0,
            },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to load admin stats.";
        return NextResponse.json({ success: false, message }, { status: 400 });
    }
}
