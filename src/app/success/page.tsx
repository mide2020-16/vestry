"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Download, CheckCircle2, XCircle, Home } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { VestryReceiptPDF } from "@/components/receipt/VestryReceiptPDF";
import { ReceiptCard } from "@/components/success/ReceiptCard";
import { PushPermissionButton } from "@/components/success/PushPermissionButton";
import QRCode from "qrcode";
import type { Registration } from "@/types/receipt.types";

function SuccessContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  const [registration, setRegistration] = useState<Registration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [meshColors, setMeshColors] = useState<
    { label: string; value: string }[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    if (!ref) {
      setError("No payment reference found.");
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        // Fetch global settings and the existing registration simultaneously
        const [settingsRes, regRes] = await Promise.all([
          fetch("/api/settings"),
          fetch(`/api/registrations/by-ref/${ref}`),
        ]);

        const settingsData = await settingsRes.json();
        setMeshColors(settingsData?.meshColors ?? []);

        if (!regRes.ok) {
          const e = await regRes.json();
          throw new Error(e.error || "Could not load registration");
        }
        
        const regData = await regRes.json();
        const reg = regData.data;
        
        // If it's a paystack method AND the DB still thinks it's unpaid, try verifying via paystack API.
        if (reg.paymentMethod === "paystack" && !reg.paymentStatus) {
            const verifyRes = await fetch("/api/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reference: ref }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyData.verified) {
                throw new Error(verifyData.error || "Payment verification failed");
            }
            // Mark it paid locally for the UI (the API handled the DB update)
            reg.paymentStatus = true;
        }

        setRegistration(reg);

        // Generate QR code regardless
        const qr = await QRCode.toDataURL(
          `${window.location.origin}/success?ref=${reg.paystackReference}`,
          { margin: 1, width: 120 },
        );
        setQrDataUrl(qr);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [ref]);

  if (isLoading)
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin h-9 w-9 text-emerald-400" />
        <p className="text-neutral-400 text-sm">Confirming your payment…</p>
      </div>
    );

  if (error || !registration)
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center gap-4 p-6">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
          <XCircle className="w-8 h-8 text-red-400" />
        </div>
        <div className="text-center">
          <p className="text-white font-semibold">Something went wrong</p>
          <p className="text-red-400 text-sm mt-1">
            {error ?? "Registration not found."}
          </p>
          {ref && (
            <p className="text-neutral-600 text-xs font-mono mt-2">
              Ref: {ref}
            </p>
          )}
        </div>
        <Link
          href="/"
          className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-sm font-medium transition-colors"
        >
          ← Return Home
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-emerald-500/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-amber-500/8 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-md w-full z-10 flex flex-col items-center gap-5">
        {/* State header logic based on Transfer approvals */}
        <div className="flex flex-col items-center gap-2 text-center">
          {(registration.paymentMethod === "transfer" && !registration.paymentStatus) ? (
            <>
              <div className="w-16 h-16 bg-amber-500/15 rounded-full flex items-center justify-center border-2 border-amber-500/30 shadow-[0_0_32px_rgba(245,158,11,0.18)]">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Pending Approval ⏳
              </h1>
              <p className="text-neutral-400 text-sm">
                Your transfer receipt is under review by the Admin. You&apos;ll receive an email notification when it&apos;s verified!
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-emerald-500/15 rounded-full flex items-center justify-center border-2 border-emerald-500/30 shadow-[0_0_32px_rgba(16,185,129,0.18)]">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                You&apos;re In! 🎉
              </h1>
              <p className="text-neutral-400 text-sm">
                Payment confirmed — your spot is secured.
              </p>
            </>
          )}
        </div>

        {/* Hide Receipt and PDF button if pending transfer */}
        {(registration.paymentMethod === "transfer" && !registration.paymentStatus) ? (
          <div className="w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-8 mt-4 text-center">
            <p className="text-neutral-300 font-medium">Please check back later.</p>
            <p className="text-neutral-500 text-sm mt-2">When approved, your ticket will appear here securely.</p>
            <div className="mt-8 flex flex-col items-center gap-3 w-full border-t border-neutral-800/50 pt-6">
              <Link
                href="/"
                className="inline-flex h-10 w-full py-3.5 px-6 bg-neutral-800 hover:bg-neutral-700 active:scale-[0.98] text-white font-medium rounded-2xl transition-all items-center justify-center gap-2 text-sm"
              >
                <Home className="w-4 h-4" /> Return Home
              </Link>
              
              <PushPermissionButton />
            </div>
          </div>
        ) : (
          <>
            <ReceiptCard registration={registration} meshColors={meshColors} />

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 w-full mt-8 mb-4">
              <PDFDownloadLink
                document={
                  <VestryReceiptPDF
                    registration={registration}
                    qrDataUrl={qrDataUrl}
                  />
                }
                fileName={`Vestry_Ticket_${registration.paystackReference}.pdf`}
                className="flex-1"
              >
                {({ loading }) => (
                  <button
                    type="button"
                    disabled={loading}
                    className="w-full h-10 py-3.5 px-5 bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-black font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/15 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin w-4 h-4" /> Generating…
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" /> Download Ticket
                      </>
                    )}
                  </button>
                )}
              </PDFDownloadLink>

              <Link
                href="/"
                className="flex-1 h-10 py-3.5 px-5 bg-neutral-800 hover:bg-neutral-700 active:scale-[0.98] text-white font-medium rounded-2xl transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Home className="w-4 h-4" /> Return Home
              </Link>
            </div>
            
            <p className="text-neutral-600 text-xs text-center border-t border-neutral-800/50 pt-4 w-full">
              Receipt sent to{" "}
              <span className="text-neutral-500">{registration.email}</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
          <Loader2 className="animate-spin h-7 w-7 text-emerald-400" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
