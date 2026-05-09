/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User, { UserRole } from "@/models/User";
import bcrypt from "bcryptjs";
import { sendWelcomeVerificationEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase();
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists with this email" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email: emailLower,
      password: hashedPassword,
      role: UserRole.END_USER, // Updated role
      isVerified: false,
    });

    // Trigger Automated Email Confirmation (Fire and forget or wait)
    // We'll wait to ensure it works, but technically could be backgrounded
    try {
      await sendWelcomeVerificationEmail(user);
    } catch (emailErr) {
      console.error("[SIGNUP_EMAIL_ERROR]", emailErr);
      // Don't fail the signup if email fails, but log it
    }

    return NextResponse.json(
      { 
        message: "User created successfully", 
        user: { id: user._id, email: user.email, name: user.name } 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[SIGNUP_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
