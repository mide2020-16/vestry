"use client";

import { useState } from "react";
import { Key, ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { SecretInput } from "@/components/admin/settings/SettingsUI";
import { Button } from "@/components/ui/Button";
import { AlertModal } from "@/components/ui/Modal";
import { useParams, useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const router = useRouter();
  const [passwords, setPasswords] = useState({ new: "", confirm: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ isOpen: false, title: "", message: "", variant: "info" as any });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setAlert({ isOpen: true, title: "Error", message: "Passwords do not match.", variant: "error" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: passwords.new }),
      });
      const data = await res.json();
      if (data.success) {
        setAlert({
          isOpen: true,
          title: "Success",
          message: "Your password has been reset. You can now login.",
          variant: "success"
        });
        setTimeout(() => router.push("/admin/login"), 2000);
      } else {
        setAlert({
          isOpen: true,
          title: "Error",
          message: data.error || "Invalid or expired token.",
          variant: "error"
        });
      }
    } catch (err) {
      setAlert({ isOpen: true, title: "Error", message: "Network error occurred.", variant: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Architectural background lines */}
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden>
        <div className="absolute top-0 left-1/4 w-px h-full bg-foreground/4" />
        <div className="absolute top-2/3 left-0 w-full h-px bg-white/4" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-card border border-border rounded-[2.5rem] p-8 sm:p-12 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl pointer-events-none" />
        
        <div className="space-y-8 relative z-10">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-blue-500/10 rounded-[2rem] flex items-center justify-center text-blue-400 mx-auto mb-6">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">Reset <span className="text-blue-400">Security Key</span></h1>
            <p className="text-muted-foreground text-sm leading-relaxed">Establish your new administrative credentials to regain access to the platform.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">New Password</label>
                <SecretInput 
                  name="new"
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Confirm New Password</label>
                <SecretInput 
                  name="confirm"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={!passwords.new || passwords.new !== passwords.confirm}
              isLoading={isLoading}
              variant="secondary"
              className="w-full py-4"
              leftIcon={<Key size={18} />}
            >
              Authorize Reset
            </Button>
          </form>

          <Link 
            href="/admin/login"
            className="flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Return to Login
          </Link>
        </div>
      </motion.div>

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
