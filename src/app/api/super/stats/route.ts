/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { auth } from "@/auth";
import User, { UserRole } from "@/models/User";
import Event from "@/models/Event";
import Registration from "@/models/Registration";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const currentUser = await User.findOne({ email: session.user?.email?.toLowerCase() }).lean() as any;

    if (!currentUser || currentUser.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json({ success: false, error: "Forbidden: Super Admin only" }, { status: 403 });
    }

    // System-wide statistics
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: { $in: [UserRole.SUPER_ADMIN, UserRole.EVENT_CREATOR] } });
    const totalEvents = await Event.countDocuments();
    const totalRegistrations = await Registration.countDocuments();
    
    const paidRegistrations = await Registration.find({ status: "success" }).lean();
    const totalRevenue = paidRegistrations.reduce((acc, r: any) => acc + (r.totalAmount || 0), 0);

    // Recent system activity (last 10 registrations)
    const recentActivity = await Registration.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("eventId", "name")
      .lean();

    // Top Events by Revenue
    const events = await Event.find().lean();
    const eventStats = await Promise.all(events.map(async (event: any) => {
      const regCount = await Registration.countDocuments({ eventId: event._id });
      const successfulRegs = await Registration.find({ eventId: event._id, status: "success" }).lean();
      const revenue = successfulRegs.reduce((acc, r: any) => acc + (r.totalAmount || 0), 0);
      
      return {
        id: event._id,
        name: event.name,
        slug: event.slug,
        status: event.status,
        regCount,
        revenue
      };
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalAdmins,
        totalEvents,
        totalRegistrations,
        totalRevenue
      },
      recentActivity,
      eventStats: eventStats.sort((a, b) => b.revenue - a.revenue)
    });
  } catch (error) {
    console.error("Super Stats Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch super stats" }, { status: 500 });
  }
}
