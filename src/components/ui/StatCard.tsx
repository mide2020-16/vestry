import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  trend?: string;
  accentColor?: string;
  className?: string;
}

export function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  color = "text-amber-500", 
  trend, 
  accentColor = "bg-muted/50",
  className 
}: StatCardProps) {
  return (
    <div className={cn(
      "bg-card border border-border p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] space-y-4 relative overflow-hidden group hover:border-amber-500/50 transition-all shadow-sm",
      className
    )}>
      <div className="absolute -right-6 -top-6 w-32 h-32 bg-current opacity-[0.03] rounded-full blur-3xl group-hover:opacity-[0.08] transition-opacity" />
      <div className="flex items-center justify-between">
        <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110", accentColor, color)}>
          <Icon size={22} />
        </div>
        {trend && (
          <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/5 px-2 py-1 rounded-full whitespace-nowrap">
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">{label}</p>
        <p className="text-3xl md:text-4xl font-black tracking-tighter truncate">{value}</p>
      </div>
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
      <div className="flex-1">
        <p className={cn("text-2xl md:text-3xl font-black text-foreground truncate", left.className)}>
          {left.value}
        </p>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{left.label}</p>
      </div>
      <div className="w-px bg-border self-stretch" />
      <div className="flex-1 text-right">
        <p className={cn("text-2xl md:text-3xl font-black text-foreground truncate", right.className)}>
          {right.value}
        </p>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{right.label}</p>
      </div>
    </div>
  );
}
