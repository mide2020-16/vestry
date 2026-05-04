import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Notification from "@/models/Notification";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const notifications = await Notification.find({ recipientId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({ success: true, data: notifications });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const { notificationId } = await request.json();
    
    if (notificationId === "read-all") {
       await Notification.updateMany(
        { recipientId: session.user.id, read: false },
        { read: true }
      );
    } else {
      await Notification.findByIdAndUpdate(notificationId, { read: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update notification" }, { status: 500 });
  }
}
