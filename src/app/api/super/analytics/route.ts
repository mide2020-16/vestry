/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { auth } from "@/auth";
import User, { UserRole } from "@/models/User";
import Registration from "@/models/Registration";
import Event from "@/models/Event";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const currentUser = await User.findOne({ email: session.user?.email?.toLowerCase() }).lean() as any;

    if (!currentUser || currentUser.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. Revenue Over Time (Last 30 Days)
    const revenueOverTime = await Registration.aggregate([
      {
        $match: {
          status: "success",
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 2. Registrations Over Time (Last 30 Days)
    const registrationsOverTime = await Registration.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 3. Event Performance Breakdown
    const events = await Event.find().lean();
    const eventBreakdown = await Promise.all(events.map(async (event: any) => {
      const stats = await Registration.aggregate([
        { $match: { eventId: event._id } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: { $cond: [{ $eq: ["$status", "success"] }, "$totalAmount", 0] } },
            regCount: { $sum: 1 },
            paidCount: { $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] } }
          }
        }
      ]);

      return {
        name: event.name,
        revenue: stats[0]?.totalRevenue || 0,
        registrations: stats[0]?.regCount || 0,
        paid: stats[0]?.paidCount || 0
      };
    }));

    // 4. Ticket Type Distribution
    const ticketDistribution = await Registration.aggregate([
      {
        $group: {
          _id: "$ticketType",
          count: { $sum: 1 }
        }
      }
    ]);

    return NextResponse.json({
      success: true,
      data: {
        revenueOverTime,
        registrationsOverTime,
        eventBreakdown: eventBreakdown.sort((a, b) => b.revenue - a.revenue),
        ticketDistribution
      }
    });
  } catch (error) {
    console.error("Super Analytics Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch analytics" }, { status: 500 });
  }
}
