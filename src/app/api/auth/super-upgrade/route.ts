/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User, { UserRole } from "@/models/User";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { email, secret } = await request.json();

    const masterSecret = process.env.SUPER_ADMIN_SECRET;

    if (!masterSecret) {
      return NextResponse.json(
        { error: "Super admin setup is not configured in environment" },
        { status: 500 }
      );
    }

    if (secret !== masterSecret) {
      return NextResponse.json(
        { error: "Invalid secret key" },
        { status: 403 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { error: "User not found. Please sign up first." },
        { status: 404 }
      );
    }

    user.role = UserRole.SUPER_ADMIN;
    await user.save();

    return NextResponse.json({
      success: true,
      message: `User ${email} has been promoted to SUPER_ADMIN successfully.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
