/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Event from "@/models/Event";
import Registration from "@/models/Registration";
import Product from "@/models/Product";
import Settings from "@/models/Settings";
import User, { UserRole } from "@/models/User";

export async function GET() {
  try {
    await dbConnect();

    // 1. Create/Get Default Event
    let defaultEvent = await Event.findOne({ slug: "default-001" });
    const settings = await Settings.findOne();

    if (!defaultEvent) {
      defaultEvent = await Event.create({
        name: settings?.tenureName || "Default Event",
        slug: "default-001",
        status: "OPEN",
        config: {
          tenureName: settings?.tenureName || "Default Event",
          singlePrice: settings?.singlePrice || 0,
          couplePrice: settings?.couplePrice || 0,
          meshSinglePrice: settings?.meshSinglePrice || 0,
          meshCouplePrice: settings?.meshCouplePrice || 0,
          paystackPublicKey: settings?.paystackPublicKey || "",
          paystackSecretKey: settings?.paystackSecretKey || "",
          logoUrl: settings?.logoUrl || "",
          meshColors: settings?.meshColors || [],
          meshSizes: settings?.meshSizes || [],
          bankName: settings?.bankName || "",
          accountName: settings?.accountName || "",
          accountNumber: settings?.accountNumber || "",
          paystackEnabled: settings?.paystackEnabled ?? true,
          bankTransferEnabled: settings?.bankTransferEnabled ?? true,
        },
      });
    }

    const eventId = defaultEvent._id;

    // 2. Migrate Registrations
    const regResult = await Registration.updateMany(
      { eventId: { $exists: false } },
      { $set: { eventId: eventId } }
    );

    // 3. Migrate Products
    const prodResult = await Product.updateMany(
      { eventId: { $exists: false } },
      { $set: { eventId: eventId } }
    );

    // 4. Migrate Admins (from Env)
    const allowedEmails = (process.env.ALLOWED_ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    for (const email of allowedEmails) {
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        await User.create({
          name: "Super Admin",
          email: email,
          role: UserRole.SUPER_ADMIN,
          managedEvents: [eventId],
        });
      } else if (existingUser.role !== UserRole.SUPER_ADMIN) {
        existingUser.role = UserRole.SUPER_ADMIN;
        if (!existingUser.managedEvents.includes(eventId)) {
          existingUser.managedEvents.push(eventId);
        }
        await existingUser.save();
      }
    }

    return NextResponse.json({
      success: true,
      message: "Migration completed",
      details: {
        registrationsUpdated: regResult.modifiedCount,
        productsUpdated: prodResult.modifiedCount,
        defaultEvent: defaultEvent.name,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
