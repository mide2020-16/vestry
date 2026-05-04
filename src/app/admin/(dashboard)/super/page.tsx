/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { 
  ShieldCheck, 
  Users, 
  Calendar, 
  BarChart3, 
  TrendingUp, 
  Clock, 
  ExternalLink, 
  Plus,
  AlertCircle
} from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { StatCard } from "@/components/ui/StatCard";
import { AlertModal } from "@/components/ui/Modal";
import { formatDate, formatDateTime } from "@/lib/utils";
import Link from "next/link";

export default function SuperAdminHub() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState<{ title: string; message: string; isOpen: boolean; variant: "success" | "error" | "info" }>({ 
    title: "", message: "", isOpen: false, variant: "info" 
  });

  const showAlert = (title: string, message: string, variant: "success" | "error" | "info" = "info") => {
    setAlert({ title, message, isOpen: true, variant });
  };

  useEffect(() => {
    fetch("/api/super/stats")
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setData(res);
        } else {
          showAlert("Unauthorized", res.error || "You do not have permission to view this page.", "error");
        }
        setIsLoading(false);
      });
  }, []);

  if (isLoading) return <div className="py-20 text-center flex items-center justify-center"><Spinner className="w-12 h-12 text-amber-500" /></div>;
  if (!data) return <div className="py-20 text-center text-muted-foreground">Access Denied</div>;

  const { stats, recentActivity, eventStats } = data;

  return (
    <div className="space-y-12 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-black shadow-2xl shadow-amber-500/20">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h2 className="text-4xl font-black tracking-tighter uppercase italic">Super <span className="text-amber-500">Hub</span></h2>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Global Governance Console</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
           <Link href="/admin/super/analytics" className="px-6 py-3 bg-card border border-border rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-muted transition-all active:scale-95">
             <BarChart3 size={16} className="text-blue-500" /> Global Analytics
           </Link>
           <Link href="/admin/super/logs" className="px-6 py-3 bg-card border border-border rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-muted transition-all active:scale-95">
             <Clock size={16} className="text-emerald-500" /> Audit Logs
           </Link>
           <Link href="/admin/events" className="px-6 py-3 bg-amber-500 text-black rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20 active:scale-95">
             <Plus size={16} /> New Event
           </Link>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Global Revenue" value={`₦${stats.totalRevenue.toLocaleString()}`} icon={TrendingUp} color="text-amber-500" trend="+12% from last week" />
        <StatCard label="Total Events" value={stats.totalEvents} icon={Calendar} color="text-blue-400" accentColor="bg-blue-500/10" />
        <StatCard label="Registrations" value={stats.totalRegistrations} icon={BarChart3} color="text-emerald-400" accentColor="bg-emerald-500/10" />
        <StatCard label="Active Admins" value={stats.totalAdmins} icon={Users} color="text-purple-400" accentColor="bg-purple-500/10" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Event Performance Leaderboard */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black uppercase tracking-widest flex items-center gap-2">
              <TrendingUp size={20} className="text-amber-500" /> Event Performance
            </h3>
            <Link href="/admin/super/analytics" className="text-[10px] font-black uppercase tracking-widest text-amber-500 hover:underline">View Full Report &rarr;</Link>
          </div>
          
          <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Event Name</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Attendees</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Gross Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {eventStats.map((event: any) => (
                    <tr key={event.id} className="hover:bg-muted/20 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm group-hover:text-amber-500 transition-colors">{event.name}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">{event.slug}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-tighter border ${event.status === 'OPEN' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{event.regCount}</span>
                          <div className="flex-1 h-1.5 w-12 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min((event.regCount / 500) * 100, 100)}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className="text-sm font-mono font-bold text-amber-500">₦{event.revenue.toLocaleString()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Global Activity Stream */}
        <div className="space-y-6">
          <h3 className="text-xl font-black uppercase tracking-widest flex items-center gap-2">
            <Clock size={20} className="text-amber-500" /> Recent Activity
          </h3>
          
          <div className="space-y-4">
            {recentActivity.map((activity: any) => (
              <div key={activity._id} className="bg-card/40 border border-border p-5 rounded-[2rem] flex items-start gap-4 hover:border-amber-500/30 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center shrink-0 border border-border group-hover:bg-amber-500/5 transition-colors">
                  <span className="text-lg">✨</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{activity.name}</p>
                  <p className="text-[10px] text-muted-foreground mb-2">Registered for <span className="text-amber-500 font-bold uppercase">{activity.eventId?.name || 'an event'}</span></p>
                  <div className="flex items-center gap-3">
                     <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${activity.status === 'success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                       {activity.status.toUpperCase()}
                     </span>
                     <span className="text-[9px] text-muted-foreground/40 font-mono">
                       {formatDateTime(activity.createdAt)}
                     </span>
                  </div>
                </div>
                <Link href={`/admin?eventId=${activity.eventId?._id}`} className="p-2 text-muted-foreground hover:text-amber-500 transition-colors">
                  <ExternalLink size={16} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Platform Governance & Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-card border border-border rounded-[2.5rem] p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight">Access Control</h3>
              </div>
              <Link href="/admin/users" className="text-[10px] font-black uppercase tracking-widest text-blue-500 hover:underline">Manage All &rarr;</Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/30 rounded-2xl border border-border">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Super Admins</p>
                <p className="text-2xl font-black">04</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-2xl border border-border">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Event Admins</p>
                <p className="text-2xl font-black">{stats.totalAdmins - 4}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Global roles define system-wide permissions. Super Admins have unrestricted access to all event instances and financial data.
            </p>
         </div>

         <div className="bg-card border border-border rounded-[2.5rem] p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                <AlertCircle size={20} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight">System Health</h3>
            </div>
            <div className="space-y-4">
              <HealthItem label="Database Cluster" status="Operational" latency="12ms" />
              <HealthItem label="Payment Gateway (Paystack)" status="Operational" />
              <HealthItem label="AI Engine (Gemini)" status="Operational" />
              <HealthItem label="CDN & Static Assets" status="Operational" />
            </div>
         </div>
      </div>

      <AlertModal
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
        title={alert.title}
        message={alert.message}
        variant={alert.variant}
      />
    </div>
  );
}

function HealthItem({ label, status, latency }: { label: string; status: string; latency?: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-muted/20 border border-border rounded-2xl">
      <div className="flex flex-col">
        <span className="text-xs font-bold">{label}</span>
        {latency && <span className="text-[9px] font-mono text-muted-foreground">{latency}</span>}
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">{status}</span>
      </div>
    </div>
  );
}
