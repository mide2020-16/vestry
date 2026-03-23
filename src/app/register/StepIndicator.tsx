const LABELS = ['Details', 'mesh', 'Food & Drink', 'Review'];

type StepState = 'done' | 'active' | 'upcoming';

function getStepState(step: number, current: number): StepState {
  if (step < current) return 'done';
  if (step === current) return 'active';
  return 'upcoming';
}

const CIRCLE_STYLES: Record<StepState, string> = {
  done:     'bg-amber-400 text-black',
  active:   'bg-amber-400/20 border-2 border-amber-400 text-amber-400',
  upcoming: 'bg-white/5 border border-white/10 text-white/30',
};

const LABEL_STYLES: Record<StepState, string> = {
  done:     'text-amber-400',
  active:   'text-amber-400',
  upcoming: 'text-white/30',
};

interface StepIndicatorProps {
  current: number;
}

export default function StepIndicator({ current }: StepIndicatorProps) {
  return (
    <nav aria-label="Registration steps" className="flex items-center justify-center gap-2 mb-10">
      {LABELS.map((label, i) => {
        const step  = i + 1;
        const state = getStepState(step, current);
        const isLast = i === LABELS.length - 1;

        return (
          <div key={step} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div
                aria-current={state === 'active' ? 'step' : undefined}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${CIRCLE_STYLES[state]}`}
              >
                {state === 'done' ? '✓' : step}
              </div>
              <span className={`text-[10px] ${LABEL_STYLES[state]}`}>
                {label}
              </span>
            </div>

            {!isLast && (
              <div className={`w-10 h-px mb-4 transition-colors ${state === 'done' ? 'bg-amber-400' : 'bg-white/10'}`} />
            )}
          </div>
        );
      })}
    </nav>
  );
}