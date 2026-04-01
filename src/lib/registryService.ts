/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import nodemailer from "nodemailer";
import dbConnect from "@/lib/dbConnect";
import Registration from "@/models/Registration";
import { RegistrationPDF } from "@/components/admin/RegistrationPDF";

export async function fetchConfirmedRegistrations() {
  await dbConnect();
  return Registration.find({ paymentStatus: true })
    .populate("meshSelection", "name")
    .sort({ createdAt: -1 })
    .lean();
}

export async function generateRegistryBuffer(registrations: any[]) {
  const pdfElement = React.createElement(RegistrationPDF, { 
    registrations: registrations as any 
  }) as any;
  
  return await renderToBuffer(pdfElement);
}

export async function sendRegistryEmail(pdfBuffer: Buffer, count: number) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.ADMIN_EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });

  const dateTag = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");

  return transporter.sendMail({
    from: `"Vestry System" <${process.env.ADMIN_EMAIL}>`,
    to: process.env.ADMIN_RECEIVER_EMAIL,
    subject: `Official Registry: Vestry 2026 (${count} Guests)`,
    text: `Attached is the registration list for Vestry 2026.\nTotal: ${count}\nDate: ${dateTag}`,
    attachments: [
      {
        filename: `Vestry_Registry_${dateTag}.pdf`,
        content: pdfBuffer,
      },
    ],
  });
}