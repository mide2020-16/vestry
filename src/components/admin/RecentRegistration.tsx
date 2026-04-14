/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AnimatedAlert, 
  AnimatedCheck, 
  AnimatedChevron, 
  AnimatedDecline, 
  AnimatedExternalLink, 
  AnimatedSpinner, 
  Interactive,
  AnimatedTrash
} from "../ui/Boop";

interface Registration {
  _id: { toString(): string };
  name: string;
  ticketType: string;
  totalAmount: number;
  paymentStatus: boolean | string;
  // Both fields now tracked — model has both, we use status as source of truth
  status?: "pending" | "success" | "declined";
  paymentMethod?: "paystack" | "transfer";
  paymentReceiptUrl?: string;
  declineReason?: string | null;
  createdAt?: string | null;  // ← registration date (was wrongly using updatedAt)
  updatedAt?: string | null;
  merch?: {
    name: string;
    quantity: number;
    color?: string;
    size?: string;
    inscriptions?: string;
  }[];
  aiVerificationResult?: {
    verified: boolean;
    reason?: string | null;
    confidence: string;
    extractedAmount?: number | null;
    extractedBank?: string | null;
    extractedAccountName?: string | null;
  } | null;
}

interface RecentRegistrationsProps {
  registrations: Registration[];
}

const PAGE_SIZE = 10;

