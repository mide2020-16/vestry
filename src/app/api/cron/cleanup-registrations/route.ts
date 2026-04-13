import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Registration from "@/models/Registration";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Vercel automatically sends: Authorization: Bearer <CRON_SECRET>
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    const threeDaysAgo = new Date(Date.now() -  3 * 24 * 60 * 60 * 1000);

    const result = await Registration.deleteMany({
      paymentMethod: "transfer",
      status: { $in: ["pending", "declined"] },
      createdAt: { $lt: threeDaysAgo },
    });

    console.log(`[cron] Deleted ${result.deletedCount} stale registrations`);

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
      cutoffDate: threeDaysAgo.toISOString(),
    });
  } catch (err) {
    console.error("[cron/cleanup]", err);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}