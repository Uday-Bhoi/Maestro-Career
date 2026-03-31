export type OtpChannel = "mobile" | "email" | "whatsapp";

export interface OtpDeliveryPayload {
    channel: OtpChannel;
    target: string;
    otp: string;
    purpose: "register" | "login" | "forgot_password";
}

function ensureRequiredEnv(name: string) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

async function sendViaTwilio(payload: OtpDeliveryPayload) {
    const accountSid = ensureRequiredEnv("TWILIO_ACCOUNT_SID");
    const authToken = ensureRequiredEnv("TWILIO_AUTH_TOKEN");
    const messagingServiceSid = ensureRequiredEnv("TWILIO_MESSAGING_SERVICE_SID");

    const to = payload.channel === "email" ? "" : payload.target;
    if (!to) {
        throw new Error("Twilio supports SMS/WhatsApp targets only.");
    }

    const body = payload.purpose === "register"
        ? `Your Maestro registration OTP is ${payload.otp}. It expires in 5 minutes.`
        : payload.purpose === "login"
            ? `Your Maestro login OTP is ${payload.otp}. It expires in 5 minutes.`
            : `Your Maestro password reset OTP is ${payload.otp}. It expires in 5 minutes.`;

    const form = new URLSearchParams({
        To: payload.channel === "whatsapp" ? `whatsapp:${to}` : to,
        MessagingServiceSid: messagingServiceSid,
        Body: body,
    });

    const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
            method: "POST",
            headers: {
                Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: form.toString(),
        }
    );

    if (!response.ok) {
        const bodyText = await response.text();
        throw new Error(`Twilio delivery failed: ${bodyText}`);
    }
}

async function sendViaResend(payload: OtpDeliveryPayload) {
    if (payload.channel !== "email") {
        throw new Error("Resend provider is configured for email channel only.");
    }

    const apiKey = ensureRequiredEnv("RESEND_API_KEY");
    const fromEmail = ensureRequiredEnv("RESEND_FROM_EMAIL");

    const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            from: fromEmail,
            to: [payload.target],
            subject:
                payload.purpose === "register"
                    ? "Your registration OTP"
                    : payload.purpose === "login"
                        ? "Your login OTP"
                        : "Your password reset OTP",
            text:
                payload.purpose === "register"
                    ? `Your Maestro registration OTP is ${payload.otp}. It expires in 5 minutes.`
                    : payload.purpose === "login"
                        ? `Your Maestro login OTP is ${payload.otp}. It expires in 5 minutes.`
                        : `Your Maestro password reset OTP is ${payload.otp}. It expires in 5 minutes.`,
        }),
    });

    if (!response.ok) {
        const bodyText = await response.text();
        throw new Error(`Resend delivery failed: ${bodyText}`);
    }
}

async function sendViaMock(payload: OtpDeliveryPayload) {
    console.info(
        `[OTP-MOCK] purpose=${payload.purpose} channel=${payload.channel} target=${payload.target} otp=${payload.otp}`
    );
}

export async function deliverOtp(payload: OtpDeliveryPayload) {
    const provider = (process.env.OTP_PROVIDER ?? "mock").toLowerCase();

    if (provider === "twilio") {
        await sendViaTwilio(payload);
        return;
    }

    if (provider === "resend") {
        await sendViaResend(payload);
        return;
    }

    await sendViaMock(payload);
}
