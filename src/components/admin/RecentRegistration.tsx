"use client";

import { useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
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
          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          : "bg-neutral-800 text-neutral-300 border border-neutral-700"
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
            r._id.toString() === id ? { ...r, paymentStatus: true } : r,
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

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Recent Registrations</h3>
        {registrations.length > 0 && (
          <span className="text-xs text-neutral-500">
            {start + 1}–{Math.min(start + PAGE_SIZE, registrations.length)} of{" "}
            {registrations.length}
          </span>
        )}
      </div>

      {registrations.length === 0 ? (
        <p className="text-neutral-500 py-8 text-center bg-black/20 rounded-xl border border-neutral-800">
          No registrations yet.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-neutral-400">
              <thead className="text-xs uppercase bg-neutral-950/50 text-neutral-500">
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
                      className="border-b border-neutral-800/50 hover:bg-neutral-800/20 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-white">
                        <div className="flex flex-col">
                          <span>{reg.name}</span>
                          <div className="flex flex-col gap-1.5 mt-2">
                            {reg.merch?.map((m, i) => (
                              <div
                                key={i}
                                className="flex flex-col bg-white/5 p-2 rounded-lg border border-white/10 group/item hover:bg-white/10 transition-colors"
                              >
                                <div className="flex items-center justify-between gap-4">
                                  <span className="text-[10px] font-bold text-neutral-300">
                                    {m.name}{" "}
                                    {m.quantity > 1 && (
                                      <span className="text-amber-500">
                                        ×{m.quantity}
                                      </span>
                                    )}
                                  </span>
                                  <div className="flex gap-1">
                                    {m.size && (
                                      <span className="text-[8px] px-1 bg-neutral-700 text-neutral-400 rounded uppercase">
                                        {m.size}
                                      </span>
                                    )}
                                    {m.color && (
                                      <div
                                        className="w-2 h-2 rounded-full border border-white/20"
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
                            <span className="text-xs text-neutral-600">
                              N/A
                            </span>
                          )}

                          {isPendingTransfer && (
                            <button
                              type="button"
                              onClick={() => handleApprove(reg._id.toString())}
                              disabled={approvingId === reg._id.toString()}
                              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 font-semibold rounded disabled:opacity-50 text-xs transition-colors"
                            >
                              {approvingId === reg._id.toString() ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )}
                              Approve
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
                        ? "bg-amber-500 text-black"
                        : "text-neutral-500 hover:bg-neutral-800 hover:text-white"
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
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
