import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminAuthenticatedRequest } from "@/lib/admin-auth";
import { getPlanById } from "@/data/plans";

export const runtime = "nodejs";

type PaymentMethod = "razorpay" | "cash" | "manual_upi";
type PaymentStatus = "paid" | "unpaid";
type UserType = "student" | "working_professional";

type EditableProfile = {
    id: string;
    full_name: string | null;
    mobile: string | null;
    date_of_birth: string | null;
    user_type: UserType | null;
    city: string | null;
    selected_plan_id: string | null;
    payment_status: PaymentStatus | null;
    payment_method: PaymentMethod | null;
    payment_id: string | null;
    transaction_id: string | null;
    payment_token: string | null;
    manual_cash_amount: number | null;
    manual_payment_notes: string | null;
    psychometric_test_link: string | null;
};

function normalizeOptionalText(value: unknown) {
    const normalized = String(value ?? "").trim();
    return normalized || null;
}

function normalizeOptionalAmount(value: unknown) {
    if (value === null || value === undefined || value === "") {
        return null;
    }

    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) {
        throw new Error("Manual cash amount must be a valid positive number.");
    }

    return parsed;
}

function normalizePaymentStatus(value: unknown): PaymentStatus {
    return value === "paid" ? "paid" : "unpaid";
}

function normalizePaymentMethod(value: unknown, fallback: EditableProfile | null): PaymentMethod | null {
    if (value === "razorpay" || value === "cash" || value === "manual_upi") {
        return value;
    }

    if (fallback?.payment_method === "razorpay" || fallback?.payment_method === "cash" || fallback?.payment_method === "manual_upi") {
        return fallback.payment_method;
    }

    if (fallback?.payment_id) {
        return "razorpay";
    }
    if (fallback?.manual_cash_amount !== null && fallback?.manual_cash_amount !== undefined) {
        return "cash";
    }
    if (fallback?.transaction_id) {
        return "manual_upi";
    }

    return null;
}

export async function PATCH(req: NextRequest, { params }: { params: { userId: string } }) {
    try {
        if (!isAdminAuthenticatedRequest(req)) {
            return NextResponse.json({ success: false, message: "Admin authentication required." }, { status: 401 });
        }

        const admin = createAdminClient();
        const { data: existingProfile, error: existingError } = await admin
            .from("profiles")
            .select("*")
            .eq("id", params.userId)
            .maybeSingle<EditableProfile>();

        if (existingError) {
            throw existingError;
        }
        if (!existingProfile) {
            return NextResponse.json({ success: false, message: "User record not found." }, { status: 404 });
        }

        const body = await req.json();

        const selectedPlanId = normalizeOptionalText(body?.selectedPlanId);
        if (selectedPlanId && !getPlanById(selectedPlanId)) {
            return NextResponse.json({ success: false, message: "Choose a valid plan before saving." }, { status: 400 });
        }

        const paymentStatus = normalizePaymentStatus(body?.paymentStatus);
        const paymentMethod = normalizePaymentMethod(body?.paymentMethod, existingProfile);
        const paymentId = normalizeOptionalText(body?.paymentId);
        const transactionId = normalizeOptionalText(body?.transactionId);
        const paymentToken = normalizeOptionalText(body?.paymentToken);
        const manualCashAmount = normalizeOptionalAmount(body?.manualCashAmount);

        if (paymentStatus === "paid" && paymentMethod === "cash" && (!manualCashAmount || manualCashAmount <= 0)) {
            return NextResponse.json(
                { success: false, message: "Enter the cash amount collected before saving." },
                { status: 400 },
            );
        }

        if (paymentStatus === "paid" && paymentMethod === "manual_upi" && !transactionId) {
            return NextResponse.json(
                { success: false, message: "Enter the manual UPI transaction ID before saving." },
                { status: 400 },
            );
        }

        const updatePayload: Partial<EditableProfile> = {
            full_name: normalizeOptionalText(body?.fullName) ?? existingProfile.full_name,
            mobile: normalizeOptionalText(body?.mobile) ?? existingProfile.mobile,
            date_of_birth: normalizeOptionalText(body?.dateOfBirth),
            user_type:
                body?.userType === "student" || body?.userType === "working_professional"
                    ? body.userType
                    : null,
            city: normalizeOptionalText(body?.city),
            selected_plan_id: selectedPlanId,
            payment_status: paymentStatus,
            payment_method: paymentMethod,
            manual_payment_notes: normalizeOptionalText(body?.manualPaymentNotes),
            psychometric_test_link: normalizeOptionalText(body?.psychometricTestLink),
        };

        if (paymentMethod === "cash") {
            updatePayload.manual_cash_amount = manualCashAmount;
            updatePayload.payment_id = null;
            updatePayload.transaction_id = null;
            updatePayload.payment_token = null;
        } else if (paymentMethod === "manual_upi") {
            updatePayload.manual_cash_amount = null;
            updatePayload.payment_id = null;
            updatePayload.transaction_id = transactionId;
            updatePayload.payment_token = paymentToken;
        } else if (paymentMethod === "razorpay") {
            updatePayload.manual_cash_amount = null;
            updatePayload.payment_id = paymentId;
            updatePayload.transaction_id = transactionId;
            updatePayload.payment_token = paymentToken;
        } else {
            updatePayload.manual_cash_amount = null;
            updatePayload.payment_id = paymentId;
            updatePayload.transaction_id = transactionId;
            updatePayload.payment_token = paymentToken;
        }

        if (paymentStatus === "unpaid") {
            updatePayload.psychometric_test_link = normalizeOptionalText(body?.psychometricTestLink);
        }

        const { data: updatedProfile, error: updateError } = await admin
            .from("profiles")
            .update(updatePayload)
            .eq("id", params.userId)
            .select("*")
            .single<EditableProfile>();

        if (updateError) {
            throw updateError;
        }

        return NextResponse.json({ success: true, data: updatedProfile });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to update this registration.";
        return NextResponse.json({ success: false, message }, { status: 400 });
    }
}
