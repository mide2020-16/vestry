/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendAdminTransferNotification = async (registration: any) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP credentials missing. Admin notification skipped.");
    return;
  }
  
  const mailOptions = {
    from: `"Vestry Notifications" <${process.env.SMTP_USER}>`,
    to: process.env.SMTP_USER, // Admin receives it on the same configured email
    subject: `New Manual Transfer: ${registration.name}`,
    html: `
      <h2>New Manual Transfer Pending</h2>
      <p><strong>Name:</strong> ${registration.name}</p>
      <p><strong>Email:</strong> ${registration.email}</p>
      <p><strong>Amount:</strong> ₦${registration.totalAmount.toLocaleString()}</p>
      <p><strong>Reference:</strong> ${registration.paystackReference}</p>
      <hr />
      <p>Please log in to your admin dashboard to review the uploaded receipt and approve the transaction.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error("Failed to send admin email:", err);
  }
};

export const sendUserApprovalNotification = async (registration: any) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP credentials missing. User notification skipped.");
    return;
  }
  
  const ticketUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/success?ref=${registration.paystackReference}`;

  const mailOptions = {
    from: `"Vestry Events" <${process.env.SMTP_USER}>`,
    to: registration.email,
    subject: `Your Vestry Ticket is Approved! 🎉`,
    html: `
      <h2>Payment Verified 🎊</h2>
      <p>Hello ${registration.name},</p>
      <p>Your manual bank transfer of <strong>₦${registration.totalAmount.toLocaleString()}</strong> has been reviewed and successfully approved by our team.</p>
      <p>Your spot is fully secured!</p>
      <a href="${ticketUrl}" style="display:inline-block;padding:12px 24px;background-color:#F59E0B;color:#000;text-decoration:none;font-weight:bold;border-radius:8px;margin-top:10px;">Download Your Ticket</a>
      <br /><br />
      <p>Your Reference Number is: <strong>${registration.paystackReference}</strong></p>
      <hr />
      <p style="font-size: 12px; color: #666;">Vestry Automatic Notifications</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error("Failed to send user email:", err);
  }
};
