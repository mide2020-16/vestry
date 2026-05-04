import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { generateTOTPSecret, getOTPAuthURL } from "@/lib/totp";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const user = await User.findById(session.user.id);
    if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

    // Generate secret if not exists or requested
    const secret = generateTOTPSecret();
    const otpauth = getOTPAuthURL(user.email, "Vestry Admin", secret);

    // Save temporary secret (don't enable yet)
    user.twoFactorSecret = secret;
    await user.save();

    return NextResponse.json({ success: true, secret, otpauth });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to setup 2FA" }, { status: 500 });
  }
}
