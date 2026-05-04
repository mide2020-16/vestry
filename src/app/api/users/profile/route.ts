/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await User.findOne({ email: session.user.email.toLowerCase() })
      .populate("managedEvents", "name slug date status")
      .lean() as any;

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Don't return password
    const { password, ...safeUser } = user;
    return NextResponse.json({ success: true, data: safeUser });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const body = await request.json();
    const { name, email, bio, phone, preferences, image } = body;

    const user = await User.findOne({ email: session.user.email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (typeof bio !== "undefined") user.bio = bio;
    if (typeof phone !== "undefined") user.phone = phone;
    if (typeof image !== "undefined") user.image = image;
    if (preferences) {
      user.preferences = {
        ...user.preferences,
        ...preferences,
      };
    }

    await user.save();
    const { password, ...safeUser } = user.toObject();
    return NextResponse.json({ success: true, data: safeUser });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: "Email already in use" }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Failed to update profile" }, { status: 500 });
  }
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const user = await User.findOne({ email: session.user.email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    await User.findByIdAndDelete(user._id);
    return NextResponse.json({ success: true, message: "Account deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete account" }, { status: 500 });
  }
}
