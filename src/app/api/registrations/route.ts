/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Registration from "@/models/Registration";
import { nanoid } from "nanoid";
import { isRegistrationOpen } from "@/lib/registration";
import { sendAdminTransferNotification, sendUserTransferReceivedNotification } from "@/lib/email";
import {
  calculatePaystackFee,
  isValidEmail, 
  isValidTicketType 
} from "@/lib/checkout";
import { calculateRegistrationTotal } from "@/lib/checkout.server";
import { getEventBySlug } from "@/lib/utils/event";
import ActivityLog, { LogAction, UserType } from "@/models/AuditLog";

interface RegistrationBody {
  name?: unknown;
  email?: unknown;
  ticketType?: unknown;
  partnerName?: unknown;
  foodSelections?: string[];
  drinkSelection?: string[];
  paymentMethod?: unknown;
  paymentReceiptUrl?: unknown;
  existingRef?: string;
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  
  if (!slug) {
    return NextResponse.json({ error: "Missing event context" }, { status: 400 });
  }

  try {
    await dbConnect();
    const event = await getEventBySlug(slug);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (!(await isRegistrationOpen(event._id.toString()))) {
      return NextResponse.json({ error: "Registration has closed" }, { status: 403 });
    }

    const body = (await request.json()) as RegistrationBody;
    const {
      name,
      email,
      ticketType,
      partnerName,
      foodSelections,
      drinkSelection,
      paymentMethod,
      paymentReceiptUrl,
      existingRef,
    } = body;

    const config = event.config;
    const isPaystackEnabled = config?.paystackEnabled ?? true;
    const isTransferEnabled = config?.bankTransferEnabled ?? true;

    if (paymentMethod === "paystack" && !isPaystackEnabled) {
      return NextResponse.json({ error: "Online payment disabled" }, { status: 403 });
    }
    if (paymentMethod === "transfer" && !isTransferEnabled) {
      return NextResponse.json({ error: "Bank transfer disabled" }, { status: 403 });
    }

    const registrationEmail = typeof email === "string" ? email : "";
    const registrationTicketType = typeof ticketType === "string" ? ticketType : "";

    if (!name || typeof name !== "string") return NextResponse.json({ error: "Name required" }, { status: 400 });
    if (!isValidEmail(registrationEmail)) return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    if (!isValidTicketType(registrationTicketType)) return NextResponse.json({ error: "Invalid ticket type" }, { status: 400 });

    // Validate ticket type exists in event config
    const validTicket = config?.ticketTypes?.find((t: { name: string }) => t.name === registrationTicketType);
    if (!validTicket) {
      return NextResponse.json({ error: `Ticket type '${registrationTicketType}' is not available for this event.` }, { status: 400 });
    }

    // Prevent duplicate successful registrations, and reuse pending/declined ones
    const existingRegistrationByEmail = await Registration.findOne({
      email: { $regex: new RegExp(`^${registrationEmail}$`, "i") },
      eventId: event._id,
    });

    let refrenceToUse = typeof existingRef === "string" ? existingRef : "";
    if (existingRegistrationByEmail) {
      if (existingRegistrationByEmail.status === "success" || existingRegistrationByEmail.paymentStatus === true) {
        return NextResponse.json({ error: "This email has already been registered for this event." }, { status: 400 });
      }
      
      if (!refrenceToUse) {
        refrenceToUse = existingRegistrationByEmail.paystackReference;
      }
    }

    const baseTotal = await calculateRegistrationTotal(
      event._id.toString(),
      registrationTicketType
    );

    const totalAmount = paymentMethod === "paystack" 
      ? baseTotal + calculatePaystackFee(baseTotal) 
      : baseTotal;

    const paystackReference = refrenceToUse 
      ? refrenceToUse 
      : `VESTRY-${nanoid(10).toUpperCase()}`;

    const regData = {
      eventId: event._id,
      name,
      email,
      ticketType: registrationTicketType,
      partnerName,
      foodSelections: Array.isArray(foodSelections) ? foodSelections : [],
      drinkSelection: Array.isArray(drinkSelection) ? drinkSelection : [],
      totalAmount,
      paystackReference,
      paymentStatus: false,
      status: "pending",
      paymentMethod: paymentMethod === "transfer" ? "transfer" : "paystack",
      paymentReceiptUrl: typeof paymentReceiptUrl === "string" ? paymentReceiptUrl : undefined,
    };

    let registration;
    if (refrenceToUse) {
      registration = await Registration.findOneAndUpdate(
        { paystackReference: refrenceToUse, eventId: event._id },
        regData,
        { new: true }
      );
      if (!registration) return NextResponse.json({ error: "Existing registration not found" }, { status: 404 });
    } else {
      registration = await Registration.create(regData);
    }

    if (registration.paymentMethod === "transfer") {
      await Promise.allSettled([
        sendAdminTransferNotification(registration),
        sendUserTransferReceivedNotification(registration, event)
      ]);
    }

    // Create Activity Log for Consumer
    await ActivityLog.create({
      userType: UserType.CONSUMER,
      userName: name as string,
      userEmail: email as string,
      action: LogAction.SUBMIT_REGISTRATION,
      resource: "Registration",
      resourceId: registration._id,
      details: `Consumer ${name} submitted registration for ${event.name}`,
      metadata: { 
        amount: totalAmount, 
        method: paymentMethod,
        ticketType: registrationTicketType
      }
    });

    return NextResponse.json({
      success: true,
      _id: registration._id,
      paystackReference: registration.paystackReference,
      totalAmount: registration.totalAmount,
      paystackKey: config.paystackPublicKey || process.env.PAYSTACK_PUBLIC_KEY,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
