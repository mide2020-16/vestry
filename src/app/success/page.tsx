"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Download, CheckCircle2, XCircle, Home, AlertTriangle, RefreshCw } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { VestryReceiptPDF } from "@/components/receipt/VestryReceiptPDF";
import { ReceiptCard } from "@/components/success/ReceiptCard";
import { PushPermissionButton } from "@/components/success/PushPermissionButton";
import QRCode from "qrcode";
import type { Registration } from "@/types/receipt.types";
import { AnimatedAlert, AnimatedCheck, AnimatedDecline, AnimatedSpinner } from "@/components/ui/Boop";

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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <AnimatedSpinner size={14} />
        <p className="text-muted-foreground text-sm font-medium">Confirming your payment…</p>
      </div>
    );

  if (error || !registration)
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-6">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
          <AnimatedDecline>
            <XCircle className="w-8 h-8 text-red-400" />
          </AnimatedDecline>
        </div>
        <div className="text-center">
          <p className="text-foreground font-bold">Something went wrong</p>
          <p className="text-red-500 text-sm mt-1">
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
          className="px-6 py-3 bg-muted hover:bg-accent text-foreground rounded-xl text-sm font-bold transition-all border border-border shadow-sm"
        >
          ← Return Home
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 py-12 relative overflow-hidden transition-colors">
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-md w-full z-10 flex flex-col items-center gap-5">
        {/* State header logic based on Status approvals */}
        <div className="flex flex-col items-center gap-2 text-center w-full">
          {registration.status === "declined" ? (
             <>
               <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border-2 border-red-500/30 shadow-[0_0_32px_rgba(239,68,68,0.1)]">
               <AnimatedAlert>
                 <AlertTriangle className="w-8 h-8 text-red-500" />
               </AnimatedAlert>
               </div>
               <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                 Payment <span className="text-red-500">Rejected</span>
               </h1>
               <div className="mt-4 p-4 bg-red-500/5 border border-red-500/10 rounded-2xl w-full text-left">
                  <p className="text-[10px] text-red-500 dark:text-red-400 uppercase font-black tracking-widest mb-1">Reason from Admin:</p>
                  <p className="text-foreground/90 text-sm italic font-medium leading-relaxed">
                    &ldquo;{registration.declineReason || "Inaccurate receipt or missing transaction."}&rdquo;
                  </p>
               </div>
               <p className="text-muted-foreground/60 text-xs mt-4 font-medium">
                 Don&apos;t worry, your details are still safe. Please click the button below to re-submit your transfer proof.
               </p>
             </>
          ) : (registration.paymentMethod === "transfer" && !registration.paymentStatus) ? (
            <>
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center border-2 border-amber-500/30 shadow-[0_0_32px_rgba(245,158,11,0.1)]">
                <AnimatedSpinner size={14} />
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                Pending <span className="text-amber-500">Approval</span> ⏳
              </h1>
              <p className="text-muted-foreground text-sm mt-2 font-medium">
                Your transfer receipt is under review by the Admin. You&apos;ll receive an email notification when it&apos;s verified!
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center border-2 border-emerald-500/30 shadow-[0_0_32px_rgba(16,185,129,0.1)]">
                <AnimatedCheck><CheckCircle2 className="w-8 h-8 text-emerald-500" /></AnimatedCheck>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                You&apos;re <span className="text-emerald-500">In!</span> 🎉
              </h1>
              <p className="text-muted-foreground text-sm mt-2 font-medium">
                Payment confirmed — your spot is secured.
              </p>
            </>
          )}
        </div>

        {/* Hide Receipt and PDF button if pending or declined */}
        {(registration.status === "declined" || (registration.paymentMethod === "transfer" && !registration.paymentStatus)) ? (
          <div className="w-full bg-card border border-border rounded-3xl p-8 mt-4 text-center">
            {registration.status === "declined" ? (
               <div className="flex flex-col gap-4 w-full">
                 <Link
                   href={`/checkout?ref=${registration.paystackReference}`}
                   className="inline-flex h-12 w-full py-3.5 px-6 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-black font-black rounded-2xl transition-all items-center justify-center gap-2 text-sm uppercase tracking-widest shadow-xl shadow-amber-500/10"
                 >
                   <RefreshCw className="w-4 h-4" /> Retry Payment Upload
                 </Link>
                 <Link
                   href="/"
                   className="inline-flex h-12 w-full py-3.5 px-6 bg-secondary hover:bg-secondary/80 active:scale-[0.98] text-foreground font-medium rounded-2xl transition-all items-center justify-center gap-2 text-sm"
                 >
                   <Home className="w-4 h-4" /> Return Home
                 </Link>
               </div>
            ) : (
                <>
                  <p className="text-foreground font-medium">Please check back later.</p>
                  <p className="text-muted-foreground text-sm mt-2">When approved, your ticket will appear here securely.</p>
                  <div className="mt-8 flex flex-col items-center gap-3 w-full border-t border-border pt-6">
                    <Link
                      href="/"
                      className="inline-flex h-10 w-full py-3.5 px-6 bg-secondary hover:bg-secondary/80 active:scale-[0.98] text-foreground font-medium rounded-2xl transition-all items-center justify-center gap-2 text-sm"
                    >
                      <Home className="w-4 h-4" /> Return Home
                    </Link>
                    
                    <PushPermissionButton />
                  </div>
                </>
            )}
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
                        <AnimatedSpinner size={14} /> Generating…
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
                className="flex-1 h-10 py-3.5 px-5 bg-secondary hover:bg-secondary/80 active:scale-[0.98] text-foreground font-medium rounded-2xl transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Home className="w-4 h-4" /> Return Home
              </Link>
            </div>
            
            <p className="text-muted-foreground/30 text-[10px] uppercase font-black tracking-widest text-center border-t border-border/50 pt-4 w-full">
              Receipt sent to{" "}
              <span className="text-muted-foreground/60">{registration.email}</span>
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
        <div className="min-h-screen bg-background flex items-center justify-center">
          <AnimatedSpinner size={14} className="animate-spin h-7 w-7 text-emerald-500" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
