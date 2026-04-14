/* eslint-disable @typescript-eslint/no-explicit-any */
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
  existingRef?: string;
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
      existingRef,
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
        { success: false, error: 'Ticket type must be "single", "couple" or "none"' },
        { status: 400 },
      );
    }
    
    if (registrationTicketType === 'couple' && (!partnerName || typeof partnerName !== 'string' || !partnerName.trim())) {
      return NextResponse.json(
        { success: false, error: "Partner name is required for couple tickets" },
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

    const paystackReference = existingRef && typeof existingRef === "string" 
      ? existingRef 
      : `VESTRY-${nanoid(10).toUpperCase()}`;

    const regData = {
      name,
      email,
      ticketType,
      partnerName,
      meshSelection,
      meshQuantity: Number(meshQuantity) || 1,
      meshColor,
      meshSize,
      meshInscriptions,
      foodSelections,
      drinkSelection,
      merch,
      totalAmount,
      paystackReference,
      paymentStatus: false,
      status: "pending",
      declineReason: undefined, 
      paymentMethod: paymentMethod === "transfer" ? "transfer" : "paystack",
      paymentReceiptUrl: typeof paymentReceiptUrl === "string" ? paymentReceiptUrl : undefined,
    };

    let registration;
    if (existingRef && typeof existingRef === "string") {
      registration = await Registration.findOneAndUpdate(
        { paystackReference: existingRef },
        regData,
        { new: true }
      );
      if (!registration) {
        return NextResponse.json(
          { success: false, error: "Existing registration not found" },
          { status: 404 }
        );
      }
    } else {
      registration = await Registration.create(regData);
    }

if (registration.paymentMethod === "transfer") {
      sendAdminTransferNotification(registration).catch(console.error);

      if (registration.paymentReceiptUrl) {
        // Works both locally (APP_URL=http://localhost:3000) and on Vercel
        const appUrl =
          process.env.APP_URL ||
          process.env.NEXT_PUBLIC_APP_URL ||
          "https://localhost:3000";

        // Delay AI trigger by 3s to avoid rapid rate-limit hits when
        // multiple registrations arrive at the same time
        console.log(`[ai-trigger] Scheduling AI verification for ${registration._id} in 3 seconds...`);
        setTimeout(() => {
          console.log(`[ai-trigger] Firing AI verification for ${registration._id}`);
          fetch(
            `${appUrl}/api/registrations/${registration._id}/approve`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ trigger: "ai" }),
            }
          )
            .then(async (res) => {
              const data = await res.json().catch(() => ({}));
              console.log(`[ai-trigger] AI verification response for ${registration._id}:`, {
                status: res.status,
                autoApproved: data.autoApproved ?? "N/A",
                message: data.message ?? data.error ?? "No message",
              });
            })
            .catch((err) => {
              console.error(`[ai-trigger] AI verification failed for ${registration._id}:`, err.message);
            });
        }, 3000);
      }
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
