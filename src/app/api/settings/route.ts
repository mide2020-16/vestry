/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Event from "@/models/Event";
import { auth } from "@/auth";
import { getEventBySlug } from "@/lib/utils/event";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const eventId = searchParams.get("eventId");

    let event;
    if (eventId) {
      event = await Event.findById(eventId).lean();
    } else if (slug) {
      event = await getEventBySlug(slug);
    } else {
      // Fallback for legacy calls if any, but ideally everything passes slug
      event = await Event.findOne().sort({ createdAt: -1 }).lean();
    }

    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    let config = (event as any).config;
    const session = await auth();
    let isAdmin = false;

    if (session?.user?.email) {
      const User = (await import("@/models/User")).default;
      const dbUser = await User.findOne({ email: session.user.email.toLowerCase() }).lean() as any;
      if (dbUser) {
        isAdmin = dbUser.role === "SUPER_ADMIN" || dbUser.role === "EVENT_ADMIN";
      }
    }

    if (!isAdmin && config) {
      const safeConfig = { ...config };
      delete safeConfig.paystackSecretKey;
      delete safeConfig.smtp;
      config = safeConfig;
    }

    if (event.endDate) {
      config = { ...config, registrationEndDate: event.endDate };
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        ...config,
        description: event.description,
        bannerImageUrl: event.bannerImageUrl,
        status: (event as any).status,
        slug: (event as any).slug,
      }, 
      eventId: event._id.toString() 
    });
  } catch {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    
    const User = (await import("@/models/User")).default;
    const dbUser = await User.findOne({ email: session.user.email?.toLowerCase() }).lean() as any;
    
    if (!dbUser || (dbUser.role !== "SUPER_ADMIN" && dbUser.role !== "EVENT_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { eventId, registrationEndDate, description, bannerImageUrl, ...config } = body;

    if (!eventId) {
      return NextResponse.json({ success: false, error: "eventId is required" }, { status: 400 });
    }

    if (dbUser.role === "EVENT_ADMIN") {
      const managed = (dbUser?.managedEvents || []).map((id: any) => id.toString());
      if (!managed.includes(eventId)) {
        return NextResponse.json({ success: false, error: "Unauthorized for this event" }, { status: 403 });
      }
    }

    const updatePayload: any = { $set: { config } };
    
    if (registrationEndDate !== undefined) {
      updatePayload.$set.endDate = registrationEndDate ? new Date(registrationEndDate) : null;
    }
    if (description !== undefined) {
      updatePayload.$set.description = description;
    }
    if (bannerImageUrl !== undefined) {
      updatePayload.$set.bannerImageUrl = bannerImageUrl;
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      updatePayload,
      { new: true }
    ).lean();

    return NextResponse.json({ 
      success: true, 
      data: {
        ...(updatedEvent as any).config,
        description: (updatedEvent as any).description,
        bannerImageUrl: (updatedEvent as any).bannerImageUrl,
      } 
    });
  } catch {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
