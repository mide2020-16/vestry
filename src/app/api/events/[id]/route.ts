/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Event from "@/models/Event";
import { auth } from "@/auth";
import { UserRole } from "@/models/User";
import ActivityLog, { LogAction, UserType } from "@/models/AuditLog";
import User from "@/models/User";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await dbConnect();

    // Verify ownership
    const User = (await import("@/models/User")).default;
    const dbUser = await User.findOne({ email: session.user?.email?.toLowerCase() }).lean() as any;
    if (!dbUser) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    if (dbUser.role !== UserRole.SUPER_ADMIN) {
      const managedIds = (dbUser.managedEvents || []).map((e: any) => e.toString());
      if (!managedIds.includes(id)) {
        return NextResponse.json({ success: false, error: "You do not have permission to edit this event" }, { status: 403 });
      }
    }

    const body = await request.json();
    const { name, slug, status, endDate } = body;

    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    // Update fields
    if (name) event.name = name;
    if (slug) event.slug = slug;
    if (status) event.status = status;
    if (endDate) event.endDate = endDate;

    await event.save();

    // Create Activity Log
    await ActivityLog.create({
      userId: dbUser._id,
      userType: UserType.ADMIN,
      userName: dbUser.name,
      userEmail: dbUser.email,
      action: LogAction.UPDATE,
      resource: "Event",
      resourceId: id,
      details: `Updated event: ${event.name}`,
      metadata: body
    });

    return NextResponse.json({ success: true, data: event });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: "Slug already exists" }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await dbConnect();

    // Verify ownership
    const User = (await import("@/models/User")).default;
    const dbUser = await User.findOne({ email: session.user?.email?.toLowerCase() }).lean() as any;
    if (!dbUser) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    if (dbUser.role !== UserRole.SUPER_ADMIN) {
      const managedIds = (dbUser.managedEvents || []).map((e: any) => e.toString());
      if (!managedIds.includes(id)) {
        return NextResponse.json({ success: false, error: "You do not have permission to delete this event" }, { status: 403 });
      }
    }

    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    // Delete the event
    await Event.findByIdAndDelete(id);

    // Remove event from all users' managedEvents
    await User.updateMany(
      { managedEvents: id },
      { $pull: { managedEvents: id } }
    );

    // Create Activity Log
    await ActivityLog.create({
      userId: dbUser._id,
      userType: UserType.ADMIN,
      userName: dbUser.name,
      userEmail: dbUser.email,
      action: LogAction.DELETE,
      resource: "Event",
      resourceId: id,
      details: `Deleted event: ${event.name}`,
      metadata: { slug: event.slug }
    });

    return NextResponse.json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete event" }, { status: 500 });
  }
}
