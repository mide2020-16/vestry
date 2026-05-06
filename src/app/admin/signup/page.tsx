/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, ShieldCheck, Eye, EyeOff, Sparkles, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { SimpleInput } from "@/components/ui/Input";

export default function AdminSignupPage() {
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getPasswordStrength(formData.password);
  
  const strengthConfig = [
    { label: "Very Weak", color: "bg-red-500", width: "w-1/4" },
    { label: "Weak", color: "bg-orange-500", width: "w-2/4" },
    { label: "Good", color: "bg-yellow-500", width: "w-3/4" },
    { label: "Strong", color: "bg-emerald-500", width: "w-full" },
  ];

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
    let pass = "";
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Ensure it has at least one uppercase, one number, and one special char
    if (!/[A-Z]/.test(pass)) pass += "A";
    if (!/[0-9]/.test(pass)) pass += "1";
    if (!/[^A-Za-z0-9]/.test(pass)) pass += "!";
    
    setFormData(prev => ({ ...prev, password: pass, confirmPassword: pass }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      // Success! Redirect to login
      router.push("/admin/login?message=Account created! You can now sign in.");
    } catch (err: any) {
      setError(err.message);
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

        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
             <ShieldCheck size={16} className="text-amber-500" />
             <p className="text-amber-400 text-[10px] font-bold tracking-[0.4em] uppercase">
               Join Vestry
             </p>
          </div>
          <h1 className="text-foreground font-black uppercase leading-none tracking-[0.15em] text-4xl mb-4">
            Create <span className="text-amber-500">Account</span>
          </h1>
          <p className="text-muted-foreground/50 text-sm leading-relaxed">
            Get started with your event management platform.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-4 rounded-xl mb-6 flex items-center gap-3">
            <div className="w-1 h-1 bg-red-500 rounded-full shrink-0" />
            {error}
          </div>
        )}

        <form name="signup" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1.5 block px-1">
              Full Name
            </label>
            <SimpleInput
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => {
                const val = e.target.value;
                const capitalized = val.replace(/\b\w/g, char => char.toUpperCase());
                setFormData({ ...formData, name: capitalized });
              }}
            />
          </div>
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
          <div className="grid grid-cols-1 gap-4">
            <div>
              <div className="flex items-center justify-between px-1 mb-1.5">
                <label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  Password
                </label>
                <button 
                  type="button" 
                  onClick={generatePassword}
                  className="text-[10px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-1 hover:text-amber-400 transition-colors"
                >
                  <Sparkles size={10} /> Suggest Strong
                </button>
              </div>
              <div className="relative group/pass">
                <SimpleInput
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  placeholder="••••••••"
                  className="pr-12"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  onBlur={() => setShowPassword(false)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground/40 hover:text-amber-500 transition-colors focus:outline-none"
                >
                  <AnimatePresence mode="wait">
                    {showPassword ? (
                      <motion.div
                        key="hide"
                        initial={{ opacity: 0, scale: 0.8, rotate: -45 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.8, rotate: 45 }}
                        transition={{ duration: 0.2 }}
                      >
                        <EyeOff size={18} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="show"
                        initial={{ opacity: 0, scale: 0.8, rotate: 45 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.8, rotate: -45 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Eye size={18} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>

              {/* Password Grader */}
              {formData.password && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3 space-y-3"
                >
                  <div className="flex items-center justify-between px-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Strength</p>
                    <p className={`text-[9px] font-black uppercase tracking-widest ${strengthConfig[strength-1]?.color.replace('bg-', 'text-')}`}>
                      {strengthConfig[strength-1]?.label}
                    </p>
                  </div>
                  <div className="h-1 w-full bg-muted rounded-full overflow-hidden flex gap-0.5">
                    {[1, 2, 3, 4].map((step) => (
                      <div 
                        key={step}
                        className={`h-full flex-1 transition-all duration-500 ${
                          step <= strength ? strengthConfig[strength-1].color : "bg-muted-foreground/10"
                        }`}
                      />
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 px-1">
                    <Requirement label="8+ Characters" met={formData.password.length >= 8} />
                    <Requirement label="Uppercase" met={/[A-Z]/.test(formData.password)} />
                    <Requirement label="Number" met={/[0-9]/.test(formData.password)} />
                    <Requirement label="Special Char" met={/[^A-Za-z0-9]/.test(formData.password)} />
                  </div>
                </motion.div>
              )}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1.5 block px-1">
                Confirm Password
              </label>
              <div className="relative group/pass">
                <SimpleInput
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  placeholder="••••••••"
                  className="pr-12"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground/40 hover:text-amber-500 transition-colors focus:outline-none"
                >
                  <AnimatePresence mode="wait">
                    {showConfirmPassword ? (
                      <motion.div
                        key="hide"
                        initial={{ opacity: 0, scale: 0.8, rotate: -45 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.8, rotate: 45 }}
                        transition={{ duration: 0.2 }}
                      >
                        <EyeOff size={18} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="show"
                        initial={{ opacity: 0, scale: 0.8, rotate: 45 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.8, rotate: -45 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Eye size={18} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>

              {/* Password Match Status */}
              <AnimatePresence>
                {formData.confirmPassword && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-2 px-1 flex items-center gap-2"
                  >
                    {formData.password === formData.confirmPassword ? (
                      <>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Passwords Match</span>
                      </>
                    ) : (
                      <>
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Passwords do not match</span>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            variant="secondary"
            className="w-full py-4 mt-2"
            rightIcon={<ArrowRight size={14} />}
          >
            Create Account
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
          Sign Up with Google
        </Button>

        <p className="text-center text-sm text-muted-foreground/60 mt-8">
          Already have an account?{" "}
          <Link href="/admin/login" className="text-amber-500 font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

function Requirement({ label, met }: { label: string; met: boolean }) {
  return (
    <div className="flex items-center gap-1.5 transition-colors">
      <div className={`shrink-0 w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
        met ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-muted/30 border-border/50 text-muted-foreground/30"
      }`}>
        {met ? <Check size={10} strokeWidth={3} /> : <X size={8} strokeWidth={3} />}
      </div>
      <span className={`text-[9px] font-bold uppercase tracking-tight ${met ? "text-foreground" : "text-muted-foreground/40"}`}>
        {label}
      </span>
    </div>
  );
}
