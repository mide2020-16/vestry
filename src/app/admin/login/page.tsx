/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Eye, EyeOff, ShieldCheck, ArrowLeft, Key } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { SimpleInput } from "@/components/ui/Input";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    twoFactorCode: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
        twoFactorCode: formData.twoFactorCode,
      });

      if (result?.error) {
        if (result.error.includes("2FA_REQUIRED")) {
          setShow2FA(true);
        } else if (result.error.includes("INVALID_2FA")) {
          setError("Invalid authentication code");
        } else {
          setError("Invalid email or password");
        }
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden transition-colors">
      {/* Architectural background lines */}
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden>
        <div className="absolute top-0 left-1/4 w-px h-full bg-foreground/4" />
        <div className="absolute top-0 left-2/4 w-px h-full bg-white/4" />
        <div className="absolute top-0 left-3/4 w-px h-full bg-white/4" />
        <div className="absolute top-1/3 left-0 w-full h-px bg-white/4" />
        <div className="absolute top-2/3 left-0 w-full h-px bg-white/4" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-amber-500/4 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="h-px bg-linear-to-r from-transparent via-amber-400 to-transparent mb-12" />

        <AnimatePresence mode="wait">
          {!show2FA ? (
            <motion.div 
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="mb-12">
                <p className="text-amber-400 text-[10px] font-bold tracking-[0.4em] uppercase mb-3">
                  Identity Verification
                </p>
                <h1 className="text-foreground font-black uppercase leading-none tracking-[0.15em] text-4xl mb-4">
                  Login
                </h1>
                <p className="text-muted-foreground/50 text-sm leading-relaxed">
                  Access your dashboard and manage your events.
                </p>
              </div>

              {message && (
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs p-4 rounded-xl mb-6">
                  {message}
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-4 rounded-xl mb-6">
                  {error}
                </div>
              )}

              <form name="login" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1.5 block px-1">
                    Email Address
                  </label>
                  <SimpleInput
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    required
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5 px-1">
                    <label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                      Password
                    </label>
                    <Link href="/admin/forgot-password" size="xs" className="text-[9px] font-bold text-amber-500/60 hover:text-amber-500 transition-colors uppercase tracking-widest">
                      Forgot Key?
                    </Link>
                  </div>
                  <div className="relative group/pass">
                    <SimpleInput
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      placeholder="••••••••"
                      className="pr-12"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground/40 hover:text-amber-500 transition-colors focus:outline-none"
                    >
                      <AnimatePresence mode="wait">
                        {showPassword ? (
                          <motion.div key="hide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <EyeOff size={18} />
                          </motion.div>
                        ) : (
                          <motion.div key="show" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <Eye size={18} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  isLoading={isLoading}
                  variant="secondary"
                  className="w-full py-4"
                >
                  Authorize Access
                </Button>
              </form>

              <div className="flex items-center gap-4 my-8">
                <div className="flex-1 h-px bg-border" />
                <span className="text-muted-foreground/40 text-xs tracking-widest uppercase">Or</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <Button
                variant="outline"
                className="w-full py-4"
                onClick={() => signIn("google", { callbackUrl: "/admin" })}
                leftIcon={
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z" />
                    <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.777l-4.04 3.095C3.196 21.298 7.27 24 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z" />
                    <path fill="#4A90D9" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z" />
                    <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z" />
                  </svg>
                }
              >
                Continue with Google
              </Button>
            </motion.div>
          ) : (
            <motion.div 
              key="2fa"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="mb-12">
                <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mb-6">
                  <ShieldCheck size={24} />
                </div>
                <p className="text-amber-400 text-[10px] font-bold tracking-[0.4em] uppercase mb-3">
                  Two-Factor Shield
                </p>
                <h1 className="text-foreground font-black uppercase leading-none tracking-[0.15em] text-4xl mb-4">
                  Verify
                </h1>
                <p className="text-muted-foreground/50 text-sm leading-relaxed">
                  Enter the 6-digit code from your authenticator app to authorize this session.
                </p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-4 rounded-xl mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30" size={18} />
                  <input 
                    type="text" 
                    maxLength={6}
                    required
                    placeholder="000000"
                    value={formData.twoFactorCode}
                    onChange={(e) => setFormData({ ...formData, twoFactorCode: e.target.value.replace(/\D/g, '') })}
                    className="w-full bg-card border border-border focus:border-amber-500/50 rounded-xl pl-12 pr-4 py-4 text-2xl font-black tracking-[0.5em] placeholder:tracking-normal placeholder:font-normal transition-all focus:outline-none text-center"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={formData.twoFactorCode.length !== 6}
                  isLoading={isLoading}
                  variant="primary"
                  className="w-full py-4"
                >
                  Verify & Sign In
                </Button>

                <button 
                  type="button"
                  onClick={() => setShow2FA(false)}
                  className="w-full flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                  Back to Credentials
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-sm text-muted-foreground/60 mt-8">
          Don&apos;t have an account?{" "}
          <Link href="/admin/signup" className="text-amber-500 font-bold hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
