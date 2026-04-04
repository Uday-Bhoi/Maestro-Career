import { NextRequest, NextResponse } from "next/server";
import { selectPlanFromSession } from "@/lib/auth-supabase";
import { createRouteHandlerClient } from "@/lib/supabase/route";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        const { planId } = await req.json();
        if (!planId) {
            return NextResponse.json({ success: false, message: "Plan ID is required." }, { status: 400 });
        }

        const { supabase, applyToResponse } = createRouteHandlerClient(req);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const updatedUser = await selectPlanFromSession(supabase, planId);

        return applyToResponse(NextResponse.json({ success: true, data: updatedUser }));
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to select plan.";
        return NextResponse.json({ success: false, message }, { status: 400 });
    }
}
