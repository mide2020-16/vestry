"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserSession } from "@/hooks/useUserSession";
import { Loader2 } from "lucide-react";
import { OrderData } from "@/types/checkout.types";
import { buildOrder } from "@/components/checkout/buildorder";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { ConfirmModal } from "@/components/checkout/ConfirmModal";

/* ── Shared loading screen ──────────────────────────────────────────────── */

function LoadingScreen({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin h-10 w-10 text-amber-500" />
        <p className="text-muted-foreground text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}

/* ── Checkout content ───────────────────────────────────────────────────── */

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session } = useUserSession();

  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"paystack" | "transfer">("transfer");
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    buildOrder(searchParams, session)
      .then((newOrder) => {
        setOrder(newOrder);
        // Auto-select the first available method
        if (newOrder.paystackEnabled) {
          setPaymentMethod("paystack");
        } else if (newOrder.bankTransferEnabled) {
          setPaymentMethod("transfer");
        }
      })
      .catch((err: unknown) => {
        const detail = err instanceof Error ? ` (${err.message})` : "";
        setError(
          `Failed to load order details. Please go back and try again.${detail}`,
        );
      })
      .finally(() => setIsLoading(false));
  }, [searchParams, session]);

  const handleConfirmPayment = async () => {
    if (!order || isPaying) return;
    setIsPaying(true);
    setError(null);

    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: order.name,
          email: order.email,
          ticketType: order.ticketType,
          partnerName: order.partnerName,
          merch: order.merch.map((m) => ({
            productId: m.product._id,
            quantity: m.quantity,
            color: m.color,
            size: m.size,
            inscriptions: m.inscriptions,
          })),
          foodSelections: order.foods.map((f) => f._id),
          drinkSelection: order.drink?._id,
          totalAmount: order.grandTotal,
          paymentMethod,
          paymentReceiptUrl: receiptUrl,
          paymentStatus: false,
          existingRef: order.existingRef,
        }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error ?? "Failed to create registration");

      if (paymentMethod === "transfer") {
        router.push(`/success?ref=${data.paystackReference}`);
        return;
      }

      if (!data.paystackReference)
        throw new Error("No payment reference returned");
      if (!data.paystackKey)
        throw new Error("Payment configuration missing");

      const { paystackReference, totalAmount, paystackKey } = data;

      const PaystackPop = (await import("@paystack/inline-js")).default;
      const paystack = new PaystackPop();

      paystack.newTransaction({
        key: paystackKey,
        email: order.email,
        amount: totalAmount * 100,
        reference: paystackReference,
        onSuccess: (transaction: { reference: string }) => {
          router.push(`/success?ref=${transaction.reference}`);
        },
        onCancel: async () => {
          await fetch(`/api/registrations/${data.registrationId}`, {
            method: "DELETE",
          });
          setIsPaying(false);
          setIsModalOpen(false);
        },
      });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      console.error("Payment error:", err);
      setError(message);
      setIsPaying(false);
      setIsModalOpen(false);
    }
  };

  if (isLoading) return <LoadingScreen message="Building your order..." />;

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-500 dark:text-red-400 mb-4 font-semibold">{error ?? "Order not found."}</p>
          <button
            type="button"
            onClick={() => router.back()}
            className="text-amber-600 dark:text-amber-400 underline text-sm font-bold"
          >
            ← Go back
          </button>
        </div>
      </div>
    );
  }

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

/* ── Page ───────────────────────────────────────────────────────────────── */

export default function CheckoutPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <CheckoutContent />
    </Suspense>
  );
}