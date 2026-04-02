"use client";

interface ColorPickerProps {
  meshColor: string;
  setmeshColor: (c: string) => void;
  colors: { label: string; value: string }[];
}

export default function ColorPicker({
  meshColor,
  setmeshColor,
  colors,
}: ColorPickerProps) {
  const activeLabel = colors?.find((c) => c.value === meshColor)?.label;

  return (
    <div className="bg-card border border-border rounded-xl px-3 py-3 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="text-muted-foreground text-[10px] uppercase tracking-widest">
          Color
        </p>
        <p className="text-amber-600 dark:text-amber-400/70 text-[10px] font-medium">
          {activeLabel}
        </p>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {colors?.map((c) => (
          <button
            type="button"
            key={c.value}
            title={c.label}
            onClick={() => setmeshColor(c.value)}
            aria-pressed={meshColor === c.value}
            style={{ backgroundColor: c.value }}
            className={`w-9 h-9 rounded-full border-2 transition-all duration-150
              ${
                meshColor === c.value
                  ? "border-amber-400 scale-110 shadow-[0_0_10px_rgba(251,191,36,0.55)]"
                  : "border-border hover:border-foreground/20 hover:scale-105"
              }`}
          />
        ))}
      </div>
    </div>
  );
}
