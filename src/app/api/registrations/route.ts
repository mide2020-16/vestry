import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Registration from "@/models/Registration";
import Product from "@/models/Product";
import Settings from "@/models/Settings";
import { nanoid } from "nanoid";
import { isRegistrationOpen } from "@/lib/registration";
import { sendAdminTransferNotification } from "@/lib/email";
import { 
  calculatePaystackFee, 
  isValidEmail, 
  isValidTicketType 
} from "@/lib/checkout";
import { calculateRegistrationTotal } from "@/lib/checkout.server";

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
  merch?: {
    productId: string;
    quantity: number;
    color?: string;
    size?: string;
    inscriptions?: string;
  }[];
  paymentMethod?: unknown;
  paymentReceiptUrl?: unknown;
}

// (Functions moved to src/lib/checkout.ts)

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
      merch,
      paymentMethod,
      paymentReceiptUrl,
    } = body;

    const settings = await Settings.findOne().lean() as any;
    const isPaystackEnabled = settings?.paystackEnabled ?? true;
    const isTransferEnabled = settings?.bankTransferEnabled ?? true;

    // Enforce payment method toggles
    if (paymentMethod === "paystack" && !isPaystackEnabled) {
      return NextResponse.json(
        { success: false, error: "Online payment is currently disabled" },
        { status: 403 },
      );
    }
    if (paymentMethod === "transfer" && !isTransferEnabled) {
      return NextResponse.json(
        { success: false, error: "Manual bank transfer is currently disabled" },
        { status: 403 },
      );
    }
    if (!isPaystackEnabled && !isTransferEnabled) {
      return NextResponse.json(
        { success: false, error: "Registrations are temporarily closed (no payment method available)" },
        { status: 403 },
      );
    }

    const registrationEmail = typeof email === "string" ? email : "";
    const registrationTicketType = typeof ticketType === "string" ? ticketType : "single";

    // Validation
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 },
      );
    }
    if (!isValidEmail(registrationEmail)) {
      return NextResponse.json(
        { success: false, error: "A valid email is required" },
        { status: 400 },
      );
    }
    if (!isValidTicketType(registrationTicketType)) {
      return NextResponse.json(
        { success: false, error: 'Ticket type must be "single" or "couple"' },
        { status: 400 },
      );
    }

    const baseTotal = await calculateRegistrationTotal(
      registrationTicketType,
      merch as any
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
      merch,
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
