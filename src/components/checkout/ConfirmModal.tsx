import { AlertTriangle } from "lucide-react";
import { AnimatedAlert, AnimatedSpinner } from "../ui/Boop";

interface ConfirmModalProps {
  isPaying: boolean;
  paymentMethod: "paystack" | "transfer";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isPaying,
  paymentMethod,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md transition-all duration-300">
      <div className="bg-card border border-border rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
        <AnimatedAlert>
          <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-500" />
        </AnimatedAlert>
        </div>

        <h3 className="text-2xl font-bold text-foreground mb-2 tracking-tight">Important Notice</h3>
        <p className="text-muted-foreground mb-6 leading-relaxed text-sm font-medium">
          {paymentMethod === "transfer" ? (
            <>
              You are selecting manual bank transfer. Please ensure you have transferred the exact amount to the displayed Admin Bank Account and uploaded your receipt.
              <br /><br />
              <strong className="text-amber-600 dark:text-amber-400">Do not refresh or close the page</strong> while processing your payment.
            </>
          ) : (
            <>
              You are about to be redirected to Paystack securely.{" "}
              <strong className="text-amber-600 dark:text-amber-400">
                Do not refresh or close the page
              </strong>{" "}
              while processing your payment.
            </>
          )}
        </p>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPaying}
            className="flex-1 py-3 px-4 bg-secondary hover:bg-secondary/80 text-foreground font-bold rounded-xl transition-all disabled:opacity-50 border border-border"
          >
            CANCEL
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPaying}
            className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-amber-950 font-black uppercase text-[11px] tracking-widest rounded-xl flex justify-center items-center transition-all disabled:opacity-50 shadow-lg shadow-amber-500/15"
          >
            {isPaying ? (
              <AnimatedSpinner size={14} />
            ) : (
              paymentMethod === "transfer" ? "Submit for Approval" : "Continue to Pay"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
