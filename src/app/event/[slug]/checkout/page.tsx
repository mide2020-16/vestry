/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useUserSession } from "@/hooks/useUserSession";
import { OrderData } from "@/types/checkout.types";
import { buildOrder } from "@/components/checkout/buildorder";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { ConfirmModal } from "@/components/checkout/ConfirmModal";
import { AnimatedSpinner } from "@/components/ui/Boop";
import { SuspenseDots } from "@/components/register/LoadingScreen";

function LoadingScreen({ message = "Loading" }: { message?: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <AnimatedSpinner size={14} className="animate-spin h-10 w-10 text-amber-500" />
        <p className="text-muted-foreground text-sm font-medium">{message}<SuspenseDots /></p>
      </div>
    </div>
  );
}

function ErrorScreen({ error, onRestart }: { error: string; onRestart: () => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-card border border-border rounded-[2.5rem] p-10 text-center space-y-6 shadow-2xl">
        <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto">
          <X className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight">Checkout Error</h2>
        <p className="text-muted-foreground text-sm">{error || "Something went wrong."}</p>
        <button 
          onClick={onRestart}
          className="w-full py-4 bg-amber-500 text-black font-black uppercase tracking-widest rounded-2xl hover:bg-amber-400 transition-all"
        >
          Restart Registration
        </button>
      </div>
    </div>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const slug = params.slug as string;
  const ref = searchParams.get("ref");
  const { session } = useUserSession();

  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"paystack" | "transfer">("paystack");
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug || !ref) {
      setIsLoading(false);
      return;
    }

    buildOrder(slug, searchParams)
      .then((newOrder) => {
        setOrder(newOrder);
        // Default to paystack if enabled
        if (newOrder.paystackEnabled) setPaymentMethod("paystack");
        else if (newOrder.bankTransferEnabled) setPaymentMethod("transfer");
      })
      .catch((err: Error) => setError(err.message || "Failed to load order."))
      .finally(() => setIsLoading(false));
  }, [slug, ref, searchParams, session]);

  const handleConfirmPayment = async () => {
    if (!order || !ref || isPaying) return;
    setIsPaying(true);
    setError(null);

    try {
      // Update registration with final payment method and receipt if any
      const res = await fetch(`/api/registrations?slug=${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          existingRef: ref,
          paymentMethod,
          paymentReceiptUrl: receiptUrl,
          name: order.name,
          email: order.email,
          ticketType: order.ticketType,
          partnerName: order.partnerName,
          foodSelections: (order.foods as any[]).map(f => f._id || f),
          drinkSelection: (order.drinks as any[]).map(d => d._id || d),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to finalize registration");

      if (paymentMethod === "transfer") {
        router.push(`/event/${slug}/success?ref=${ref}`);
        return;
      }

      // Paystack Payment
      const PaystackPop = (await import("@paystack/inline-js")).default;
      const paystack = new PaystackPop();

      paystack.newTransaction({
        key: data.paystackKey,
        email: order.email,
        amount: Math.round(order.grandTotal * 100),
        reference: ref,
        onSuccess: (transaction: any) => {
          // Log Payment Completion
          fetch("/api/logs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "COMPLETE_PAYMENT",
              resource: "Registration",
              details: `Consumer ${order.name} completed online payment for ${slug}`,
              userName: order.name,
              userEmail: order.email,
              metadata: { reference: transaction.reference, amount: order.grandTotal },
            })
          }).catch(console.error);
          
          router.push(`/event/${slug}/success?ref=${transaction.reference}`);
        },
        onCancel: () => {
          setIsPaying(false);
          setIsModalOpen(false);
        },
      });
    } catch (err: any) {
      setError(err.message);
      setIsPaying(false);
      setIsModalOpen(false);
    }
  };

  const restartRegistration = () => router.push(`/event/${slug}/register`);

  if (!ref) return <ErrorScreen error="Missing registration reference. Please restart registration." onRestart={restartRegistration} />;
  if (isLoading) return <LoadingScreen message="Securing your order..." />;
  if (error || !order) return <ErrorScreen error={error || "Something went wrong."} onRestart={restartRegistration} />;

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] flex items-center justify-center p-4 pt-20 transition-colors">
      <OrderSummary
        order={order}
        onPay={() => setIsModalOpen(true)}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        receiptUrl={receiptUrl}
        setReceiptUrl={setReceiptUrl}
        isPaying={isPaying}
      />

      {isModalOpen && (
        <ConfirmModal
          isPaying={isPaying}
          paymentMethod={paymentMethod}
          onConfirm={handleConfirmPayment}
          onCancel={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

const X = ({ className, size = 24 }: { className?: string; size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

export default function CheckoutPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <CheckoutContent />
    </Suspense>
  );
}