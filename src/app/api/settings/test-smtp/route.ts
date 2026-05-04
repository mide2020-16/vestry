/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { auth } from "@/auth";

export async function POST(request: Request) {
  const session = await auth();
  if (!session || !session.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const User = (await import("@/models/User")).default;
    const dbUser = await User.findOne({ email: session.user.email?.toLowerCase() }).lean() as any;

    if (!dbUser || (dbUser.role !== "SUPER_ADMIN" && dbUser.role !== "EVENT_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { smtp } = await request.json();

    if (!smtp.host || !smtp.user || !smtp.pass) {
      return NextResponse.json({ success: false, error: "Missing SMTP configuration" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.port === 465,
      auth: {
        user: smtp.user,
        pass: smtp.pass,
      },
    });

    // Verify connection
    await transporter.verify();

    // Send a test email
    await transporter.sendMail({
      from: `"${smtp.fromName}" <${smtp.fromEmail}>`,
      to: smtp.user, // Send to self
      subject: "Vestry SMTP Test",
      text: "If you received this, your SMTP configuration is correct! 🎉",
    });

    return NextResponse.json({ success: true, message: "SMTP verified and test email sent!" });
  } catch (error: any) {
    console.error("SMTP Test Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
