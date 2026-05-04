/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useUserSession } from "@/hooks/useUserSession";
// import { Loader2 } from "lucide-react";
import { OrderData } from "@/types/checkout.types";
import { buildOrder } from "@/components/checkout/buildorder";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { ConfirmModal } from "@/components/checkout/ConfirmModal";
import { AnimatedSpinner } from "@/components/ui/Boop";

function LoadingScreen({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <AnimatedSpinner size={14} className="animate-spin h-10 w-10 text-amber-500" />
        <p className="text-muted-foreground text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const slug = params.slug as string;
  const { session } = useUserSession();

  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"paystack" | "transfer">("transfer");
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    buildOrder(slug, searchParams, session)
      .then((newOrder) => {
        setOrder(newOrder);
        if (newOrder.paystackEnabled) setPaymentMethod("paystack");
        else if (newOrder.bankTransferEnabled) setPaymentMethod("transfer");
      })
      .catch((err: any) => setError(`Failed to load order: ${err.message}`))
      .finally(() => setIsLoading(false));
  }, [slug, searchParams, session]);

  const handleConfirmPayment = async () => {
    if (!order || isPaying) return;
    setIsPaying(true);
    setError(null);

    try {
      const res = await fetch(`/api/registrations?slug=${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...order,
          merch: order.merch.map((m) => ({
            productId: m.product._id,
            quantity: m.quantity,
            color: m.color,
            size: m.size,
            inscriptions: m.inscriptions,
          })),
          foodSelections: order.foods.map((f) => f._id),
          drinkSelection: order.drinks.map((d) => d._id),
          paymentMethod,
          paymentReceiptUrl: receiptUrl,
          existingRef: order.existingRef,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create registration");

      if (paymentMethod === "transfer") {
        router.push(`/event/${slug}/success?ref=${data.paystackReference}`);
        return;
      }

      const PaystackPop = (await import("@paystack/inline-js")).default;
      const paystack = new PaystackPop();

      paystack.newTransaction({
        key: data.paystackKey,
        email: order.email,
        amount: data.totalAmount * 100,
        reference: data.paystackReference,
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
              sessionId: localStorage.getItem("vestry_session_id") || undefined
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

  if (isLoading) return <LoadingScreen message="Building your order..." />;
  if (error || !order) return <div className="text-center py-20">{error}</div>;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 pt-20 transition-colors">
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

export default function CheckoutPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <CheckoutContent />
    </Suspense>
  );
}