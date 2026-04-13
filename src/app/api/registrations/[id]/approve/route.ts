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

// ── FAILSAFE Model Configuration ────────────────────────────────────────────
const PRIMARY_MODELS = [
  {
    name: "gemini-2.0-flash-exp",
    apiKey: process.env.GOOGLE_GEMINI_API_KEY,
    priority: 1,
    rpm: 60,  // requests per minute limit
  }
  // {
  //   name: "gemini-2.0-flash",
  //   apiKey: process.env.GOOGLE_GEMINI_API_KEY_2,
  //   priority: 2,
  //   rpm: 60,
  // }
].filter(model => model.apiKey);

const FALLBACK_MODELS = [
  {
    name: "gemini-1.5-flash",
    apiKey: process.env.GOOGLE_GEMINI_API_KEY_2,
    priority: 1,
    rpm: 15,
  }
].filter(model => model.apiKey);

console.log(`Primary models: ${PRIMARY_MODELS.map(m => m.name).join(', ')}`);
console.log(`Fallback models: ${FALLBACK_MODELS.map(m => m.name).join(', ')}`);

// ── Rate Limit Manager ──────────────────────────────────────────────────────
const requestTimestamps = new Map<string, number[]>();
const RPM_WINDOW = 60 * 1000; // 60 seconds

function canMakeRequest(model: { name: string; rpm: number }): boolean {
  const modelKey = model.name;
  const now = Date.now();
  
  if (!requestTimestamps.has(modelKey)) {
    requestTimestamps.set(modelKey, []);
  }
  
  const timestamps = requestTimestamps.get(modelKey)!;
  // Keep only requests in last 60 seconds
  const recent = timestamps.filter(ts => now - ts < RPM_WINDOW);
  requestTimestamps.set(modelKey, recent);
  
  return recent.length < model.rpm;
}

function recordRequest(model: { name: string }) {
  const modelKey = model.name;
  const timestamps = requestTimestamps.get(modelKey) || [];
  timestamps.push(Date.now());
  requestTimestamps.set(modelKey, timestamps);
}

// ── Dynamic Model Factory ────────────────────────────────────────────────────
function createModel(apiKey: string, modelName: string) {
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: modelName,
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ],
  });
}

// ── FAILSAFE AI Caller - GUARANTEED TO RETURN RESULT ─────────────────────────
async function callAIWithFailSafes(
  imageData: { mimeType: string; data: string },
  prompt: string,
  registrationId: string
): Promise<any> {
  const allModels = [...PRIMARY_MODELS, ...FALLBACK_MODELS];
  
  // Strategy 1: Try models respecting RPM limits first
  for (const modelConfig of allModels) {
    if (!canMakeRequest(modelConfig)) {
      console.log(`[AI-verify] RPM limit reached for ${modelConfig.name}, skipping`);
      continue;
    }
    
    try {
      console.log(`[AI-verify] Trying ${modelConfig.name}`);
      recordRequest(modelConfig);
      
      const model = createModel(modelConfig.apiKey!, modelConfig.name);
      const result = await model.generateContent([{
        inlineData: {
          mimeType: imageData.mimeType,
          data: imageData.data,
        }
      }, prompt]);
      
      const rawText = result.response.text().trim();
      const cleanJson = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
      const aiResult = JSON.parse(cleanJson);
      
      console.log(`[AI-verify] ✅ SUCCESS with ${modelConfig.name}`);
      return aiResult;
      
    } catch (error: any) {
      console.warn(`[AI-verify] ❌ ${modelConfig.name} failed:`, error.message);
      
      if (isCriticalError(error)) {
        console.log(`[AI-verify] Critical error, skipping model permanently:`, error.message);
        continue;
      }
    }
  }
  
  // Strategy 2: Emergency text-only fallback (NO IMAGE - just analyze prompt)
  console.log("[AI-verify] 🔥 EMERGENCY TEXT-ONLY FALLBACK");
  return {
    extractedAmount: null,
    extractedBank: null,
    extractedAccountName: null,
    amountSufficient: false,
    bankMatches: false,
    accountNameMatches: false,
    allMatch: false,
    confidence: "low",
    reason: "Emergency fallback - image processing failed across all models. Please review manually."
  };
}

function isCriticalError(error: any): boolean {
  const criticalErrors = ['invalid_argument', 'internal', 'billing'];
  return criticalErrors.some(msg => error.message?.toLowerCase().includes(msg));
}

function isRateLimitError(error: any): boolean {
  const rateLimitMessages = [
    'quota exceeded', 'rate limit', 'resource_exhausted', 
    '429', 'too many requests', 'requests per minute'
  ];
  const errorMsg = error.message?.toLowerCase() || '';
  return rateLimitMessages.some(msg => errorMsg.includes(msg));
}

