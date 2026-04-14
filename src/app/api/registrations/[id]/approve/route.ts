/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Registration from "@/models/Registration";
import Settings from "@/models/Settings";
import { auth } from "@/auth";
import { sendUserApprovalNotification } from "@/lib/email";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// Logging helper — structured, timestamped console logs
// ─────────────────────────────────────────────────────────────────────────────
function aiLog(level: "info" | "warn" | "error", message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const prefix = `[ai-verify][${timestamp}]`;
  
  switch (level) {
    case "info":
      console.log(`${prefix} ℹ️ ${message}`, data !== undefined ? data : "");
      break;
    case "warn":
      console.warn(`${prefix} ⚠️ ${message}`, data !== undefined ? data : "");
      break;
    case "error":
      console.error(`${prefix} ❌ ${message}`, data !== undefined ? data : "");
      break;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Rate-limit cooldown — prevents hammering the API when multiple
// registrations come in rapid succession
// ─────────────────────────────────────────────────────────────────────────────
let lastAICallTime = 0;
const MIN_CALL_INTERVAL_MS = 5000; // 5 seconds between calls

async function waitForCooldown() {
  const now = Date.now();
  const elapsed = now - lastAICallTime;
  if (elapsed < MIN_CALL_INTERVAL_MS) {
    const waitTime = MIN_CALL_INTERVAL_MS - elapsed;
    aiLog("info", `Cooldown: waiting ${waitTime}ms before next AI call`);
    await sleep(waitTime);
  }
  lastAICallTime = Date.now();
}

// ─────────────────────────────────────────────────────────────────────────────
// Model chain — try faster model first, fall back to more available one
// ─────────────────────────────────────────────────────────────────────────────
function buildModelChain(): ModelConfig[] {
  const key1 = process.env.GOOGLE_GEMINI_API_KEY;
  const key2 = process.env.GOOGLE_GEMINI_API_KEY_2;

  const chain: ModelConfig[] = [];

  if (key1) {
    chain.push({ name: "gemini-2.0-flash-exp", apiKey: key1, maxRetries: 3 });
  }
  if (key2) {
    chain.push({ name: "gemini-1.5-flash", apiKey: key2, maxRetries: 3 });
  } else if (key1) {
    chain.push({ name: "gemini-1.5-flash", apiKey: key1, maxRetries: 2 });
  }

  if (chain.length === 0) {
    throw new Error("No Gemini API key configured. Set GOOGLE_GEMINI_API_KEY.");
  }

  aiLog("info", `Model chain built: ${chain.map(c => c.name).join(" → ")}`);
  return chain;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRateLimitError(error: any): boolean {
  const msg = (error?.message || "").toLowerCase();
  return (
    msg.includes("429") ||
    msg.includes("quota") ||
    msg.includes("rate limit") ||
    msg.includes("resource_exhausted") ||
    msg.includes("too many requests") ||
    msg.includes("requests per minute")
  );
}

function isFatalError(error: any): boolean {
  const msg = (error?.message || "").toLowerCase();
  return (
    msg.includes("api_key") ||
    msg.includes("invalid_argument") ||
    msg.includes("billing") ||
    msg.includes("permission_denied") ||
    msg.includes("unsupported_user_location")
  );
}

function createGeminiModel(config: ModelConfig) {
  const genAI = new GoogleGenerativeAI(config.apiKey);
  return genAI.getGenerativeModel({
    model: config.name,
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
    ],
  });
}

function parseAIResponse(rawText: string): AIVerificationResult {
  const clean = rawText
    .replace(/^```(?:json)?\s*/im, "")
    .replace(/\s*```\s*$/m, "")
    .trim();

  const jsonMatch = clean.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`No JSON object found in response: ${rawText.slice(0, 200)}`);
  }

  const parsed = JSON.parse(jsonMatch[0]);

  const required = [
    "extractedAmount",
    "extractedBank",
    "extractedAccountName",
    "amountSufficient",
    "bankMatches",
    "accountNameMatches",
    "allMatch",
    "confidence",
    "reason",
  ];

  for (const field of required) {
    if (!(field in parsed)) {
      throw new Error(`Missing required field "${field}" in AI response`);
    }
  }

  return {
    extractedAmount:
      parsed.extractedAmount != null ? Number(parsed.extractedAmount) : null,
    extractedBank: parsed.extractedBank ?? null,
    extractedAccountName: parsed.extractedAccountName ?? null,
    amountSufficient: Boolean(parsed.amountSufficient),
    bankMatches: Boolean(parsed.bankMatches),
    accountNameMatches: Boolean(parsed.accountNameMatches),
    allMatch: Boolean(parsed.allMatch),
    confidence: ["high", "medium", "low"].includes(parsed.confidence)
      ? parsed.confidence
      : "low",
    reason: String(parsed.reason || "No reason provided"),
  };
}

