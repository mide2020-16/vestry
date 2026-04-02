"use client";

import { useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  X,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Registration {
  _id: { toString(): string };
  name: string;
  ticketType: string;
  totalAmount: number;
  paymentStatus: boolean | string;
  paymentMethod?: "paystack" | "transfer";
  paymentReceiptUrl?: string;
  merch?: {
    name: string;
    quantity: number;
    color?: string;
    size?: string;
    inscriptions?: string;
  }[];
}

interface RecentRegistrationsProps {
  registrations: Registration[];
}

const PAGE_SIZE = 10;

function PaymentBadge({ status }: { status: boolean | string }) {
  const paid = status === true || status === "success";
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        paid
          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
          : "bg-muted text-muted-foreground border border-border"
      }`}
    >
      {paid ? "Paid" : "Pending"}
    </span>
  );
}

export function RecentRegistrations({
  registrations: initialRegistrations,
}: RecentRegistrationsProps) {
  const [registrations, setRegistrations] = useState(initialRegistrations);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [decliningId, setDecliningId] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(registrations.length / PAGE_SIZE);
  const start = page * PAGE_SIZE;
  const currentPage = registrations.slice(start, start + PAGE_SIZE);
  const router = useRouter();

  const handleApprove = async (id: string) => {
    try {
      setApprovingId(id);
      const res = await fetch(`/api/registrations/${id}/approve`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (data.success) {
        setRegistrations((prev) =>
          prev.map((r) =>
            r._id.toString() === id ? { ...r, paymentStatus: true, status: "success" } : r,
          ),
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
    const reason = window.prompt("Reason for declining this receipt? (e.g. Amount mismatch, blurry receipt)");
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
            r._id.toString() === id ? { ...r, paymentStatus: false, status: "declined" } : r,
          ),
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
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 rounded-tr-lg">Receipt / Action</th>
                </tr>
              </thead>
              <tbody>
                {currentPage.map((reg) => {
                  const isPendingTransfer =
                    reg.paymentMethod === "transfer" &&
                    (reg.paymentStatus === false ||
                      reg.paymentStatus === "pending");

                  return (
                    <tr
                      key={reg._id.toString()}
                      className="border-b border-border/50 hover:bg-accent/30 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-foreground">
                        <div className="flex flex-col">
                          <span>{reg.name}</span>
                          <div className="flex flex-col gap-1.5 mt-2">
                            {reg.merch?.map((m, i) => (
                              <div
                                key={i}
                                className="flex flex-col bg-muted/50 p-2 rounded-lg border border-border group/item hover:bg-accent/50 transition-colors"
                              >
                                <div className="flex items-center justify-between gap-4">
                                  <span className="text-[10px] font-bold text-foreground/80">
                                    {m.name}{" "}
                                    {m.quantity > 1 && (
                                      <span className="text-amber-500">
                                        ×{m.quantity}
                                      </span>
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
                      <td className="px-6 py-4 capitalize">{reg.ticketType}</td>
                      <td className="px-6 py-4 font-mono">
                        ₦{reg.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          <PaymentBadge status={reg.paymentStatus} />
                          {reg.paymentMethod === "transfer" && (
                            <span className="text-[10px] uppercase tracking-wider text-amber-500 font-bold">
                              Transfer
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {reg.paymentReceiptUrl ? (
                            <a
                              href={reg.paymentReceiptUrl ?? "#"}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 underline"
                            >
                              <ExternalLink size={14} /> Receipt
                            </a>
                          ) : (
                            <span className="text-xs text-muted-foreground/40">
                              N/A
                            </span>
                          )}

                          {isPendingTransfer && (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleApprove(reg._id.toString())}
                                disabled={approvingId === reg._id.toString() || decliningId === reg._id.toString()}
                                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 font-bold rounded-xl disabled:opacity-50 text-xs transition-all active:scale-95"
                              >
                                {approvingId === reg._id.toString() ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Check className="w-3.5 h-3.5" />
                                )}
                                Approve
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDecline(reg._id.toString())}
                                disabled={approvingId === reg._id.toString() || decliningId === reg._id.toString()}
                                className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 font-bold rounded-xl disabled:opacity-50 text-xs transition-all active:scale-95"
                              >
                                {decliningId === reg._id.toString() ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <X className="w-3.5 h-3.5" />
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} /> Previous
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
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
