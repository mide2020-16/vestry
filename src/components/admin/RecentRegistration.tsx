/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { AnimatedAlert, AnimatedCheck, AnimatedChevron, AnimatedDecline, AnimatedExternalLink, AnimatedSpinner } from "../ui/Boop";

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

export function RecentRegistrations({
  registrations: initialRegistrations,
}: RecentRegistrationsProps) {
  const [registrations, setRegistrations] = useState(initialRegistrations);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [decliningId, setDecliningId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const router = useRouter();

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
                      <td className="px-6 py-4 capitalize">{reg.ticketType}</td>

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

                          {/* AI verification failure reason */}
                          {reg.aiVerificationResult &&
                            !reg.aiVerificationResult.verified &&
                            reg.status !== "declined" && (
                              <div className="flex items-start gap-1 text-[10px] text-amber-500/80 max-w-[200px]">
                                <AnimatedAlert>
                                  <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                                </AnimatedAlert>
                                <span className="italic leading-tight">
                                  AI: {reg.aiVerificationResult.reason}
                                </span>
                              </div>
                            )}

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
                  <ChevronLeft size={16} /> Previous
                </AnimatedChevron>
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