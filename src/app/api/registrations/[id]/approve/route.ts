import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Registration from "@/models/Registration";
import { auth } from "@/auth";
import { sendUserApprovalNotification } from "@/lib/email";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const { id } = await params;
    
    const registration = await Registration.findByIdAndUpdate(
      id,
      { paymentStatus: true },
      { new: true }
    );

    if (!registration) {
      return NextResponse.json({ success: false, error: "Registration not found" }, { status: 404 });
    }

    // Fire email without blocking
    sendUserApprovalNotification(registration).catch(console.error);

    return NextResponse.json({ success: true, registration });
  } catch (error) {
    console.error("Failed to approve registration:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
