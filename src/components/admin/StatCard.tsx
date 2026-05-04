import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  accentColor: string;
  value?: string;
  color?: string;
  icon?: LucideIcon;
  children?: React.ReactNode;
}

export function StatCard({ label, accentColor, value, color, icon: Icon, children }: StatCardProps) {
  return (
    <div className="bg-card border border-border p-6 rounded-2xl shadow-lg relative overflow-hidden transition-colors">
      <div
        className={`absolute -right-4 -top-4 w-24 h-24 ${accentColor} rounded-full blur-2xl pointer-events-none`}
      />
      
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon className={`w-4 h-4 ${color}`} />}
        <h3 className="text-muted-foreground text-sm font-medium uppercase tracking-wider">
          {label}
        </h3>
      </div>
      
      {value && (
        <p className={`text-3xl font-black ${color || "text-foreground"}`}>
          {value}
        </p>
      )}
      
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

