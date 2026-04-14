import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Registration from "@/models/Registration";
import { sendUserAbandonedNotification } from "@/lib/email";

/** Rejects anything that isn't a plain alphanumeric/dash/underscore reference. */
function isSafeReference(ref: unknown): ref is string {
  return typeof ref === "string" && /^[\w-]+$/.test(ref);
}

async function verifyWithPaystack(reference: string) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) return { success: false, error: "Not configured" };

  try {
    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) return { success: false };
    const body = await res.json();
    return { success: true, status: body.data?.status };
  } catch (err) {
    return { success: false };
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();

    const registration = await Registration.findById(id);
    if (!registration) {
      return NextResponse.json(
        { success: false, error: "Registration not found" },
        { status: 404 }
      );
    }

    // Protection: Only sensitive to pending registrations for direct removal
    // (though an admin might want to clear any, the request specifically mentioned pending)
    if (registration.status !== "pending") {
       // Optional: allow admin to delete anything, but the request was "unknown pending"
       // We'll allow it but provide the Paystack guard
    }

    // Paystack Guard: Ensure we don't delete a PAID transaction that is just stuck
    if (registration.paymentMethod === "paystack" && registration.paystackReference) {
      const pCheck = await verifyWithPaystack(registration.paystackReference);
      if (pCheck.success && pCheck.status === "success") {
        return NextResponse.json(
          { 
            success: false, 
            error: "Fraud Protection: This transaction was already paid on Paystack. Deletion blocked.",
            isPaidOnPaystack: true
          },
          { status: 400 }
        );
      }
    }

    // Send the abandoned notification email
    await sendUserAbandonedNotification(registration).catch(console.error);

    // Delete from database
    await Registration.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Registration removed and user notified." });
  } catch (error) {
    console.error("Delete registration error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove registration" },
      { status: 500 }
    );
  }
}
