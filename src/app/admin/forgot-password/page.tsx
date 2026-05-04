"use client";

import { useState } from "react";
import { Mail, ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { SimpleInput } from "@/components/ui/Input";
import { AlertModal } from "@/components/ui/Modal";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ isOpen: false, title: "", message: "", variant: "info" as any });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setAlert({
          isOpen: true,
          title: "Check Your Email",
          message: "If an account exists for that email, we've sent password reset instructions.",
          variant: "success"
        });
      } else {
        setAlert({
          isOpen: true,
          title: "Error",
          message: data.error || "Something went wrong.",
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
      {/* Architectural background lines - for consistency with login */}
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden>
        <div className="absolute top-0 left-1/4 w-px h-full bg-foreground/4" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-amber-500/4 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card border border-border rounded-[2.5rem] p-8 sm:p-12 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl pointer-events-none" />
        
        <div className="space-y-8 relative z-10">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-amber-500/10 rounded-[2rem] flex items-center justify-center text-amber-500 mx-auto mb-6">
              <Mail size={32} />
            </div>
            <h1 className="text-3xl font-black tracking-tight">Forgot <span className="text-amber-500">Access Key?</span></h1>
            <p className="text-muted-foreground text-sm leading-relaxed">Enter your email and we'll send you a recovery link to reset your administrative credentials.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={18} />
                <SimpleInput 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-14" 
                  placeholder="admin@vestry.com"
                  required 
                />
              </div>
            </div>

            <Button 
              type="submit" 
              isLoading={isLoading}
              variant="primary"
              className="w-full py-4"
              rightIcon={<Send size={18} />}
            >
              Send Recovery Link
            </Button>
          </form>

          <Link 
            href="/admin/login"
            className="flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Login
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
