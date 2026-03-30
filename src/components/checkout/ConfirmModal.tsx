import { Loader2, AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  isPaying: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isPaying,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>

        <h3 className="text-2xl font-bold text-white mb-2">Important Notice</h3>
        <p className="text-neutral-300 mb-6 leading-relaxed">
          You are about to be redirected to Paystack securely.{" "}
          <strong className="text-amber-400">
            Do not refresh or close the page
          </strong>{" "}
          while processing your payment.
          <br />
          <br />
          If making a bank transfer, ensure you transfer the{" "}
          <strong className="text-white">exact amount</strong> shown.
        </p>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPaying}
            className="flex-1 py-3 px-4 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPaying}
            className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl flex justify-center items-center transition-colors disabled:opacity-50"
          >
            {isPaying ? (
              <Loader2 className="animate-spin h-5 w-5 text-black" />
            ) : (
              "Continue to Pay"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
