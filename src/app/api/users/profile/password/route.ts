/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    const user = await User.findOne({ email: session.user.email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Check if user has a password (they might have signed up with Google only)
    if (!user.password) {
      // If no password, we allow setting one if they are signed in (they can't "current" it though)
      // But for security, if they only have Google, they should probably use Google.
      // Let's assume for now they have a password or we require one for this flow.
      return NextResponse.json({ success: false, error: "Account uses external login. Please use your provider to manage security." }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json({ success: false, error: "Incorrect current password" }, { status: 400 });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return NextResponse.json({ success: true, message: "Password updated" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update password" }, { status: 500 });
  }
}
