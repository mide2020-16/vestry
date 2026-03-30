import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Registration from "@/models/Registration";

// ── types ──────────────────────────────────────────────────────────────────

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data?: {
    status: string;
    reference: string;
    [key: string]: unknown;
  };
}

// ── helpers ────────────────────────────────────────────────────────────────

/** Rejects anything that isn't a plain alphanumeric/dash/underscore reference. */
function isSafeReference(ref: unknown): ref is string {
  return typeof ref === "string" && /^[\w-]+$/.test(ref);
}

async function verifyWithPaystack(
  reference: string,
): Promise<PaystackVerifyResponse> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) throw new Error("Paystack secret key is not configured");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
        signal: controller.signal,
      },
    );

    const text = await res.text();

    if (!text) throw new Error("Empty response from Paystack");

    let body: PaystackVerifyResponse;
    try {
      body = JSON.parse(text) as PaystackVerifyResponse;
    } catch {
      throw new Error(`Non-JSON response from Paystack: ${text.slice(0, 120)}`);
    }

    if (!res.ok) {
      throw new Error(body.message ?? `Paystack responded with ${res.status}`);
    }

    return body;
  } finally {
    clearTimeout(timeout);
  }
}

// ── route handler ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reference } = body as { reference?: unknown };

    if (!isSafeReference(reference)) {
      return NextResponse.json(
        { verified: false, error: "A valid reference is required" },
        { status: 400 },
      );
    }

    let paystackData: PaystackVerifyResponse;
    try {
      paystackData = await verifyWithPaystack(reference);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Verification failed";
      const isTimeout = err instanceof Error && err.name === "AbortError";
      const isConfig = message.includes("not configured");

      console.error("Paystack verification error:", message);
      return NextResponse.json(
        {
          verified: false,
          error: isTimeout ? "Request to Paystack timed out" : message,
        },
        { status: isTimeout ? 504 : isConfig ? 500 : 502 },
      );
    }

    if (paystackData.data?.status !== "success") {
      return NextResponse.json(
        {
          verified: false,
          error: `Payment status: ${paystackData.data?.status ?? "unknown"}`,
        },
        { status: 400 },
      );
    }

    await dbConnect();
    await Registration.findOneAndUpdate(
      { paystackReference: reference },
      { paymentStatus: true },
    );

    return NextResponse.json({ verified: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Verify route error:", error);
    return NextResponse.json(
      { verified: false, error: message },
      { status: 500 },
    );
  }
}
