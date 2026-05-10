/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Event from "@/models/Event";
import { auth } from "@/auth";
import { UserRole } from "@/models/User";
import ActivityLog, { LogAction, UserType } from "@/models/AuditLog";
import User from "@/models/User";


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isPublic = searchParams.get("public") === "true";
  const session = await auth();

  try {
    await dbConnect();
    
    // If it's a public request or no session, return all events
    if (isPublic || !session?.user?.email) {
      const events = await Event.find({}).sort({ createdAt: -1 }).lean();
      return NextResponse.json({ success: true, data: events });
    }

    // Otherwise, handle admin/managed events logic
    const User = (await import("@/models/User")).default;
    const { normalizeRole } = await import("@/models/User");
    const dbUserRaw = await User.findOne({ email: session.user.email?.toLowerCase() }).lean() as any;
    
    if (!dbUserRaw) {
      // If session exists but user not in DB, treat as public for now or return 401
      const events = await Event.find({}).sort({ createdAt: -1 }).lean();
      return NextResponse.json({ success: true, data: events });
    }

    const dbUser = { ...dbUserRaw, role: normalizeRole(dbUserRaw.role) };

    let query = {};
    if (dbUser.role !== UserRole.SUPER_ADMIN) {
      query = { _id: { $in: dbUser?.managedEvents || [] } };
    }

    const events = await Event.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: events });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as any;

  try {
    await dbConnect();
    const body = await request.json();
    const { name, slug, status, endDate } = body;

    if (!name || !slug) {
      return NextResponse.json({ success: false, error: "Name and Slug are required" }, { status: 400 });
    }

    const event = await Event.create({
      name,
      slug,
      status: status || "OPEN",
      endDate,
      config: {
        tenureName: name,
        singlePrice: 0,
        couplePrice: 0,
        meshSinglePrice: 0,
        meshCouplePrice: 0,
        paystackEnabled: true,
        bankTransferEnabled: true,
        meshColors: [],
        meshSizes: []
      }
    });

    const User = await import("@/models/User").then(m => m.default);
    
    // Add event to user's managedEvents and upgrade role if USER
    const dbUser = await User.findOne({ email: session.user.email?.toLowerCase() });
    if (dbUser) {
      if (!dbUser.managedEvents) dbUser.managedEvents = [];
      dbUser.managedEvents.push(event._id);
      
      if (dbUser.role === UserRole.END_USER) {
        dbUser.role = UserRole.EVENT_CREATOR;
      }
      await dbUser.save();

      // Create Activity Log
      await ActivityLog.create({
        userId: dbUser._id,
        userType: UserType.ADMIN,
        userName: dbUser.name,
        userEmail: dbUser.email,
        action: LogAction.CREATE,
        resource: "Event",
        resourceId: event._id,
        details: `Created new event: ${name}`,
        metadata: { slug, status }
      });
    }

    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: "Slug already exists" }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Failed to create event" }, { status: 500 });
  }
}
