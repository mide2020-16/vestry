interface StatCardProps {
  label: string;
  accentColor: string;
  children: React.ReactNode;
}

export function StatCard({ label, accentColor, children }: StatCardProps) {
  return (
    <div className="bg-card border border-border p-6 rounded-2xl shadow-lg relative overflow-hidden transition-colors">
      <div
        className={`absolute -right-4 -top-4 w-24 h-24 ${accentColor} rounded-full blur-2xl pointer-events-none`}
      />
      <h3 className="text-muted-foreground text-sm font-medium mb-2 uppercase tracking-wider">
        {label}
      </h3>
      {children}
    </div>
  );
}

interface SplitStatProps {
  left: { value: string | number; label: string; className?: string };
  right: { value: string | number; label: string; className?: string };
}

export function SplitStat({ left, right }: SplitStatProps) {
  return (
    <div className="flex gap-4">
      <div>
        <p className={`text-2xl font-black text-foreground ${left.className ?? ""}`}>
          {left.value}
        </p>
        <p className="text-xs text-muted-foreground">{left.label}</p>
      </div>
      <div className="w-px bg-border" />
      <div>
        <p
          className={`text-2xl font-black text-foreground ${right.className ?? ""}`}
        >
          {right.value}
        </p>
        <p className="text-xs text-muted-foreground">{right.label}</p>
      </div>
    </div>
  );
}

