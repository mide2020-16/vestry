/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { X, Calendar, Mail, User, Ticket, CreditCard, ShoppingBag, Utensils, GlassWater, Hash, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { formatDate } from "@/lib/utils";

interface RegistrationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: any;
}

export function RegistrationDetailModal({
  isOpen,
  onClose,
  registration,
}: RegistrationDetailModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !registration) return null;


  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case "declined": return "text-red-500 bg-red-500/10 border-red-500/20";
      default: return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/80 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl h-full md:h-auto md:max-h-[90vh] bg-card border-x md:border border-border md:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 md:p-8 flex items-center justify-between border-b border-border sticky top-0 bg-card/80 backdrop-blur-md z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <User size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">{registration.name}</h3>
                <p className="text-xs text-muted-foreground font-mono">{registration._id?.toString()}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-muted rounded-2xl transition-all active:scale-95 text-muted-foreground hover:text-foreground"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
            {/* Quick Status */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatusItem 
                label="Status" 
                value={registration.status?.toUpperCase() || "PENDING"} 
                className={getStatusColor(registration.status || "pending")}
              />
              <StatusItem 
                label="Ticket" 
                value={registration.ticketType?.toUpperCase() || "NONE"} 
                className="bg-blue-500/10 text-blue-500 border-blue-500/20"
              />
              <StatusItem 
                label="Payment" 
                value={registration.paymentMethod?.toUpperCase() || "N/A"} 
                className="bg-purple-500/10 text-purple-500 border-purple-500/20"
              />
              <StatusItem 
                label="Amount" 
                value={`₦${registration.totalAmount?.toLocaleString()}`} 
                className="bg-amber-500/10 text-amber-500 border-amber-500/20"
              />
            </div>

            {/* Main Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <SectionTitle icon={Calendar} title="Details" />
                <div className="space-y-4">
                  <DetailItem label="Full Name" value={registration.name} icon={User} />
                  {registration.partnerName && (
                    <DetailItem label="Partner Name" value={registration.partnerName} icon={User} />
                  )}
                  <DetailItem label="Email Address" value={registration.email} icon={Mail} />
                  <DetailItem label="Registered On" value={formatDate(registration.createdAt)} icon={Calendar} />
                </div>
              </div>

              <div className="space-y-6">
                <SectionTitle icon={CreditCard} title="Payment Info" />
                <div className="space-y-4">
                  <DetailItem label="Method" value={registration.paymentMethod || "Not specified"} icon={CreditCard} />
                  <DetailItem 
                    label="Status" 
                    value={registration.paymentStatus === true || registration.paymentStatus === "success" ? "Verified" : "Pending Verification"} 
                    icon={CheckCircle2} 
                  />
                  {registration.paystackReference && (
                    <DetailItem label="Ref" value={registration.paystackReference} icon={Hash} />
                  )}
                  {registration.paymentReceiptUrl && (
                    <a 
                      href={registration.paymentReceiptUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center gap-3 p-3 bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/20 rounded-2xl transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ShoppingBag size={14} />
                      </div>
                      <span className="text-xs font-bold text-blue-500">View Payment Receipt</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* AI Verification */}
            {registration.aiVerificationResult && (
              <div className="p-6 bg-muted/30 border border-border rounded-[2rem] space-y-4">
                <div className="flex items-center justify-between">
                  <SectionTitle icon={AlertCircle} title="AI Verification (Gemini)" />
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${registration.aiVerificationResult.verified ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                    {registration.aiVerificationResult.verified ? 'VERIFIED' : 'FAILED'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DetailItem label="Confidence" value={registration.aiVerificationResult.confidence?.toUpperCase()} icon={Hash} />
                  <DetailItem label="Extracted Amt" value={`₦${registration.aiVerificationResult.extractedAmount?.toLocaleString() || 0}`} icon={Hash} />
                  <DetailItem label="Bank" value={registration.aiVerificationResult.extractedBank || "Unknown"} icon={Hash} />
                  <DetailItem label="Account" value={registration.aiVerificationResult.extractedAccountName || "Unknown"} icon={Hash} />
                </div>
                {registration.aiVerificationResult.reason && (
                  <p className="text-xs text-muted-foreground italic bg-background/50 p-3 rounded-xl border border-border">
                    &ldquo;{registration.aiVerificationResult.reason}&rdquo;
                  </p>
                )}
              </div>
            )}

            {/* Selections */}
            <div className="space-y-6">
              <SectionTitle icon={ShoppingBag} title="Product Selections" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Merch */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Merchandise</h4>
                  <div className="space-y-2">
                    {registration.merch && registration.merch.length > 0 ? (
                      registration.merch.map((item: any, i: number) => (
                        <div key={i} className="p-4 bg-background border border-border rounded-2xl flex items-center justify-between gap-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold">{item.name || item.productId?.name}</span>
                            <span className="text-[10px] text-muted-foreground uppercase">Qty: {item.quantity} | Size: {item.size || 'N/A'}</span>
                            {item.inscriptions && <span className="text-[10px] text-amber-500 italic mt-1">&quot;{item.inscriptions}&quot;</span>}
                          </div>
                          {item.color && (
                            <div className="w-6 h-6 rounded-full border border-border" style={{ backgroundColor: item.color }} />
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground italic p-4 bg-muted/20 rounded-2xl border border-dashed border-border">No merchandise selected</p>
                    )}
                  </div>
                </div>

                {/* Others */}
                <div className="space-y-4">
                   <div className="space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Hospitality</h4>
                      <div className="grid grid-cols-1 gap-2">
                        <SelectionBox icon={Utensils} label="Food" value={registration.foodSelections?.length ? `${registration.foodSelections.length} Items Selected` : "None"} />
                        <SelectionBox icon={GlassWater} label="Drink" value={registration.drinkSelection ? "Selected" : "None"} />
                      </div>
                   </div>
                </div>
              </div>
            </div>

            {/* Decline Reason */}
            {registration.status === 'declined' && registration.declineReason && (
              <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-[2rem] space-y-2">
                <SectionTitle icon={X} title="Decline Reason" className="text-red-500" />
                <p className="text-sm text-red-400 leading-relaxed italic">&ldquo;{registration.declineReason}&rdquo;</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 md:p-8 bg-muted/30 border-t border-border flex justify-end">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-foreground text-background rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-foreground/10"
            >
              Close Details
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function StatusItem({ label, value, className }: { label: string; value: string; className: string }) {
  return (
    <div className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center gap-1 ${className}`}>
      <span className="text-[8px] font-black uppercase tracking-widest opacity-60">{label}</span>
      <span className="text-xs font-black">{value}</span>
    </div>
  );
}

function SectionTitle({ icon: Icon, title, className = "" }: { icon: any; title: string; className?: string }) {
  return (
    <div className={`flex items-center gap-2 mb-2 ${className}`}>
      <Icon size={16} className="text-amber-500" />
      <h4 className="text-xs font-black uppercase tracking-widest">{title}</h4>
    </div>
  );
}

function DetailItem({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground shrink-0">
        <Icon size={14} />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{label}</p>
        <p className="text-sm font-bold text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}

function SelectionBox({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-muted/50 border border-border rounded-2xl">
      <Icon size={16} className="text-muted-foreground" />
      <div className="flex-1">
        <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">{label}</p>
        <p className="text-xs font-bold truncate">{value}</p>
      </div>
    </div>
  )
}
