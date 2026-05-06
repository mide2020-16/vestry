/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import type { Registration } from "@/types/receipt.types";
import { AnimatedAlert, AnimatedCheck, AnimatedSpinner } from "@/components/ui/Boop";
import { ReceiptCard } from "@/components/success/ReceiptCard";
import { VestryReceiptPDF } from "@/components/receipt/VestryReceiptPDF";
import LoadingScreen from "@/components/register/LoadingScreen";
import QRCode from "qrcode";

function SuccessContent() {
  const searchParams = useSearchParams();
  const params = useParams();
  const slug = params.slug as string;
  const ref = searchParams.get("ref");

  const [registration, setRegistration] = useState<Registration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [meshColors, setMeshColors] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    if (!ref || !slug) {
      setError("Missing reference or event information.");
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        const [settingsRes, regRes] = await Promise.all([
          fetch(`/api/settings?slug=${slug}`),
          fetch(`/api/registrations/by-ref/${ref}?slug=${slug}`),
        ]);

        const settingsData = await settingsRes.json();
        setMeshColors(settingsData?.data?.meshColors ?? []);

        if (!regRes.ok) {
          const e = await regRes.json();
          throw new Error(e.error || "Could not load registration");
        }
        
        const regData = await regRes.json();
        const reg = regData.data;
        
        if (reg.paymentMethod === "paystack" && !reg.paymentStatus) {
            const verifyRes = await fetch("/api/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reference: ref }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.verified) reg.paymentStatus = true;
        }

        setRegistration(reg);

        const qr = await QRCode.toDataURL(
          `${window.location.origin}/event/${slug}/success?ref=${reg.paystackReference}`,
          { margin: 1, width: 120 },
        );
        setQrDataUrl(qr);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [ref, slug]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><AnimatedSpinner size={14} /></div>;
  if (error || !registration) return <div className="min-h-screen flex flex-col items-center justify-center gap-4">{error}<Link href="/">Go Home</Link></div>;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 py-12 relative overflow-hidden transition-colors">
      <div className="max-w-md w-full z-10 flex flex-col items-center gap-5">
        <div className="flex flex-col items-center gap-2 text-center w-full">
          {registration.status === "declined" ? (
             <>
               <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border-2 border-red-500/30">
                 <AnimatedAlert><AlertTriangle className="w-8 h-8 text-red-500" /></AnimatedAlert>
               </div>
               <h1 className="text-3xl font-black">Rejected</h1>
               <div className="mt-4 p-4 bg-red-500/5 border border-red-500/10 rounded-2xl text-left">
                  <p className="text-[10px] uppercase font-black">Reason:</p>
                  <p className="text-sm italic">{registration.declineReason || "Inaccurate receipt."}</p>
               </div>
             </>
          ) : (registration.paymentMethod === "transfer" && !registration.paymentStatus) ? (
            <>
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center border-2 border-amber-500/30">
                <AnimatedSpinner size={14} />
              </div>
              <h1 className="text-3xl font-black">Pending Approval</h1>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center border-2 border-emerald-500/30">
                <AnimatedCheck><CheckCircle2 className="w-8 h-8 text-emerald-500" /></AnimatedCheck>
              </div>
              <h1 className="text-3xl font-black">You&apos;re In! 🎉</h1>
            </>
          )}
        </div>

        {(registration.status === "declined" || (registration.paymentMethod === "transfer" && !registration.paymentStatus)) ? (
          <div className="w-full bg-card border border-border rounded-3xl p-8 mt-4">
             <Link href={`/event/${slug}/checkout?ref=${registration.paystackReference}`} className="w-full h-12 bg-amber-500 text-black font-black rounded-2xl flex items-center justify-center mb-4 uppercase tracking-widest">Retry Payment</Link>
             <Link href="/" className="w-full h-12 bg-secondary text-foreground rounded-2xl flex items-center justify-center uppercase tracking-widest font-bold">Home</Link>
          </div>
        ) : (
          <>
            <ReceiptCard registration={registration} meshColors={meshColors} />
            <div className="flex flex-col sm:flex-row gap-3 w-full mt-8">
              <PDFDownloadLink
                document={<VestryReceiptPDF registration={registration} qrDataUrl={qrDataUrl} />}
                fileName={`Vestry_Ticket_${registration.paystackReference}.pdf`}
                className="flex-1"
              >
                {({ loading }) => (
                  <button className="w-full h-12 bg-amber-400 text-black font-bold rounded-2xl flex items-center justify-center gap-2">
                    {loading ? "Generating..." : "Download Ticket"}
                  </button>
                )}
              </PDFDownloadLink>
              <Link href="/" className="flex-1 h-12 bg-secondary text-foreground rounded-2xl flex items-center justify-center font-bold">Home</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <SuccessContent />
    </Suspense>
  );
}
