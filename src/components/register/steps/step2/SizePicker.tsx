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
    <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-3">
      <div className="flex items-center justify-between mb-3">
        <p className="text-white/50 text-[10px] uppercase tracking-widest">
          Size
        </p>
        {meshSize && (
          <p className="text-amber-400/70 text-[10px] font-medium">
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
            className={`min-w-10 h-9 px-2 rounded-lg text-xs font-semibold transition-all duration-150
              ${
                meshSize === size
                  ? "bg-amber-400 text-black shadow-[0_0_10px_rgba(251,191,36,0.4)]"
                  : "bg-white/5 border border-white/15 text-white/50 hover:border-white/30 hover:text-white/80"
              }`}
          >
            {size}
          </button>
        ))}
      </div>
      {!meshSize && (
        <p className="text-white/25 text-[10px] mt-2">Please select a size</p>
      )}
    </div>
  );
}
