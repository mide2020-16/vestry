/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { Check, ExternalLink, Loader2 } from "lucide-react";

interface Registration {
  _id: { toString(): string };
  name: string;
  ticketType: string;
  totalAmount: number;
  paymentStatus: boolean | string;
  paymentMethod?: "paystack" | "transfer";
  paymentReceiptUrl?: string;
}

interface RecentRegistrationsProps {
  registrations: Registration[];
}

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
            r._id.toString() === id ? { ...r, paymentStatus: true } : r
          )
        );
      } else {
        alert(data.error || "Failed to approve");
      }
    } catch (err) {
      alert("An error occurred");
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-white mb-6">
        Recent Registrations
      </h3>

      {registrations.length === 0 ? (
        <p className="text-neutral-500 py-8 text-center bg-black/20 rounded-xl border border-neutral-800">
          No registrations yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-400">
            <thead className="text-xs uppercase bg-neutral-950/50 text-neutral-500">
              <tr>
                <th className="px-6 py-4 rounded-tl-lg">Name</th>
                <th className="px-6 py-4">Ticket</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 rounded-tr-lg">Action / Receipt</th>
              </tr>
            </thead>
            <tbody>
              {registrations.slice(0, 8).map((reg) => {
                const isPendingTransfer = reg.paymentMethod === "transfer" && (reg.paymentStatus === false || reg.paymentStatus === "pending");
                
                return (
                  <tr
                    key={reg._id.toString()}
                    className="border-b border-neutral-800/50 hover:bg-neutral-800/20 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-white">
                      {reg.name}
                    </td>
                    <td className="px-6 py-4 capitalize">{reg.ticketType}</td>
                    <td className="px-6 py-4 font-mono">
                      ₦{reg.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 flex flex-col gap-1 items-start">
                      <PaymentBadge status={reg.paymentStatus} />
                      {reg.paymentMethod === "transfer" && (
                        <span className="text-[10px] uppercase tracking-wider text-amber-500 font-bold">Transfer</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {reg.paymentReceiptUrl ? (
                          <a
                            href={reg.paymentReceiptUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 underline"
                          >
                            <ExternalLink size={14} /> Receipt
                          </a>
                        ) : (
                          <span className="text-xs text-neutral-600">N/A</span>
                        )}

                        {isPendingTransfer && (
                          <button
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
      )}
    </div>
  );
}
