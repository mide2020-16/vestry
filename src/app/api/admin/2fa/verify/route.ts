import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { verifyTOTP } from "@/lib/totp";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const { code } = await request.json();
    
    const user = await User.findById(session.user.id);
    if (!user || !user.twoFactorSecret) {
      return NextResponse.json({ success: false, error: "Setup 2FA first" }, { status: 400 });
    }

    const isValid = verifyTOTP(code, user.twoFactorSecret);

    if (!isValid) {
      return NextResponse.json({ success: false, error: "Invalid verification code" }, { status: 400 });
    }

    user.twoFactorEnabled = true;
    await user.save();

    return NextResponse.json({ success: true, message: "2FA enabled successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to verify 2FA" }, { status: 500 });
  }
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    await User.findByIdAndUpdate(session.user.id, {
      twoFactorEnabled: false,
      twoFactorSecret: undefined
    });

    return NextResponse.json({ success: true, message: "2FA disabled" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to disable 2FA" }, { status: 500 });
  }
}
