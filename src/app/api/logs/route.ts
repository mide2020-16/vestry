/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { logActivity } from "@/lib/activity-log";
import { LogAction, UserType } from "@/models/AuditLog";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, resource, resourceId, details, metadata, sessionId, userName, userEmail } = body;

    if (!action || !resource || !details) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    await logActivity({
      action: action as LogAction,
      resource,
      resourceId,
      details,
      metadata,
      userType: UserType.CONSUMER,
      userName,
      userEmail,
      sessionId
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
