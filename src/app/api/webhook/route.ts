import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/dbConnect";
import Registration from "@/models/Registration";
import Settings from "@/models/Settings";

// ── helpers ────────────────────────────────────────────────────────────────

function isValidSignature(
  rawBody: string,
  secret: string,
  signature: string,
): boolean {
  const hash = crypto
    .createHmac("sha512", secret)
    .update(rawBody)
    .digest("hex");
  return hash === signature;
}

async function resolveSecretKey(): Promise<string> {
  const settings = await Settings.findOne().lean();
  return (
    (settings as { paystackSecretKey?: string } | null)?.paystackSecretKey ??
    process.env.PAYSTACK_SECRET_KEY ??
    ""
  );
}

async function handleChargeSuccess(data: {
  reference: string;
  metadata?: { registrationId?: string };
}): Promise<void> {
  const { reference, metadata } = data;
  const registrationId = metadata?.registrationId;

  if (!registrationId) {
    console.warn("charge.success received without registrationId in metadata");
    return;
  }

  const registration = await Registration.findByIdAndUpdate(
    registrationId,
    { paymentStatus: true, paystackReference: reference },
    { new: true },
  );

  if (!registration) {
    console.error(`Registration not found for ID: ${registrationId}`);
  } else {
    console.log(
      `Registration ${registrationId} marked as paid (ref: ${reference})`,
    );
  }
}

// ── route handler ──────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const [rawBody, signature] = await Promise.all([
      request.text(),
      Promise.resolve(request.headers.get("x-paystack-signature") ?? ""),
    ]);

    // Validate signature before touching the DB
    await dbConnect();
    const secretKey = await resolveSecretKey();

    if (!secretKey) {
      console.error("Paystack secret key is not configured");
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }

    if (!isValidSignature(rawBody, secretKey, signature)) {
      console.error("Invalid Paystack webhook signature");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const event = JSON.parse(rawBody) as {
      event: string;
      data: { reference: string; metadata?: { registrationId?: string } };
    };

    if (event.event === "charge.success") {
      await handleChargeSuccess(event.data);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: unknown) {
    console.error(
      "Webhook error:",
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
