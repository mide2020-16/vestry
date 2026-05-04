import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      // For security, don't reveal if user exists
      return NextResponse.json({ success: true, message: "If an account exists, a reset link has been sent." });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Save to user (expire in 1 hour)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);
    await user.save();

    // Here you would normally send the email.
    // For now, we'll log it to the console (development)
    const resetUrl = `${process.env.NEXTAUTH_URL}/admin/reset-password/${resetToken}`;
    console.log("-----------------------------------------");
    console.log(`PASSWORD RESET REQUEST FOR: ${email}`);
    console.log(`URL: ${resetUrl}`);
    console.log("-----------------------------------------");

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to process request" }, { status: 500 });
  }
}
