/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Download, 
  ChevronLeft,
  ArrowUpRight,
  ArrowDownRight,
  Ticket
} from "lucide-react";
import { Spinner } from "@/components/admin/settings/SettingsUI";
import Link from "next/link";

export default function SuperAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/super/analytics")
      .then(r => r.json())
      .then(res => {
        if (res.success) setData(res.data);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) return <div className="py-20 text-center"><Spinner /></div>;
  if (!data) return <div className="py-20 text-center text-muted-foreground">No data available</div>;

  const { revenueOverTime, registrationsOverTime, eventBreakdown, ticketDistribution } = data;

  return (
    <div className="space-y-10 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/super" className="p-3 bg-muted rounded-2xl hover:bg-muted/80 transition-all">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h2 className="text-3xl font-black tracking-tight uppercase">Global <span className="text-amber-500">Analytics</span></h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Comprehensive performance metrics</p>
          </div>
        </div>
        
        <button className="px-6 py-3 bg-foreground text-background rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-foreground/10">
          <Download size={16} /> Export Data
        </button>
      </div>

      {/* High Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <BigStat label="Average Revenue / Event" value={`₦${(eventBreakdown.reduce((acc: any, e: any) => acc + e.revenue, 0) / eventBreakdown.length).toLocaleString()}`} icon={TrendingUp} color="text-amber-500" />
         <BigStat label="Total Registrations" value={registrationsOverTime.reduce((acc: any, d: any) => acc + d.count, 0)} icon={Users} color="text-blue-500" />
         <BigStat label="Active Conversion Rate" value={`${Math.round((eventBreakdown.reduce((acc: any, e: any) => acc + e.paid, 0) / eventBreakdown.reduce((acc: any, e: any) => acc + e.registrations, 0)) * 100)}%`} icon={ArrowUpRight} color="text-emerald-500" />
      </div>

      {/* Main Charts Mocked (CSS Based) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card border border-border rounded-[2.5rem] p-8 space-y-6">
           <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
             <TrendingUp size={18} className="text-amber-500" /> Revenue Trend (Last 30 Days)
           </h3>
           <div className="h-64 flex items-end gap-1 px-2 border-b border-l border-border/50">
             {revenueOverTime.slice(-15).map((d: any) => (
               <div 
                 key={d._id} 
                 className="flex-1 bg-amber-500/80 rounded-t-lg hover:bg-amber-400 transition-all group relative cursor-help"
                 style={{ height: `${Math.max((d.total / Math.max(...revenueOverTime.map((x: any) => x.total))) * 100, 5)}%` }}
               >
                 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-foreground text-background text-[8px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                   ₦{d.total.toLocaleString()}
                 </div>
               </div>
             ))}
           </div>
           <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-muted-foreground/60 px-2">
             <span>{revenueOverTime[0]?._id}</span>
             <span>Today</span>
           </div>
        </div>

        <div className="bg-card border border-border rounded-[2.5rem] p-8 space-y-6">
           <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
             <Ticket size={18} className="text-blue-500" /> Ticket Type Distribution
           </h3>
           <div className="space-y-4">
             {ticketDistribution.map((t: any) => (
               <div key={t._id} className="space-y-2">
                 <div className="flex justify-between items-center">
                   <span className="text-xs font-bold uppercase">{t._id}</span>
                   <span className="text-xs font-mono font-bold text-muted-foreground">{t.count}</span>
                 </div>
                 <div className="h-3 bg-muted rounded-full overflow-hidden border border-border/50">
                   <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ width: `${(t.count / registrationsOverTime.reduce((acc: any, d: any) => acc + d.count, 0)) * 100}%` }} 
                   />
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="p-8 border-b border-border">
          <h3 className="text-xl font-black uppercase tracking-widest">Detailed Event Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Event</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Registrations</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Paid %</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Net Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {eventBreakdown.map((event: any, i: number) => (
                <tr key={i} className="hover:bg-muted/20 transition-colors">
                  <td className="px-8 py-6 font-bold text-sm">{event.name}</td>
                  <td className="px-8 py-6 text-center font-mono font-bold">{event.registrations}</td>
                  <td className="px-8 py-6 text-center">
                    <span className="text-xs font-black px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">
                      {Math.round((event.paid / event.registrations) * 100)}%
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right font-mono font-bold text-amber-500">₦{event.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function BigStat({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-card border border-border p-8 rounded-[2.5rem] space-y-3 shadow-sm relative overflow-hidden group">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-current opacity-[0.02] rounded-full blur-2xl" />
      <div className={`p-2 w-fit rounded-xl bg-muted/50 ${color}`}>
        <Icon size={18} />
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{label}</p>
      <p className="text-3xl font-black tracking-tighter">{value}</p>
    </div>
  );
}
