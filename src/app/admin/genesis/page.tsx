"use client";

import { useState } from "react";
import { ShieldAlert, Loader2, CheckCircle2 } from "lucide-react";

export default function GenesisPage() {
  const [email, setEmail] = useState("");
  const [secret, setSecret] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    
    try {
      const res = await fetch("/api/auth/super-upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, secret }),
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to upgrade");
      
      setStatus("success");
      setMessage(data.message);
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 mb-6 border border-amber-500/20">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter italic">
            Genesis <span className="text-amber-500">Access</span>
          </h1>
          <p className="mt-2 text-neutral-500 text-sm">Elevate account to master status.</p>
        </div>

        <form onSubmit={handleUpgrade} className="mt-8 space-y-4">
          <div className="space-y-4 bg-neutral-900/50 p-6 rounded-3xl border border-white/5">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">Account Email</label>
              <input
                type="email"
                required
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-amber-500 outline-none transition-all"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">Genesis Secret</label>
              <input
                type="password"
                required
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-amber-500 outline-none transition-all"
                placeholder="••••••••"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-amber-500 text-black font-black uppercase tracking-widest text-xs py-4 rounded-2xl hover:bg-amber-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {status === "loading" ? <Loader2 className="animate-spin" size={16} /> : "Initiate Elevation"}
          </button>
        </form>

        {status === "success" && (
          <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-400 text-sm">
            <CheckCircle2 size={20} />
            <p>{message}</p>
          </div>
        )}

        {status === "error" && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm text-center">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
