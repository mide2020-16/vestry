/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Filter,
  Search,
  Ticket,
  Trash2,
  X,
} from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate } from "@/lib/utils";
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
import { ConfirmationModal, PromptModal, AlertModal } from "../ui/Modal";
import { RegistrationDetailModal } from "./RegistrationDetailModal";


interface Registration {
  _id: { toString(): string };
  email: string;
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
  totalPages: number;
  currentPage: number;
  searchParamValues: { search: string; status: string; ticketType: string; };
}

// Client-side debounce utility
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

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
  totalPages,
  currentPage: validPage,
  searchParamValues,
}: RecentRegistrationsProps) {
  const [registrations, setRegistrations] = useState(initialRegistrations);
  
  useEffect(() => {
    setRegistrations(initialRegistrations);
  }, [initialRegistrations]);

  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [decliningId, setDecliningId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: "", message: "", variant: "info" as "success" | "error" | "info" });
  const [selectedRegId, setSelectedRegId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  
  // Detail Modal State
  const [detailReg, setDetailReg] = useState<Registration | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState(searchParamValues.search);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const updateSearchParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all" && value !== "0") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key !== "page") {
      params.delete("page");
    }
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, pathname, router]);

  useEffect(() => {
    if (debouncedSearchTerm !== searchParamValues.search) {
      updateSearchParam("search", debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, searchParamValues.search, updateSearchParam]);

  const currentPage = registrations;

  const showAlert = (title: string, message: string, variant: "success" | "error" | "info" = "info") => {
    setAlertConfig({ title, message, variant });
    setIsAlertOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setSelectedRegId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeclineClick = (id: string) => {
    setSelectedRegId(id);
    setDeclineReason("");
    setIsDeclineModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRegId) return;
    const id = selectedRegId;
    setIsDeleteModalOpen(false);

    try {
      const res = await fetch(`/api/registrations/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        setRegistrations((prev) => {
          const next = prev.filter((r) => r._id.toString() !== id);
          return next;
        });
        router.refresh();
      } else {
        showAlert("Error", data.error || "Failed to remove registration", "error");
      }
    } catch (err) {
      showAlert("Error", "Error removing registration", "error");
    } finally {
      setDeletingId(null);
      setSelectedRegId(null);
    }
  };

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
        showAlert("Action Failed", data.error || "Failed to approve", "error");
      }
    } catch {
      showAlert("System Error", "An error occurred", "error");
    } finally {
      setApprovingId(null);
    }
  };

  const handleDeclineConfirm = async () => {
    if (!selectedRegId || !declineReason.trim()) return;
    const id = selectedRegId;
    const reason = declineReason;
    setIsDeclineModalOpen(false);

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
        showAlert("Action Failed", data.error || "Failed to decline", "error");
      }
    } catch {
      showAlert("System Error", "An error occurred during decline", "error");
    } finally {
      setDecliningId(null);
      setSelectedRegId(null);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl shadow-lg p-6 transition-colors">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-foreground text-center md:text-left">Recent Registrations</h3>
      </div>

      <div className="md:hidden mb-4 p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl text-center">
        <p className="text-[10px] font-bold text-amber-500/80 uppercase tracking-widest">
          Tap any row to see full details
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8 bg-muted/30 p-4 rounded-2xl border border-border/50">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-amber-500 transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative group min-w-[140px]">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-amber-500 transition-colors">
              <Filter size={16} />
            </div>
            <select
              value={searchParamValues.status}
              onChange={(e) => updateSearchParam("status", e.target.value)}
              className="w-full pl-10 pr-8 py-3 bg-card border border-border rounded-xl text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all appearance-none"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid Only</option>
              <option value="pending">Pending Only</option>
              <option value="declined">Declined Only</option>
            </select>
          </div>

          <div className="relative group min-w-[140px]">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-amber-500 transition-colors">
              <Ticket size={16} />
            </div>
            <select
              value={searchParamValues.ticketType}
              onChange={(e) => updateSearchParam("ticketType", e.target.value)}
              className="w-full pl-10 pr-8 py-3 bg-card border border-border rounded-xl text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all appearance-none"
            >
              <option value="all">All Tickets</option>
              <option value="single">Single</option>
              <option value="couple">Couple</option>
              <option value="merch">Merch Only</option>
            </select>
          </div>
        </div>
      </div>

      {currentPage.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-muted/20 rounded-2xl border border-dashed border-border/50">
          <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4 text-muted-foreground">
            <Search size={32} />
          </div>
          <p className="text-foreground font-bold">No matching registrations found</p>
          <p className="text-muted-foreground text-sm mt-1">Try adjusting your search or filters to find what you're looking for.</p>
          {(searchParamValues.search || searchParamValues.status !== "all" || searchParamValues.ticketType !== "all") && (
            <button 
              onClick={() => {
                setSearchTerm("");
                router.push(pathname);
              }}
              className="mt-6 text-xs font-black uppercase tracking-widest text-amber-500 hover:text-amber-400 transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="relative group/table">
            <div className="overflow-x-auto custom-scrollbar pb-2">
              <table className="w-full text-left text-sm text-muted-foreground min-w-[800px] md:min-w-0">
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
                        onClick={() => {
                          setDetailReg(reg);
                          setIsDetailModalOpen(true);
                        }}
                        className="border-b border-border/50 hover:bg-accent/30 transition-colors cursor-pointer group/row"
                      >
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
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-xs transition-colors ${
                            reg.ticketType === "none"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20"
                              : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                          }`}>
                            {reg.ticketType === "none" ? "🛍️ Merch Only" : reg.ticketType}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono">
                          ₦{reg.totalAmount.toLocaleString()}
                        </td>
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
                            {reg.status === "declined" && reg.declineReason && (
                              <span className="text-[10px] text-red-400/70 italic leading-tight max-w-[140px]">
                                {reg.declineReason}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(reg.createdAt)}
                        </td>
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
                            <AIVerificationBadge 
                              result={reg.aiVerificationResult} 
                              status={reg.status} 
                            />
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
                                  onClick={() => handleDeclineClick(id)}
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
                                onClick={() => handleDeleteClick(id)}
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
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => updateSearchParam("page", Math.max(0, validPage - 1).toString())}
                disabled={validPage === 0}
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
                    onClick={() => updateSearchParam("page", i.toString())}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                      i === validPage
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
                onClick={() => updateSearchParam("page", Math.min(totalPages - 1, validPage + 1).toString())}
                disabled={validPage === totalPages - 1}
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

      {/* Custom Modals */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Remove Registration?"
        message="Are you sure you want to remove this registration? The user will be notified via email about the incomplete transaction."
        confirmText="Remove"
        isLoading={deletingId === selectedRegId && deletingId !== null}
      />

      <PromptModal
        isOpen={isDeclineModalOpen}
        onClose={() => setIsDeclineModalOpen(false)}
        onConfirm={handleDeclineConfirm}
        title="Decline Receipt"
        message="Please provide a reason for declining this payment receipt. This will be sent to the user."
        inputValue={declineReason}
        onInputChange={setDeclineReason}
        placeholder="e.g. Amount mismatch, blurry receipt, incorrect account details..."
        isLoading={decliningId === selectedRegId && decliningId !== null}
      />

      <AlertModal
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        title={alertConfig.title}
        message={alertConfig.message}
        variant={alertConfig.variant}
      />

      <RegistrationDetailModal 
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        registration={detailReg}
      />
    </div>
  );
}