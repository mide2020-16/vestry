/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Registration from "@/models/Registration";
import Event from "@/models/Event";
import { auth } from "@/auth";
import { sendUserApprovalNotification } from "@/lib/email";
import {
  GoogleGenerativeAI,
} from "@google/generative-ai";
import ActivityLog, { LogAction, UserType } from "@/models/AuditLog";
import User from "@/models/User";

interface AIVerificationResult {
  extractedAmount: number | null;
  extractedBank: string | null;
  extractedAccountName: string | null;
  amountSufficient: boolean;
  bankMatches: boolean;
  accountNameMatches: boolean;
  allMatch: boolean;
  confidence: "high" | "medium" | "low";
  reason: string;
}

interface ModelConfig {
  name: string;
  apiKey: string;
  maxRetries: number;
}

function aiLog(level: "info" | "warn" | "error", message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const prefix = `[ai-verify][${timestamp}]`;
  if (level === "error") console.error(`${prefix} ❌ ${message}`, data || "");
  else if (level === "warn") console.warn(`${prefix} ⚠️ ${message}`, data || "");
  else console.log(`${prefix} ℹ️ ${message}`, data || "");
}

let lastAICallTime = 0;
const MIN_CALL_INTERVAL_MS = 5000;

async function waitForCooldown() {
  const now = Date.now();
  const elapsed = now - lastAICallTime;
  if (elapsed < MIN_CALL_INTERVAL_MS) {
    await new Promise(r => setTimeout(r, MIN_CALL_INTERVAL_MS - elapsed));
  }
  lastAICallTime = Date.now();
}

function buildModelChain(): ModelConfig[] {
  const key1 = process.env.GOOGLE_GEMINI_API_KEY;
  if (!key1) throw new Error("No Gemini API key");
  return [{ name: "gemini-2.0-flash-exp", apiKey: key1, maxRetries: 3 }];
}

async function fetchReceiptAsBase64(url: string) {
  const res = await fetch(url);
  const contentType = res.headers.get("content-type") || "image/jpeg";
  const base64 = Buffer.from(await res.arrayBuffer()).toString("base64");
  return { base64, mimeType: contentType.split(";")[0] };
}

async function callAIWithRetry(imageData: any, prompt: string): Promise<AIVerificationResult> {
  await waitForCooldown();
  const config = buildModelChain()[0];
  const genAI = new GoogleGenerativeAI(config.apiKey);
  const model = genAI.getGenerativeModel({ model: config.name });

  const result = await model.generateContent([
    { inlineData: { mimeType: imageData.mimeType, data: imageData.base64 } },
    prompt,
  ]);
  const text = result.response.text();
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

async function approveRegistration(id: string) {
  const registration = await Registration.findByIdAndUpdate(id, { paymentStatus: true, status: "success" }, { new: true });
  if (registration) {
    await sendUserApprovalNotification(registration).catch(console.error);
  }
  return registration;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const isAiTrigger = body?.trigger === "ai";

  if (!isAiTrigger) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const registration = await approveRegistration(id);

    // Create Audit Log
    const dbUser = await User.findOne({ email: session.user?.email?.toLowerCase() }).lean() as any;
    if (dbUser) {
      await ActivityLog.create({
        userId: dbUser._id,
        userType: UserType.ADMIN,
        userName: dbUser.name,
        userEmail: dbUser.email,
        action: LogAction.APPROVE_PAYMENT,
        resource: "Registration",
        resourceId: id,
        details: `Manually approved registration for ${registration?.name}`,
        metadata: { amount: registration?.totalAmount }
      });
    }

    return NextResponse.json({ success: !!registration, registration });
  }

  try {
    const registration = await Registration.findById(id);
    if (!registration || registration.paymentMethod !== "transfer" || registration.status === "success") {
      return NextResponse.json({ error: "Invalid registration for AI" }, { status: 400 });
    }

    const event = await Event.findById(registration.eventId).lean() as any;
    if (!event) return NextResponse.json({ error: "Event context lost" }, { status: 404 });

    const { base64, mimeType } = await fetchReceiptAsBase64(registration.paymentReceiptUrl!);
    const bankName = event.config.bankName || process.env.BANK_NAME;
    const accountName = event.config.accountName || process.env.BANK_ACCOUNT_NAME;

    const prompt = `Verify payment receipt. Expected Bank: "${bankName}", Account: "${accountName}", Min Amount: ${registration.totalAmount}. Return JSON: {extractedAmount, extractedBank, extractedAccountName, amountSufficient, bankMatches, accountNameMatches, allMatch, confidence, reason}`;

    const aiResult = await callAIWithRetry({ base64, mimeType }, prompt);
    const shouldAutoApprove = aiResult.allMatch && aiResult.confidence !== "low";

    await Registration.findByIdAndUpdate(id, {
      $set: { aiVerificationResult: { ...aiResult, verified: shouldAutoApprove, verifiedAt: new Date() } }
    });

    if (shouldAutoApprove) {
      const registration = await approveRegistration(id);
      
      // System Activity Log for AI
      const systemAdmin = await User.findOne({ role: "SUPER_ADMIN" }).lean() as any;
      if (systemAdmin) {
        await ActivityLog.create({
          userId: systemAdmin._id,
          userType: UserType.SYSTEM,
          userName: "Gemini AI",
          action: LogAction.APPROVE_PAYMENT,
          resource: "Registration",
          resourceId: id,
          details: `AI Auto-approved registration for ${registration?.name}`,
          metadata: { aiResult, amount: registration?.totalAmount }
        });
      }

      return NextResponse.json({ success: true, autoApproved: true, details: aiResult });
    }

    return NextResponse.json({ success: true, autoApproved: false, details: aiResult });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}