async function getBankDetails(): Promise<{
  bankName: string;
  accountName: string;
}> {
  const settings = (await Settings.findOne().lean()) as any;

  const bankName =
    settings?.bankName ||
    process.env.BANK_NAME;

  const accountName =
    settings?.accountName ||
    process.env.BANK_ACCOUNT_NAME;

  if (!bankName || !accountName) {
    throw new Error(
      "Bank details not configured. Set BANK_NAME and BANK_ACCOUNT_NAME in env, " +
      "or add them to your Settings document in the database."
    );
  }

  aiLog("info", "Bank details loaded", { bankName, accountName });
  return { bankName, accountName };
}

async function fetchReceiptAsBase64(url: string): Promise<{
  base64: string;
  mimeType: string;
}> {
  aiLog("info", `Fetching receipt from: ${url}`);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30_000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} fetching receipt: ${res.statusText}`);
    }

    const contentType = res.headers.get("content-type") || "image/jpeg";
    const base64 = Buffer.from(await res.arrayBuffer()).toString("base64");

    let mimeType = contentType.split(";")[0].trim();
    if (mimeType === "image/jpg") mimeType = "image/jpeg";

    aiLog("info", `Receipt fetched — ${(base64.length * 0.75 / 1024).toFixed(1)}KB, type: ${mimeType}`);
    return { base64, mimeType };
  } catch (err: any) {
    clearTimeout(timeoutId);
    throw new Error(`Failed to fetch receipt: ${err.message}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Core AI caller — retries with exponential backoff, then moves to next model