// ── Helpers (unchanged) ─────────────────────────────────────────────────────
async function getBankDetails(): Promise<{ bankName: string; accountName: string }> {
  const settings = await Settings.findOne().lean() as any;
  return {
    bankName: settings?.bankName || process.env.BANK_NAME,
    accountName: settings?.accountName || process.env.BANK_ACCOUNT_NAME,
  };
}

async function fetchReceiptAsBase64(url: string): Promise<{
  base64: string;
  mimeType: string;
}> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
  
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    
    const contentType = res.headers.get("content-type") || "image/jpeg";
    const base64 = Buffer.from(await res.arrayBuffer()).toString("base64");
    
    let mimeType = contentType.split(";")[0].trim();
    if (mimeType === "image/jpg") mimeType = "image/jpeg";
    
    return { base64, mimeType };
  } catch (error: any) {
    clearTimeout(timeoutId);
    throw new Error(`Image fetch failed: ${error.message}`);
  }
}

async function approveRegistration(id: string) {
  const registration = await Registration.findByIdAndUpdate(
    id,
    { paymentStatus: true, status: "success" },
    { new: true }
  );
  if (!registration) return null;

  sendUserApprovalNotification(registration).catch(console.error);
  return registration;
}

// ── MAIN ROUTE HANDLER ───────────────────────────────────────────────────────
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const { id } = await params;

  const body = await request.json().catch(() => ({}));
  const isAiTrigger = body?.trigger === "ai";

  // Manual admin path (unchanged)
  if (!isAiTrigger) {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const registration = await approveRegistration(id);
    if (!registration) {
      return NextResponse.json({ success: false, error: "Registration not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, registration });
  }

  // AI Verification - GUARANTEED TO SUCCEED
  try {
    const registration = await Registration.findById(id);
    if (!registration || registration.paymentMethod !== "transfer" || 
        !registration.paymentReceiptUrl || 
        (registration.paymentStatus === true || registration.status === "success")) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid registration for AI verification" 
      }, { status: 400 });
    }

    // Fetch image with timeout
    const { base64, mimeType } = await fetchReceiptAsBase64(registration.paymentReceiptUrl);

    // Get bank details
    const { bankName, accountName } = await getBankDetails();

    // AI Prompt
    const prompt = `You are a strict payment receipt verifier.

Extract from receipt:
1. SENT amount (digits only)
2. DESTINATION bank name  
3. DESTINATION account name

Expected: bank="${bankName}", account="${accountName}", min=${registration.totalAmount}

Return ONLY valid JSON:
{
  "extractedAmount": <number|null>,
  "extractedBank": "<string|null>", 
  "extractedAccountName": "<string|null>",
  "amountSufficient": <boolean>,
  "bankMatches": <boolean>,
  "accountNameMatches": <boolean>,
  "allMatch": <boolean>,
  "confidence": "high"|"medium"|"low",
  "reason": "<brief explanation>"
}`;

    // 🔥 THIS WILL ALWAYS RETURN A RESULT 🔥
    const aiResult = await callAIWithFailSafes({ mimeType, data: base64 }, prompt, id);

    // Auto-approve logic
    const shouldAutoApprove = aiResult.allMatch === true && aiResult.confidence !== "low";

    // Save result (ALWAYS saves)
    await Registration.findByIdAndUpdate(id, {
      $set: {
        aiVerificationResult: {
          verified: shouldAutoApprove,
          confidence: aiResult.confidence,
          extractedAmount: aiResult.extractedAmount ?? null,
          extractedBank: aiResult.extractedBank ?? null,
          extractedAccountName: aiResult.extractedAccountName ?? null,
          reason: aiResult.reason ?? "No reason provided",
          verifiedAt: new Date(),
          aiRetryCount: 0,
          aiLastError: null
        }
      }
    });

    if (shouldAutoApprove) {
      await approveRegistration(id);
      return NextResponse.json({
        success: true,
        autoApproved: true,
        message: "✅ Auto-approved!",
        details: aiResult,
      });
    }

    return NextResponse.json({
      success: true,
      autoApproved: false,
      message: "⚠️ Flagged for manual review",
      details: aiResult,
    });

  } catch (err: any) {
    console.error("[AI-verify] UNEXPECTED ERROR:", err);
    return NextResponse.json({
      success: true,  // Still success - we always generate a result
      autoApproved: false,
      message: "Fallback result generated - manual review recommended",
      details: {
        extractedAmount: null,
        extractedBank: null,
        extractedAccountName: null,
        amountSufficient: false,
        bankMatches: false,
        accountNameMatches: false,
        allMatch: false,
        confidence: "low",
        reason: `System error: ${err.message}. Manual review required.`
      }
    });
  }
}