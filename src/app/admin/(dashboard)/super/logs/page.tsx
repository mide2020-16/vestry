/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { 
  Clock, 
  ChevronLeft,
  Search,
  Filter,
  User,
  Activity,
  AlertCircle,
  Shield,
  ShoppingBag,
  Globe,
  Monitor
} from "lucide-react";
import { Spinner } from "@/components/admin/settings/SettingsUI";
import Link from "next/link";

export default function SuperLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetch(`/api/super/logs?page=${page}&type=${filter}`)
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setLogs(res.data);
          setPagination(res.pagination);
        }
        setIsLoading(false);
      });
  }, [page, filter]);

  if (isLoading) return <div className="py-20 text-center"><Spinner /></div>;

  return (
    <div className="space-y-10 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/super" className="p-3 bg-muted rounded-2xl hover:bg-muted/80 transition-all">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h2 className="text-3xl font-black tracking-tight uppercase italic">Advanced <span className="text-amber-500">Activity Logs</span></h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Tracking Admins, Consumers, and System Actions</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <LogStat label="Total Events" value={pagination?.total || 0} icon={Clock} color="text-amber-500" />
         <LogStat label="Admin Actions" value={logs.filter(l => l.userType === 'ADMIN').length} icon={Shield} color="text-blue-500" />
         <LogStat label="Consumer Activity" value={logs.filter(l => l.userType === 'CONSUMER').length} icon={ShoppingBag} color="text-emerald-500" />
         <LogStat label="System Logs" value={logs.filter(l => l.userType === 'SYSTEM').length} icon={Monitor} color="text-purple-500" />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
           <input 
             type="text" 
             placeholder="Search activity by user, action or resource..." 
             className="w-full bg-card border border-border rounded-2xl pl-12 pr-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
           />
        </div>
        <div className="flex gap-2 p-1 bg-muted rounded-2xl border border-border overflow-x-auto">
          {["ALL", "ADMIN", "CONSUMER", "SYSTEM"].map((t) => (
            <button
              key={t}
              onClick={() => { setFilter(t); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === t ? 'bg-card shadow-sm text-amber-500' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
        {logs.length === 0 ? (
          <div className="py-20 text-center space-y-4">
             <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                <AlertCircle size={32} />
             </div>
             <h3 className="text-xl font-black">No Activity Found</h3>
             <p className="text-muted-foreground max-w-xs mx-auto text-sm">Activity will appear here as users and admins interact with the platform.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">User / Type</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Action</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Resource</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Details</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log: any) => (
                  <tr key={log._id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getTypeBg(log.userType)}`}>
                          {getTypeIcon(log.userType)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold">{log.userName || "Anonymous"}</span>
                          <span className="text-[9px] text-muted-foreground font-mono truncate max-w-[120px]">{log.userEmail || log.sessionId || "No Identity"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                       <span className={`px-2 py-0.5 rounded-md text-[9px] font-black tracking-widest ${getActionColor(log.action)}`}>
                         {log.action}
                       </span>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-2">
                          <Activity size={12} className="text-amber-500" />
                          <span className="text-xs font-bold uppercase tracking-tight">{log.resource}</span>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <p className="text-xs text-muted-foreground italic truncate max-w-xs">&ldquo;{log.details}&rdquo;</p>
                    </td>
                    <td className="px-8 py-5 text-right whitespace-nowrap">
                       <span className="text-[10px] font-mono text-muted-foreground/60">{new Date(log.createdAt).toLocaleString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-4">
           <button 
             disabled={page === 1}
             onClick={() => setPage(page - 1)}
             className="px-6 py-2 bg-card border border-border rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30"
           >
             Prev
           </button>
           <span className="text-xs font-black">{page} / {pagination.pages}</span>
           <button 
             disabled={page === pagination.pages}
             onClick={() => setPage(page + 1)}
             className="px-6 py-2 bg-card border border-border rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30"
           >
             Next
           </button>
        </div>
      )}
    </div>
  );
}

function LogStat({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-card border border-border p-4 rounded-3xl space-y-2">
      <div className={`p-2 w-fit rounded-lg bg-muted ${color}`}>
        <Icon size={14} />
      </div>
      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">{label}</p>
      <p className="text-xl font-black">{value}</p>
    </div>
  );
}

function getTypeIcon(type: string) {
  switch (type) {
    case "ADMIN": return <Shield size={12} />;
    case "CONSUMER": return <ShoppingBag size={12} />;
    case "SYSTEM": return <Monitor size={12} />;
    default: return <User size={12} />;
  }
}

function getTypeBg(type: string) {
  switch (type) {
    case "ADMIN": return "bg-blue-500/10 text-blue-500";
    case "CONSUMER": return "bg-emerald-500/10 text-emerald-500";
    case "SYSTEM": return "bg-purple-500/10 text-purple-500";
    default: return "bg-muted text-muted-foreground";
  }
}

function getActionColor(action: string) {
  switch (action) {
    case "CREATE": return "bg-emerald-500/10 text-emerald-500";
    case "DELETE": return "bg-red-500/10 text-red-500";
    case "UPDATE": return "bg-blue-500/10 text-blue-500";
    case "APPROVE_PAYMENT": return "bg-emerald-500/10 text-emerald-500";
    case "DECLINE_PAYMENT": return "bg-amber-500/10 text-amber-500";
    case "SUBMIT_REGISTRATION": return "bg-emerald-500/10 text-emerald-500";
    case "VIEW_EVENT": return "bg-blue-500/10 text-blue-500";
    default: return "bg-muted text-muted-foreground";
  }
}
