"use client";

interface SizePickerProps {
  meshSize: string | null;
  setMeshSize: (s: string) => void;
  sizes: string[];
}

export default function SizePicker({
  meshSize,
  setMeshSize,
  sizes,
}: SizePickerProps) {
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-3 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-500/60">
          Size
        </span>
        <div className="flex-1 h-px bg-border/50" />
        {meshSize && (
          <p className="text-amber-600 dark:text-amber-400/70 text-[10px] font-medium">
            {meshSize}
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {sizes?.map((size) => (
          <button
            type="button"
            key={size}
            onClick={() => setMeshSize(size)}
            aria-pressed={meshSize === size}
            className={`group relative flex items-center justify-center min-w-10 h-9 px-4 rounded-xl border transition-all duration-200 ${
              meshSize === size
                ? "border-amber-500 bg-amber-500/10 text-foreground shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                : "border-border bg-card text-muted-foreground hover:border-border/60 hover:bg-accent/40"
            }`}
          >
            {size}
          </button>
        ))}
      </div>
      {!meshSize && (
        <p className="text-muted-foreground/40 text-[10px] mt-2">Please select a size</p>
      )}
    </div>
  );
}
