"use client";

import { useState, useRef } from "react";
import { OrderData } from "@/types/checkout.types";
import { useUploadThing } from "@/lib/uploadthing";
import { Copy, Check, Trash2, Smartphone, Landmark, ReceiptText, ShieldCheck, Upload, Loader2 } from "lucide-react";
import { formatNaira } from "@/lib/utils/format";
import { Interactive, AnimatedUpload, AnimatedSpinner, AnimatedCopy, AnimatedTrash, AnimatedSmartphone, AnimatedLandmark, AnimatedCheck } from "@/components/ui/Boop";
import Image from "next/image";

interface OrderSummaryProps {
  order: OrderData;
  onPay: () => void;
  paymentMethod: "paystack" | "transfer";
  setPaymentMethod: (method: "paystack" | "transfer") => void;
  receiptUrl: string | null;
  setReceiptUrl: (url: string) => void;
  isPaying: boolean;
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="ml-2 p-1.5 rounded-lg text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 transition-all"
      title="Copy"
    >
      {copied ? <Interactive><Check size={14} className="text-emerald-500" /></Interactive> : <AnimatedCopy><Copy size={14} /></AnimatedCopy>}
    </button>
  );
}

/* ── Auto-upload receipt component ─────────────────────────────────────── */

function ReceiptUploader({
  receiptUrl,
  setReceiptUrl,
}: {
  receiptUrl: string | null;
  setReceiptUrl: (url: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { startUpload } = useUploadThing("receiptUploader", {
    onUploadBegin(fileName) {
      console.log("[Receipt] upload begin:", fileName);
    },
    onUploadProgress(progress) {
      console.log("[Receipt] progress:", progress, "%");
    },
    onClientUploadComplete(res) {
      console.log("[Receipt] client upload complete:", res);
    },
    onUploadError(err) {
      console.error("[Receipt] upload error:", {
        message: err.message,
        code: err.code,
        data: err.data,
      });
    },
  });

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("[Receipt] file selected:", {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    setIsUploading(true);
    setUploadError(null);

    try {
      const res = await startUpload([file]);
      if (!res?.[0]?.url) {
        throw new Error("Upload failed, please try again");
      }
      console.log("[Receipt] success, url:", res[0].url);
      setReceiptUrl(res[0].url);
    } catch (err) {
      console.error("[Receipt] caught error:", err);
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  if (receiptUrl) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm p-4 rounded-xl flex justify-between items-center shadow-inner">
        <div className="flex items-center gap-2 font-semibold">
          <Interactive><Check size={18} /></Interactive>
          <span>Receipt Uploaded</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setReceiptUrl("");
          }}
          className="p-2 hover:bg-emerald-500/20 rounded-lg transition-colors text-emerald-600 dark:text-emerald-400 focus:outline-none"
          title="Remove Receipt"
        >
          <AnimatedTrash><Trash2 size={16} /></AnimatedTrash>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <input
        ref={fileRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={handleFile}
      />
      <button
        type="button"
        disabled={isUploading}
        onClick={() => fileRef.current?.click()}
        className="w-full flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed border-border hover:border-amber-500/50 bg-muted/30 hover:bg-amber-500/5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        {isUploading ? (
          <>
            <AnimatedSpinner size={24} className="text-amber-500" />
            <span className="text-sm font-bold text-amber-500">Uploading…</span>
            <span className="text-[10px] text-muted-foreground">Please wait</span>
          </>
        ) : (
          <>
            <AnimatedUpload>
              <Upload size={24} className="text-amber-500 group-hover:text-amber-400 transition-colors" />
            </AnimatedUpload>
            <span className="text-sm font-bold text-amber-600 dark:text-amber-500 group-hover:text-amber-400 transition-colors">
              Click to upload receipt
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">
              JPG, PNG, PDF — max 4 MB
            </span>
          </>
        )}
      </button>

      {uploadError && (
        <div className="flex items-center justify-between bg-red-500/10 border border-red-500/20 rounded-xl p-3">
          <p className="text-xs text-red-400 font-medium">{uploadError}</p>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="text-xs font-bold text-red-400 hover:text-red-300 underline ml-2 shrink-0"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}

export function OrderSummary({
  order,
  onPay,
  paymentMethod,
  setPaymentMethod,
  receiptUrl,
  setReceiptUrl,
  isPaying,
}: OrderSummaryProps) {
  const attendeeRows = [
    { label: "Primary Attendee", value: order.name },
    ...(order.ticketType === "couple" && order.partnerName
      ? [{ label: "Partner", value: order.partnerName }]
      : []),
    { label: "Email", value: order.email },
    {
      label: "Ticket Type",
      value: order.ticketType.toUpperCase(),
      amber: true,
    },
  ];

  const hasFoodDrink = order.foods.length > 0 || order.drink !== null;

  const bankRows = [
    { label: "Bank Name", value: order.bankDetails?.bankName ?? "" },
    { label: "Account Name", value: order.bankDetails?.accountName ?? "" },
    { label: "Account Number", value: order.bankDetails?.accountNumber ?? "", mono: true, amber: true },
  ];

  return (
    <div className="max-w-xl w-full bg-card border border-border rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-2xl relative overflow-hidden transition-colors duration-300">
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="flex items-center gap-3 mb-2">
        <AnimatedFileText><ReceiptText className="text-amber-500" size={24} /></AnimatedFileText>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Order Summary</h1>
      </div>
      <p className="text-sm md:text-base text-muted-foreground mb-6 md:mb-8 border-b border-border pb-4">
        Review your selections and complete your registration.
      </p>

      {/* Attendee details */}
      <div className="space-y-3 mb-8">
        {attendeeRows.map(({ label, value, amber }) => (
          <div
            key={label}
            className="flex justify-between items-center bg-muted/30 p-4 rounded-xl border border-border/50 transition-colors"
          >
            <span className="text-muted-foreground text-sm font-medium">{label}</span>
            <span className={amber ? "text-amber-600 dark:text-amber-400 font-bold tracking-tight" : "text-foreground font-semibold"}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Selections Section */}
      <div className="space-y-6 md:space-y-8 relative mb-8">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
          <h2 className="text-foreground font-bold uppercase tracking-widest text-[11px]">Your Selections</h2>
        </div>

        <div className="flex justify-between items-center text-sm p-4 rounded-xl bg-muted/50 border border-border shadow-sm">
          <div className="flex items-center gap-2">
            <Interactive>
              <span className="text-xl">🎟</span>
            </Interactive>
            <span className="text-foreground font-semibold">{order.ticketType === "single" ? "Single Ticket" : "Couple Ticket"}</span>
          </div>
          <span className="text-foreground font-bold tabular-nums">{formatNaira(order.ticketPrice)}</span>
        </div>

        <div className="space-y-3">
          {order.merch.map((item, idx) => (
            <div key={`${item.product._id}-${idx}`} className="flex flex-col md:flex-row md:justify-between md:items-start text-sm p-4 rounded-xl bg-muted/20 gap-3 border border-border/50 hover:bg-muted/40 transition-colors group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Interactive>
                    <span className="text-lg">👕</span>
                  </Interactive>
                  <span className="text-foreground font-bold">{item.product.name}</span>
                </div>
                {(item.color || item.size) && (
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-muted-foreground">
                    {item.color && (
                      <div className="flex items-center gap-1.5 bg-card px-2.5 py-1 rounded-lg border border-border shadow-sm">
                        <div className="w-2.5 h-2.5 rounded-full border border-foreground/10" style={{ backgroundColor: item.color }} />
                        <span className="uppercase tracking-widest font-black text-[9px]">Color</span>
                      </div>
                    )}
                    {item.size && (
                      <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500 px-2.5 py-1 rounded-lg font-bold">
                        {item.size}
                      </div>
                    )}
                    {item.inscriptions && (
                      <p className="w-full text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-tighter mt-1 italic opacity-80">
                        &quot;{item.inscriptions}&quot;
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center md:flex-col md:items-end mt-2 md:mt-0 border-t md:border-0 border-border pt-2 md:pt-0">
                <span className="text-muted-foreground text-[10px] md:mb-1 font-medium">
                  {formatNaira(item.product.price)} × {item.quantity}
                </span>
                <span className="font-mono text-foreground text-base font-bold bg-muted/50 md:bg-transparent px-2 md:px-0 py-1 md:py-0 rounded-lg">
                  {formatNaira(item.product.price * item.quantity)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {hasFoodDrink && (
          <div className="p-4 rounded-xl bg-emerald-500/3 border border-emerald-500/10 transition-colors">
            <span className="text-[10px] text-emerald-600 dark:text-emerald-500 uppercase font-black tracking-[0.2em] block mb-3">
              Included Food &amp; Drinks
            </span>
            <ul className="grid grid-cols-2 gap-3">
              {order.foods.map((food) => (
                <li key={food._id} className="text-[13px] text-foreground/80 flex items-center gap-2 font-medium">
                  <div className="w-1.5 h-1.5 bg-emerald-500/40 rounded-full" />
                  {food.name}
                </li>
              ))}
              {order.drink && (
                <li className="text-[13px] text-foreground/80 flex items-center gap-2 font-medium">
                  <div className="w-1.5 h-1.5 bg-emerald-500/40 rounded-full" />
                  {order.drink.name}
                </li>
              )}
            </ul>
          </div>
        )}

        <div className="flex justify-between items-center py-5 border-t border-border">
          <span className="text-lg font-black text-foreground uppercase tracking-tight">Grand Total</span>
          <div className="text-right">
            <span className="text-3xl font-black text-amber-500 tabular-nums tracking-tighter transition-all">{formatNaira(order.grandTotal)}</span>
            {paymentMethod === "paystack" && order.paystackFee > 0 && (
              <p className="text-[10px] text-muted-foreground mt-1 font-medium">Includes {formatNaira(order.paystackFee)} processing fee</p>
            )}
          </div>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
          <h2 className="text-foreground font-bold uppercase tracking-widest text-[11px]">Payment Method</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(!order.paystackEnabled && !order.bankTransferEnabled) ? (
            <div className="col-span-full bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-3 animate-pulse">
              <Smartphone size={20} />
              <span>No payment methods available. Please contact support.</span>
            </div>
          ) : (
            <>
              {order.paystackEnabled && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod("paystack")}
                  className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all duration-300 relative group/pay ${
                    paymentMethod === "paystack" 
                      ? "border-amber-500 bg-amber-500/10 shadow-xl scale-[1.02]" 
                      : "border-border bg-muted/30 hover:border-border/60 text-muted-foreground hover:bg-card"
                  }`}
                >
                  <div className={`p-3 rounded-xl mb-3 transition-colors ${paymentMethod === "paystack" ? "bg-amber-500 text-amber-950" : "bg-muted text-muted-foreground"}`}>
                    <AnimatedSmartphone><Smartphone size={24} /></AnimatedSmartphone>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${paymentMethod === "paystack" ? "text-amber-600 dark:text-amber-500" : ""}`}>Online Payment</span>
                  {paymentMethod === "paystack" && <div className="absolute top-2 right-2"><AnimatedCheck><ShieldCheck size={16} className="text-amber-500" /></AnimatedCheck></div>}
                </button>
              )}

              {order.bankTransferEnabled && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod("transfer")}
                  className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all duration-300 relative group/transfer ${
                    paymentMethod === "transfer" 
                      ? "border-emerald-500 bg-emerald-500/10 shadow-xl scale-[1.02]" 
                      : "border-border bg-muted/30 hover:border-border/60 text-muted-foreground hover:bg-card"
                  }`}
                >
                  <div className={`p-3 rounded-xl mb-3 transition-colors ${paymentMethod === "transfer" ? "bg-emerald-500 text-emerald-950" : "bg-muted text-muted-foreground"}`}>
                    <AnimatedLandmark><Landmark size={24} /></AnimatedLandmark>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${paymentMethod === "transfer" ? "text-emerald-600 dark:text-emerald-500" : ""}`}>Bank Transfer</span>
                  {paymentMethod === "transfer" && <div className="absolute top-2 right-2"><AnimatedCheck><ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-500" /></AnimatedCheck></div>}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Manual Transfer Instructions */}
      {paymentMethod === "transfer" && (
        <div className="space-y-4 mb-8 bg-muted/50 p-6 rounded-2xl border border-border animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="text-[11px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">Bank Details</h3>
            <span className="text-[10px] text-muted-foreground/60 uppercase font-bold">Transfer exact amount</span>
          </div>

          <div className="space-y-1.5 rounded-xl overflow-hidden border border-border bg-muted/50">
            {bankRows.map(({ label, value, mono, amber }, i) => (
              <div
                key={label}
                className={`flex items-center justify-between px-4 py-3.5 ${i % 2 === 0 ? "bg-card/50" : "bg-transparent"}`}
              >
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">{label}</span>
                <div className="flex items-center gap-1">
                  <span className={`text-sm font-bold ${amber ? "text-amber-600 dark:text-amber-400 font-mono tracking-wider" : "text-foreground"} ${mono ? "font-mono" : ""}`}>
                    {value}
                  </span>
                  <CopyButton value={value} />
                </div>
              </div>
            ))}
          </div>

          {/* Copy all button */}
          <CopyAllButton bankDetails={order.bankDetails} />

          <div className="pt-4 mt-2 border-t border-border">
            <h3 className="text-xs font-black text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <div className="w-1 h-1 bg-amber-500 rounded-full" />
              Upload Payment Receipt
            </h3>
            <ReceiptUploader receiptUrl={receiptUrl} setReceiptUrl={setReceiptUrl} />
            <p className="text-[10px] text-muted-foreground mt-4 italic text-center">Your order will be confirmed after admin verification.</p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onPay}
        disabled={isPaying || (paymentMethod === "transfer" && !receiptUrl) || (!order.paystackEnabled && !order.bankTransferEnabled)}
        className="w-full bg-linear-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed
          text-amber-950 font-black uppercase tracking-widest text-base py-5 rounded-2xl shadow-xl
          hover:shadow-amber-500/20 transition-all active:scale-[0.98] outline-none"
      >
        {isPaying
          ? "Processing Transaction..."
          : paymentMethod === "paystack"
            ? `Pay ${formatNaira(order.grandTotal)}`
            : `Complete Registration`}
      </button>

      <div className="mt-6 flex items-center justify-center gap-4 opacity-30 grayscale saturate-0 pointer-events-none relative h-4">
        <Image width={80} height={16} src="/logo/paystack.png" alt="Secure by Paystack" className="h-4 w-auto dark:invert" />
        <span className="w-1 h-1 bg-muted-foreground rounded-full" />
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Secure Checkout</p>
      </div>
    </div>
  );
}

/* ── Copy All Button ─────────────────────────────────────────────────────── */

function CopyAllButton({ bankDetails }: { bankDetails: OrderData["bankDetails"] }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = `Bank: ${bankDetails?.bankName}\nAccount Name: ${bankDetails?.accountName}\nAccount Number: ${bankDetails?.accountNumber}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
        copied 
          ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-500" 
          : "border-border text-muted-foreground hover:bg-background hover:text-foreground hover:border-foreground/20"
      }`}
    >
      {copied
        ? <><Interactive><Check size={14} className="text-emerald-500" /></Interactive> <span>Copied to Clipboard</span></>
        : <><AnimatedCopy><Copy size={14} /></AnimatedCopy> Copy All Bank Details</>}
    </button>
  );
}