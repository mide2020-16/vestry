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
  
  const ticketUrl = `${(process.env.NEXTAUTH_URL || "http://localhost:3000")}/success?ref=${registration.paystackReference}`;

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

export const sendUserDeclineNotification = async (registration: any) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP credentials missing. User notification skipped.");
    return;
  }
  
  const retryUrl = `${(process.env.NEXTAUTH_URL || "http://localhost:3000")}/checkout?ref=${registration.paystackReference}`;

  const mailOptions = {
    from: `"Vestry Events" <${process.env.SMTP_USER}>`,
    to: registration.email,
    subject: `Important: Problem with your Payment Receipt ⚠️`,
    html: `
      <h2>Action Required: Payment Proof Rejected</h2>
      <p>Hello ${registration.name},</p>
      <p>We reviewed your manual bank transfer receipt for <strong>₦${registration.totalAmount.toLocaleString()}</strong>, and unfortunately, we couldn't verify the transaction.</p>
      
      ${registration.declineReason ? `
      <div style="margin: 16px 0; padding: 16px; background-color: #FEE2E2; border-left: 4px solid #EF4444; color: #991B1B; border-radius: 8px;">
        <strong>Reason for rejection:</strong><br />
        "${registration.declineReason}"
      </div>
      ` : `
      <p>This usually happens if the image is unclear, the amount is incorrect, or the transaction hasn't been received in our bank yet.</p>
      `}

      <p><strong>But don't worry!</strong> Your registration details are still saved. You don't need to start over.</p>
      
      <div style="margin: 24px 0; padding: 20px; background-color: #FEF3C7; border-left: 4px solid #F59E0B; color: #92400E; border-radius: 8px;">
        <strong>What next?</strong><br />
        Please click the button below to go back to the checkout page and upload a fresh, clear receipt of your transfer.
      </div>

      <a href="${retryUrl}" style="display:inline-block;padding:12px 24px;background-color:#F59E0B;color:#000;text-decoration:none;font-weight:bold;border-radius:8px;margin-top:10px;">Retry Payment Upload</a>
      <br /><br />
      <p>Your Reference Number is: <strong>${registration.paystackReference}</strong></p>
      <hr />
      <p style="font-size: 12px; color: #666;">Vestry Automatic Notifications</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error("Failed to send decline email:", err);
  }
};

export const sendUserAbandonedNotification = async (registration: any) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP credentials missing. User notification skipped.");
    return;
  }
  
  const retryUrl = `${(process.env.NEXTAUTH_URL || "http://localhost:3000")}/register`;

  const mailOptions = {
    from: `"Vestry Events" <${process.env.SMTP_USER}>`,
    to: registration.email,
    subject: `Your Registration: Incomplete Transaction 🏮`,
    html: `
      <h2>Transaction Discontinued</h2>
      <p>Hello ${registration.name},</p>
      <p>We noticed an incomplete registration attempt for the Vestry Event under your email.</p>
      
      <div style="margin: 16px 0; padding: 16px; background-color: #F3F4F6; border-left: 4px solid #6B7280; color: #374151; border-radius: 8px;">
        <strong>Status:</strong> Abandoned / Discontinued Midway<br />
        <strong>Payment Method:</strong> ${registration.paymentMethod === "paystack" ? "Online Payment (Paystack)" : "Bank Transfer"}
      </div>

      <p>This usually happens if the payment window was closed before completion, the transaction timed out, or there was a momentary network interruption.</p>
      
      <p><strong>To ensure your spot is secured,</strong> we have cleared this pending attempt so you can try again fresh. Your early registration is important to us!</p>
      
      <a href="${retryUrl}" style="display:inline-block;padding:12px 24px;background-color:#F59E0B;color:#000;text-decoration:none;font-weight:bold;border-radius:8px;margin-top:10px;">Start New Registration</a>
      <br /><br />
      <p>If you encounter any issues, please reach out to our support team.</p>
      <hr />
      <p style="font-size: 12px; color: #666;">Vestry Automatic Notifications</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error("Failed to send abandoned notification email:", err);
  }
};
