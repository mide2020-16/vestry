import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/dbConnect";
import Registration from "@/models/Registration";
import Event from "@/models/Event";
import { sendUserApprovalNotification } from "@/lib/email";

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

// Deprecated: multi-tenant architecture now looks up secret keys per event.

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

  const existingRegistration = await Registration.findById(registrationId);
  if (!existingRegistration) {
    console.error(`Registration not found for ID: ${registrationId}`);
    return;
  }

  if (existingRegistration.status === "success" || existingRegistration.paymentStatus === true) {
    console.log(`Registration ${registrationId} is already marked as paid. Ignoring duplicate webhook.`);
    return;
  }

  existingRegistration.paymentStatus = true;
  existingRegistration.status = "success";
  existingRegistration.paystackReference = reference;
  await existingRegistration.save();

  console.log(`Registration ${registrationId} marked as paid (ref: ${reference})`);
  await sendUserApprovalNotification(existingRegistration).catch(console.error);
}

// ── route handler ──────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const [rawBody, signature] = await Promise.all([
      request.text(),
      Promise.resolve(request.headers.get("x-paystack-signature") ?? ""),
    ]);

    await dbConnect();
    
    // Parse the JSON without trusting it yet, just to find the registration ID for the multi-tenant key lookup
    let eventPayload: any;
    try {
      eventPayload = JSON.parse(rawBody);
    } catch (e) {
      console.error("Invalid JSON payload");
      return NextResponse.json({ error: "Bad Request" }, { status: 400 });
    }

    const registrationId = eventPayload.data?.metadata?.registrationId;
    let secretKey = process.env.PAYSTACK_SECRET_KEY ?? "";

    // If we have a registrationId, look up the specific event's secret key
    if (registrationId) {
      const registration = await Registration.findById(registrationId).lean() as any;
      if (registration && registration.eventId) {
        const event = await Event.findById(registration.eventId).lean() as any;
        if (event?.config?.paystackSecretKey) {
          secretKey = event.config.paystackSecretKey;
        }
      }
    }

    if (!secretKey) {
      console.error("Paystack secret key is not configured for this environment or event.");
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }

    if (!isValidSignature(rawBody, secretKey, signature)) {
      console.error("Invalid Paystack webhook signature");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const event = eventPayload as {
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
