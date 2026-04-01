import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Registration from "@/models/Registration";
import Product from "@/models/Product";
import Settings from "@/models/Settings";
import { nanoid } from "nanoid";
import { isRegistrationOpen } from "@/lib/registration";
import { sendAdminTransferNotification } from "@/lib/email";

// ── types ──────────────────────────────────────────────────────────────────

interface RegistrationBody {
  name?: unknown;
  email?: unknown;
  ticketType?: unknown;
  partnerName?: unknown;
  meshSelection?: unknown;
  meshQuantity?: unknown;
  meshColor?: unknown;
  meshSize?: unknown;
  meshInscriptions?: unknown; // Successfully mapped to model
  foodSelections?: unknown;
  drinkSelection?: unknown;
  paymentMethod?: unknown;
  paymentReceiptUrl?: unknown;
}

function calculatePaystackFee(baseAmount: number): number {
  if (baseAmount <= 0) return 0;
  let fee = 0;
  if (baseAmount < 2500) {
    fee = (baseAmount * 0.015) / (1 - 0.015);
  } else {
    fee = ((baseAmount + 100) * 0.015) / (1 - 0.015) + 100;
  }
  return Math.min(fee, 2000);
}

// ── helpers ────────────────────────────────────────────────────────────────

function isValidEmail(value: unknown): value is string {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidTicketType(value: unknown): value is "single" | "couple" {
  return value === "single" || value === "couple";
}

async function calculateTotal(
  ticketType: "single" | "couple",
  meshSelection: unknown,
  meshQuantity: number = 1,
): Promise<number> {
  await dbConnect();

  // Fallback prices in case Settings haven't been seeded in DB yet
  const settings = (await Settings.findOne().lean()) || {
    couplePrice: 50000,
    singlePrice: 30000,
  };
  const base =
    ticketType === "couple" ? settings.couplePrice : settings.singlePrice;

  if (!meshSelection) return base;

  const mesh = await Product.findById(meshSelection).lean();
  const meshPrice = (mesh?.price ?? 0) * meshQuantity;

  return base + meshPrice;
}

// ── route handler ──────────────────────────────────────────────────────────

export async function POST(request: Request) {
  if (!isRegistrationOpen()) {
    return NextResponse.json(
      { error: "Registration has closed" },
      { status: 403 },
    );
  }

  try {
    await dbConnect();

    const body = (await request.json()) as RegistrationBody;
    const {
      name,
      email,
      ticketType,
      partnerName,
      meshSelection,
      meshQuantity,
      meshColor,
      meshSize,
      meshInscriptions,
      foodSelections,
      drinkSelection,
      paymentMethod = "paystack",
      paymentReceiptUrl,
    } = body;

    // Validation
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 },
      );
    }
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: "A valid email is required" },
        { status: 400 },
      );
    }
    if (!isValidTicketType(ticketType)) {
      return NextResponse.json(
        { success: false, error: 'Ticket type must be "single" or "couple"' },
        { status: 400 },
      );
    }

    const baseTotal = await calculateTotal(
      ticketType,
      meshSelection,
      Number(meshQuantity) || 1
    );

    const totalAmount = paymentMethod === "paystack" 
      ? baseTotal + calculatePaystackFee(baseTotal) 
      : baseTotal;

    const paystackReference = `VESTRY-${nanoid(10).toUpperCase()}`;

    const registration = await Registration.create({
      name,
      email,
      ticketType,
      partnerName,
      meshSelection,
      meshQuantity: Number(meshQuantity) || 1,
      meshColor,
      meshSize,
      meshInscriptions, // Saved to DB
      foodSelections,
      drinkSelection,
      totalAmount,
      paystackReference,
      paymentStatus: false,
      paymentMethod: paymentMethod === "transfer" ? "transfer" : "paystack",
      paymentReceiptUrl: typeof paymentReceiptUrl === "string" ? paymentReceiptUrl : undefined,
    });

    if (registration.paymentMethod === "transfer") {
      // Don't await email, let it run in background so response is furious fast
      sendAdminTransferNotification(registration).catch(console.error);
    }

    return NextResponse.json(
      {
        success: true,
        _id: registration._id,
        paystackReference: registration.paystackReference,
        totalAmount: registration.totalAmount,
        paystackKey: process.env.PAYSTACK_PUBLIC_KEY,
      },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create registration";
    console.error("Registration error:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
