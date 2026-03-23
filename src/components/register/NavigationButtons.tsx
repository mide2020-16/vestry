import { TOTAL_STEPS } from "@/app/register/useRegister";

interface NavigationButtonsProps {
  step: number;
  canProceed: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export default function NavigationButtons({
  step,
  canProceed,
  onBack,
  onNext,
  onSubmit,
}: NavigationButtonsProps) {
  return (
    <div className="flex gap-3 mt-10">
      {step > 1 && (
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-4 rounded-2xl border border-white/10 text-white font-medium hover:bg-white/5 transition-all"
        >
          ← Back
        </button>
      )}

      {step < TOTAL_STEPS ? (
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="flex-1 py-4 rounded-2xl bg-amber-400 text-black font-bold text-lg hover:bg-amber-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Continue →
        </button>
      ) : (
        <button
          type="button"
          onClick={onSubmit}
          className="flex-1 py-4 rounded-2xl bg-linear-to-r from-amber-400 to-amber-600 text-black font-bold text-lg hover:from-amber-300 hover:to-amber-500 transition-all shadow-[0_0_20px_rgba(251,191,36,0.2)]"
        >
          Proceed to Payment →
        </button>
      )}
    </div>
  );
}