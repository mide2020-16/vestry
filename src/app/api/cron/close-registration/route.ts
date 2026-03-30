/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import nodemailer from "nodemailer";
import dbConnect from "@/lib/dbConnect";
import Registration from "@/models/Registration";
import { RegistrationPDF } from "@/components/admin/RegistrationPDF";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();

  if (!session || (session.user as any).role !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    const registrations = await Registration.find({ paymentStatus: true })
      .populate("meshSelection", "name")
      .sort({ createdAt: -1 })
      .lean();

    if (!registrations || registrations.length === 0) {
      return Response.json(
        {
          success: false,
          error: "No confirmed registrations found to report.",
        },
        { status: 404 },
      );
    }

    // ✅ FIXED: Cast the element to 'any' to resolve the DocumentProps mismatch
    const pdfElement = React.createElement(RegistrationPDF, {
      registrations: registrations as any,
    }) as any;

    const pdfBuffer = await renderToBuffer(pdfElement);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    const dateTag = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");

    await transporter.sendMail({
      from: `"Vestry System" <${process.env.ADMIN_EMAIL}>`,
      to: process.env.ADMIN_RECEIVER_EMAIL,
      subject: `Official Registry: Vestry 2026 (${registrations.length} Guests)`,
      text: `Please find the attached final registration list for Vestry 2026.\n\nTotal confirmed guests: ${registrations.length}\nGenerated on: ${dateTag}`,
      attachments: [
        {
          filename: `Vestry_Registry_${dateTag}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    return Response.json({
      success: true,
      message: "Registry report emailed successfully",
    });
  } catch (error: any) {
    console.error("Email Report Error:", error);
    return Response.json(
      {
        success: false,
        error: error.message || "Internal server error during PDF generation",
      },
      { status: 500 },
    );
  }
}
