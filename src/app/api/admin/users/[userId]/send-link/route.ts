import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(req: NextRequest, { params }: { params: { userId: string } }) {
    try {
        const { psychometricTestLink } = await req.json();
        if (!psychometricTestLink) {
            return NextResponse.json({ success: false, message: "Link is required." }, { status: 400 });
        }

        const admin = createAdminClient();
        const { error } = await admin
            .from("profiles")
            .update({ psychometric_test_link: psychometricTestLink })
            .eq("id", params.userId);

        if (error) throw error;

        return NextResponse.json({ success: true, message: "Link updated successfully." });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to send link.";
        return NextResponse.json({ success: false, message }, { status: 400 });
    }
}
