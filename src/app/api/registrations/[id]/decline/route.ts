import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Registration from "@/models/Registration";
import { auth } from "@/auth";
import { sendUserDeclineNotification } from "@/lib/email";
import { UTApi } from "uploadthing/server";

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
    const { reason } = await request.json();

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json({ success: false, error: "A reason is required" }, { status: 400 });
    }

    const reg = await Registration.findById(id);
    if (!reg) {
      return NextResponse.json({ success: false, error: "Registration not found" }, { status: 404 });
    }

    // 1. Delete the receipt from UploadThing if it exists
    if (reg.paymentReceiptUrl) {
      try {
        const utapi = new UTApi();
        // Extract key from URL. UploadThing URLs are typically https://.../f/KEY
        const key = reg.paymentReceiptUrl.split("/").pop();
        if (key) {
          await utapi.deleteFiles(key);
        }
      } catch (utError) {
        console.error("Failed to delete file from UploadThing:", utError);
        // We continue even if deletion fails to ensure the DB and Email are updated
      }
    }

    // 2. Update registration status and record the reason
    reg.status = "declined";
    reg.paymentStatus = false;
    reg.paymentReceiptUrl = undefined; // Force a re-upload
    reg.declineReason = reason.trim();
    await reg.save();

    // 3. Notify user
    sendUserDeclineNotification(reg).catch(console.error);

    return NextResponse.json({ success: true, message: "Registration declined successfully" });
  } catch (error) {
    console.error("Decline API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
