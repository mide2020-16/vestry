import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    return NextResponse.json({ 
      success: true, 
      twoFactorEnabled: user?.twoFactorEnabled || false 
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to check 2FA status" }, { status: 500 });
  }
}