// ─────────────────────────────────────────────────────────────────────────────
async function callAIWithRetry(
  imageData: { mimeType: string; data: string },
  prompt: string
): Promise<AIVerificationResult> {
  // Wait for cooldown before making any AI call
  await waitForCooldown();

  const modelChain = buildModelChain();
  const overallStart = Date.now();
  const OVERALL_TIMEOUT_MS = 60_000; // 60 second overall timeout

  for (const config of modelChain) {
    const model = createGeminiModel(config);
    let lastError: any = null;

    for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
      // Check overall timeout
      if (Date.now() - overallStart > OVERALL_TIMEOUT_MS) {
        aiLog("error", `Overall timeout exceeded (${OVERALL_TIMEOUT_MS}ms). Aborting.`);
        break;
      }

      try {
        aiLog("info", `Calling ${config.name} — attempt ${attempt}/${config.maxRetries}`);
        const callStart = Date.now();

        const result = await model.generateContent([
          { inlineData: { mimeType: imageData.mimeType, data: imageData.data } },
          prompt,
        ]);

        const rawText = result.response.text().trim();
        const callDuration = Date.now() - callStart;

        if (!rawText) {
          throw new Error("Gemini returned an empty response");
        }

        aiLog("info", `${config.name} responded in ${callDuration}ms (${rawText.length} chars)`);

        const parsed = parseAIResponse(rawText);

        aiLog("info", `✅ ${config.name} verification complete`, {
          extractedAmount: parsed.extractedAmount,
          extractedBank: parsed.extractedBank,
          extractedAccountName: parsed.extractedAccountName,
          amountSufficient: parsed.amountSufficient,
          bankMatches: parsed.bankMatches,
          accountNameMatches: parsed.accountNameMatches,
          allMatch: parsed.allMatch,
          confidence: parsed.confidence,
          reason: parsed.reason,
          duration: `${callDuration}ms`,
        });

        return parsed;

      } catch (err: any) {
        lastError = err;

        if (isFatalError(err)) {
          aiLog("error", `Fatal error on ${config.name} — skipping model`, {
            error: err.message,
          });
          break;
        }

        if (isRateLimitError(err)) {
          if (attempt < config.maxRetries) {
            // Exponential backoff: 3s → 6s → 12s
            const backoff = Math.pow(2, attempt) * 1500;
            aiLog("warn", `Rate limited on ${config.name}. Backing off ${backoff}ms before retry ${attempt + 1}`, {
              error: err.message,
            });
            await sleep(backoff);
            continue;
          }
          aiLog("warn", `${config.name} rate limit exhausted after ${config.maxRetries} attempts. Moving to next model.`);
          break;
        }

        if (err.message?.includes("No JSON object found") ||
            err.message?.includes("Missing required field")) {
          if (attempt < config.maxRetries) {
            aiLog("warn", `Parse error on ${config.name}, retrying in 1s`, {
              error: err.message,
            });
            await sleep(1000);
            continue;
          }
          break;
        }

        // Unknown error
        if (attempt < config.maxRetries) {
          aiLog("warn", `Unknown error on ${config.name}, retrying in 1.5s`, {
            error: err.message,
          });
          await sleep(1500);
          continue;
        }
        break;
      }
    }

    aiLog("warn", `${config.name} exhausted`, {
      lastError: lastError?.message,
    });
  }

  // Every model failed
  const totalDuration = Date.now() - overallStart;
  aiLog("error", `All models exhausted after ${totalDuration}ms. Returning manual-review result.`);
  
  return {
    extractedAmount: null,
    extractedBank: null,
    extractedAccountName: null,
    amountSufficient: false,
    bankMatches: false,
    accountNameMatches: false,
    allMatch: false,
    confidence: "low",
    reason:
      "Automated verification unavailable — all AI models failed or are rate limited. " +
      "Please review this receipt manually.",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared approval logic
// ─────────────────────────────────────────────────────────────────────────────
async function approveRegistration(id: string) {
  const registration = await Registration.findByIdAndUpdate(
    id,
    { paymentStatus: true, status: "success" },
    { new: true }
  );
  if (!registration) return null;
  aiLog("info", `Registration ${id} approved — sending email to ${registration.email}`);
  sendUserApprovalNotification(registration).catch((err) => {
    aiLog("error", `Failed to send approval email for ${id}`, { error: err.message });
  });
  return registration;
}

// ─────────────────────────────────────────────────────────────────────────────
// Route handler
// ─────────────────────────────────────────────────────────────────────────────
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const { id } = await params;

  const body = await request.json().catch(() => ({}));
  const isAiTrigger = body?.trigger === "ai";

  // ── Manual admin path ──────────────────────────────────────────────────────
  if (!isAiTrigger) {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    aiLog("info", `Manual admin approval for registration ${id}`);
    const registration = await approveRegistration(id);
    if (!registration) {
      return NextResponse.json(
        { success: false, error: "Registration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, registration });
  }

  // ── AI verification path ───────────────────────────────────────────────────
  aiLog("info", `AI verification triggered for registration ${id}`);

  try {
    const registration = await Registration.findById(id);

    if (!registration) {
      aiLog("error", `Registration ${id} not found`);
      return NextResponse.json(
        { success: false, error: "Registration not found" },
        { status: 404 }
      );
    }
    if (registration.paymentMethod !== "transfer") {
      aiLog("warn", `Registration ${id} is not a transfer payment — skipping AI`);
      return NextResponse.json(
        { success: false, error: "Not a transfer payment" },
        { status: 400 }
      );
    }
    if (registration.paymentStatus === true || registration.status === "success") {
      aiLog("info", `Registration ${id} already approved — skipping AI`);
      return NextResponse.json(
        { success: false, error: "Registration already approved" },
        { status: 400 }
      );
    }
    if (!registration.paymentReceiptUrl) {
      aiLog("warn", `Registration ${id} has no receipt URL`);
      return NextResponse.json(
        { success: false, error: "No receipt URL on this registration" },
        { status: 400 }
      );
    }

    aiLog("info", `Processing receipt for ${registration.name} (₦${registration.totalAmount})`, {
      registrationId: id,
      email: registration.email,
      receiptUrl: registration.paymentReceiptUrl,
    });

    // Fetch image + bank details in parallel
    const [{ base64, mimeType }, { bankName, accountName }] = await Promise.all([
      fetchReceiptAsBase64(registration.paymentReceiptUrl),
      getBankDetails(),
    ]);

    const prompt = `You are a strict payment receipt verifier for an event registration system.

Carefully read this receipt image and extract exactly three values:
1. The total amount that was SENT / transferred (digits only, no currency symbol, no commas)
2. The DESTINATION bank name (the bank that received the money)
3. The DESTINATION account name (the person or business that received the money)

Then compare against these expected values:
- Expected bank: "${bankName}"
- Expected account name: "${accountName}"
- Minimum required amount: ${registration.totalAmount}

Rules:
- amountSufficient: true if extractedAmount is a number AND >= ${registration.totalAmount}
- bankMatches: true if the bank name on the receipt matches closely (abbreviations OK, e.g. "GT" or "GT Bank" = "GTBank")
- accountNameMatches: true if account name matches closely — ignore case, allow minor spelling differences
- allMatch: true ONLY if ALL THREE checks pass
- confidence: "high" if all text clearly legible; "medium" if slightly unclear; "low" if blurry, corrupt, or key fields unreadable
- If you cannot read a field, set it to null and set confidence to "low"

Respond with ONLY a valid JSON object — no markdown fences, no explanation before or after:
{
  "extractedAmount": <number or null>,
  "extractedBank": "<string or null>",
  "extractedAccountName": "<string or null>",
  "amountSufficient": <boolean>,
  "bankMatches": <boolean>,
  "accountNameMatches": <boolean>,
  "allMatch": <boolean>,
  "confidence": "high" | "medium" | "low",
  "reason": "<one clear sentence: what passed or exactly what failed>"
}`;

    const aiResult = await callAIWithRetry({ mimeType, data: base64 }, prompt);

    const shouldAutoApprove =
      aiResult.allMatch === true && aiResult.confidence !== "low";

    aiLog("info", `AI decision for ${id}: ${shouldAutoApprove ? "AUTO-APPROVE" : "FLAG FOR REVIEW"}`, {
      allMatch: aiResult.allMatch,
      confidence: aiResult.confidence,
      reason: aiResult.reason,
    });

    // Persist AI result regardless of outcome
    await Registration.findByIdAndUpdate(id, {
      $set: {
        aiVerificationResult: {
          verified: shouldAutoApprove,
          confidence: aiResult.confidence,
          extractedAmount: aiResult.extractedAmount,
          extractedBank: aiResult.extractedBank,
          extractedAccountName: aiResult.extractedAccountName,
          reason: aiResult.reason,
          verifiedAt: new Date(),
        },
      },
    });

    if (shouldAutoApprove) {
      await approveRegistration(id);

      aiLog("info", `✅ Registration ${id} AUTO-APPROVED successfully`);
      return NextResponse.json({
        success: true,
        autoApproved: true,
        message: "Receipt verified and registration auto-approved",
        details: aiResult,
      });
    }

    aiLog("info", `⏳ Registration ${id} flagged for manual review`);
    return NextResponse.json({
      success: true,
      autoApproved: false,
      message: "Receipt could not be auto-verified — flagged for admin review",
      details: aiResult,
    });

  } catch (err: any) {
    aiLog("error", `Unexpected error for registration ${id}`, {
      error: err.message,
      stack: err.stack?.split("\n").slice(0, 3).join("\n"),
    });

    // Still save a fallback result so admin sees it in the dashboard
    await Registration.findByIdAndUpdate(id, {
      $set: {
        aiVerificationResult: {
          verified: false,
          confidence: "low",
          reason: `System error during verification: ${err.message}. Manual review required.`,
          verifiedAt: new Date(),
        },
      },
    }).catch(() => {});

    return NextResponse.json(
      {
        success: false,
        autoApproved: false,
        error: "Verification system error — registration flagged for manual review",
      },
      { status: 500 }
    );
  }
}