function PaymentBadge({ status, paymentStatus }: {
  status?: string;
  paymentStatus: boolean | string;
}) {
  const paid = paymentStatus === true || paymentStatus === "success" || status === "success";
  const declined = status === "declined";

  if (paid) {
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
        Paid
      </span>
    );
  }
  if (declined) {
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
        Declined
      </span>
    );
  }
  return (
    <span className="px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
      Pending
    </span>
  );
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function AIVerificationBadge({
  result,
  status,
}: {
  result: Registration["aiVerificationResult"];
  status?: string;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  if (!result || status === "declined") return null;

  const isVerified = result.verified;

  return (
    <div
      className="relative flex items-center cursor-help"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={() => setShowTooltip(!showTooltip)}
    >
      <div className={isVerified ? "text-emerald-500" : "text-red-500"}>
        <AnimatedAlert>
          {isVerified ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
        </AnimatedAlert>
      </div>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 w-64 p-4 rounded-2xl bg-card border border-border shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center gap-2 mb-2">
              {isVerified ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
              <span
                className={`text-[10px] font-black uppercase tracking-widest ${
                  isVerified ? "text-emerald-500" : "text-red-500"
                }`}
              >
                AI Verification {isVerified ? "Success" : "Failed"}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed italic">
              {result.reason ||
                (isVerified
                  ? "All payment criteria met and verified by Gemini AI."
                  : "Unknown verification error.")}
            </p>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-2 h-2 bg-card border-r border-b border-border rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function RecentRegistrations({
  registrations: initialRegistrations,
}: RecentRegistrationsProps) {
  const [registrations, setRegistrations] = useState(initialRegistrations);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [decliningId, setDecliningId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to remove this registration? The user will be notified via email about the incomplete transaction."
      )
    )
      return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/registrations/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        setRegistrations((prev) => {
          const next = prev.filter((r) => r._id.toString() !== id);
          // If we just deleted the last item on the current page, and we're not on the first page, move back
          const newTotalPages = Math.ceil(next.length / PAGE_SIZE);
          if (page >= newTotalPages && page > 0) {
            setPage(newTotalPages - 1);
          }
          return next;
        });
        router.refresh();
      } else {
        alert(data.error || "Failed to remove registration");
      }
    } catch (err) {
      alert("Error removing registration");
    } finally {
      setDeletingId(null);
    }
  };

  const totalPages = Math.ceil(registrations.length / PAGE_SIZE);
  const start = page * PAGE_SIZE;
  const currentPage = registrations.slice(start, start + PAGE_SIZE);

  const handleApprove = async (id: string) => {
    try {
      setApprovingId(id);
      // No body — route detects missing trigger and uses admin path
      const res = await fetch(`/api/registrations/${id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.success) {
        setRegistrations((prev) =>
          prev.map((r) =>
            r._id.toString() === id
              ? { ...r, paymentStatus: true, status: "success" }
              : r
          )
        );
        router.refresh();
      } else {
        alert(data.error || "Failed to approve");
      }
    } catch {
      alert("An error occurred");
    } finally {
      setApprovingId(null);
    }
  };

  const handleDecline = async (id: string) => {
    const reason = window.prompt(
      "Reason for declining this receipt? (e.g. Amount mismatch, blurry receipt)"
    );
    if (!reason) return;

    try {
      setDecliningId(id);
      const res = await fetch(`/api/registrations/${id}/decline`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (data.success) {
        setRegistrations((prev) =>
          prev.map((r) =>
            r._id.toString() === id
              ? {
                  ...r,
                  paymentStatus: false,
                  status: "declined",
                  declineReason: reason,
                  paymentReceiptUrl: undefined,
                  aiVerificationResult: null,
                }
              : r
          )
        );
        router.refresh();
      } else {
        alert(data.error || "Failed to decline");
      }
    } catch {
      alert("An error occurred during decline");
    } finally {
      setDecliningId(null);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl shadow-lg p-6 transition-colors">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-foreground">Recent Registrations</h3>
        {registrations.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {start + 1}–{Math.min(start + PAGE_SIZE, registrations.length)} of{" "}
            {registrations.length}
          </span>
        )}
      </div>

      {registrations.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center bg-muted/50 rounded-xl border border-border">
          No registrations yet.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-muted-foreground">
              <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 rounded-tl-lg">Name</th>
                  <th className="px-6 py-4">Ticket</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Registered</th>
                  <th className="px-6 py-4 rounded-tr-lg">Receipt / Action</th>
                </tr>
              </thead>
              <tbody>
                {currentPage.map((reg: any) => {
                  // Show approve/decline buttons when:
                  // - payment method is transfer AND
                  // - not yet paid AND
                  // - status is pending (declined users who re-submitted are reset to pending)
                  const isPendingTransfer =
                    reg.paymentMethod === "transfer" &&
                    reg.paymentStatus !== true &&
                    reg.paymentStatus !== "success" &&
                    reg.status !== "success" &&
                    reg.status !== "declined";

                  const id = reg._id.toString();

                  return (
                    <tr
                      key={id}
                      className="border-b border-border/50 hover:bg-accent/30 transition-colors"
                    >
                      {/* Name + merch */}
                      <td className="px-6 py-4 font-medium text-foreground">
                        <div className="flex flex-col">
                          <span>{reg.name}</span>
                          <div className="flex flex-col gap-1.5 mt-2">
                            {reg.merch?.map((m: any, i: any) => (
                              <div
                                key={i}
                                className="flex flex-col bg-muted/50 p-2 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                              >
                                <div className="flex items-center justify-between gap-4">
                                  <span className="text-[10px] font-bold text-foreground/80">
                                    {m.name}{" "}
                                    {m.quantity > 1 && (
                                      <span className="text-amber-500">×{m.quantity}</span>
                                    )}
                                  </span>
                                  <div className="flex gap-1">
                                    {m.size && (
                                      <span className="text-[8px] px-1 bg-muted text-muted-foreground rounded uppercase border border-border/50">
                                        {m.size}
                                      </span>
                                    )}
                                    {m.color && (
                                      <div
                                        className="w-2 h-2 rounded-full border border-foreground/20"
                                        style={{ backgroundColor: m.color }}
                                        title={m.color}
                                      />
                                    )}
                                  </div>
                                </div>
                                {m.inscriptions && (
                                  <span className="text-[9px] text-amber-500/80 italic mt-1 leading-tight border-l-2 border-amber-500/30 pl-2">
                                    &quot;{m.inscriptions}&quot;
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>

                      {/* Ticket type */}
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-xs transition-colors ${
                          reg.ticketType === "none"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20"
                            : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                        }`}>
                          {reg.ticketType === "none" ? "🛍️ Merch Only" : reg.ticketType}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4 font-mono">
                        ₦{reg.totalAmount.toLocaleString()}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          <PaymentBadge
                            status={reg.status}
                            paymentStatus={reg.paymentStatus}
                          />
                          {reg.paymentMethod === "transfer" && (
                            <span className="text-[10px] uppercase tracking-wider text-amber-500 font-bold">
                              Transfer
                            </span>
                          )}
                          {/* Show decline reason as tooltip-style note */}
                          {reg.status === "declined" && reg.declineReason && (
                            <span className="text-[10px] text-red-400/70 italic leading-tight max-w-[140px]">
                              {reg.declineReason}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Registration date — createdAt, not updatedAt */}
                      <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(reg.createdAt)}
                      </td>

                      {/* Receipt + actions */}
                      <td className="px-6 py-4">
                        <div className="flex flex-row gap-2">
                          <div className="flex items-center gap-3">
                            {reg.paymentReceiptUrl ? (
                              <AnimatedExternalLink>
                                <a
                                  href={reg.paymentReceiptUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 underline"
                                >
                                  <ExternalLink size={14} /> Receipt
                                </a>
                              </AnimatedExternalLink>
                            ) : (
                              <span className="text-xs text-muted-foreground/40">
                                {reg.status === "declined" ? "Awaiting re-upload" : "N/A"}
                              </span>
                            )}
                          </div>

                          {/* Compact AI verification badge */}
                          <AIVerificationBadge 
                            result={reg.aiVerificationResult} 
                            status={reg.status} 
                          />

                          {/* Approve / Decline buttons */}
                          {isPendingTransfer && (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleApprove(id)}
                                disabled={approvingId === id || decliningId === id}
                                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 font-bold rounded-xl disabled:opacity-50 text-xs transition-all active:scale-95"
                              >
                                {approvingId === id ? (
                                  <AnimatedSpinner size={14} />
                                ) : (
                                  <AnimatedCheck>
                                    <Check className="w-3.5 h-3.5" />
                                  </AnimatedCheck>
                                )}
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDecline(id)}
                                disabled={approvingId === id || decliningId === id}
                                className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 font-bold rounded-xl disabled:opacity-50 text-xs transition-all active:scale-95"
                              >
                                {decliningId === id ? (
                                  <AnimatedSpinner size={14} />
                                ) : (
                                  <AnimatedDecline>
                                    <X className="w-3.5 h-3.5" />
                                  </AnimatedDecline>
                                )}
                                Decline
                              </button>
                            </div>
                          )}

                          {reg.status === "pending" && (
                            <button
                              type="button"
                              onClick={() => handleDelete(id)}
                              disabled={deletingId === id}
                              className="p-1.5 text-muted-foreground/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all ml-auto"
                              title="Remove abandoned registration"
                            >
                              {deletingId === id ? (
                                <AnimatedSpinner size={14} />
                              ) : (
                                <AnimatedTrash>
                                  <Trash2 size={16} />
                                </AnimatedTrash>
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <AnimatedChevron direction="left">
                  <ChevronLeft size={16} />
                </AnimatedChevron>
                Previous
              </button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setPage(i)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                      i === page
                        ? "bg-amber-500 text-amber-950"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next 
                <AnimatedChevron direction="right">
                  <ChevronRight size={16} />
                </AnimatedChevron>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}