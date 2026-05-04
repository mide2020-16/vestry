/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User, { UserRole } from "@/models/User";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import ActivityLog, { LogAction, UserType } from "@/models/AuditLog";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any).role !== UserRole.SUPER_ADMIN) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const users = await User.find().select("-password").populate("managedEvents", "name slug").lean();
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session || (session.user as any).role !== UserRole.SUPER_ADMIN) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const body = await request.json();
    const { name, email, password, role, managedEvents } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || UserRole.USER,
      managedEvents: managedEvents || []
    });

    const { password: _, ...userWithoutPassword } = user.toObject();

    // Create Activity Log
    const creator = await User.findOne({ email: session.user?.email?.toLowerCase() }).lean() as any;
    if (creator) {
      await ActivityLog.create({
        userId: creator._id,
        userType: UserType.ADMIN,
        userName: creator.name,
        userEmail: creator.email,
        action: LogAction.CREATE,
        resource: "User",
        resourceId: user._id,
        details: `Created new admin: ${name} (${email}) with role ${role}`,
        metadata: { role, email }
      });
    }

    return NextResponse.json({ success: true, data: userWithoutPassword }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: "Email already exists" }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Failed to create user" }, { status: 500 });
  }
}
