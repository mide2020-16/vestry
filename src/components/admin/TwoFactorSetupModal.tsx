"use client";

import { useState } from "react";
import { X, ShieldCheck, ShieldAlert, Key, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { SimpleInput } from "@/components/ui/Input";
import { QRCodeSVG } from "qrcode.react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TwoFactorSetupModal({ isOpen, onClose, onSuccess }: Props) {
  const [step, setStep] = useState(1);
  const [setupData, setSetupData] = useState<any>(null);
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const startSetup = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/2fa/setup", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSetupData(data);
        setStep(2);
      }
    } catch (err) {
      setError("Failed to initialize setup.");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyAndEnable = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.success) {
        onSuccess();
        onClose();
      } else {
        setError(data.error || "Invalid code.");
      }
    } catch (err) {
      setError("Network error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(setupData.secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[200] p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8 space-y-8">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">Multi-Factor <span className="text-amber-500">Shield</span></h2>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest opacity-60">Step {step} of 2</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl transition-all text-muted-foreground">
                  <X size={20} />
                </button>
              </div>

              {step === 1 ? (
                <div className="space-y-6">
                  <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-3xl space-y-4">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Enhance your account security by requiring a time-based verification code from your authenticator app (Google Authenticator, Authy, etc.) during login.
                    </p>
                  </div>
                  <Button 
                    onClick={startSetup}
                    isLoading={isLoading}
                    variant="primary"
                    className="w-full py-4"
                    leftIcon={<ShieldCheck size={18} />}
                  >
                    Begin Shield Deployment
                  </Button>
                </div>
              ) : (
                <div className="space-y-8 text-center">
                  <div className="bg-white p-6 rounded-[2rem] inline-block shadow-inner mx-auto ring-8 ring-amber-500/5">
                    <QRCodeSVG value={setupData.otpauth} size={180} />
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">Scan this QR code with your authenticator app or enter the secret key manually:</p>
                    <div className="flex items-center gap-2 p-3 bg-muted/30 border border-border rounded-2xl">
                      <code className="flex-1 text-[10px] font-mono font-bold tracking-widest text-amber-500">{setupData.secret}</code>
                      <button onClick={copyToClipboard} className="p-2 hover:bg-muted rounded-xl transition-all text-muted-foreground">
                        {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={18} />
                      <SimpleInput 
                        type="text" 
                        maxLength={6}
                        placeholder="000000"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                        className="pl-12 h-14 text-center text-2xl font-black tracking-[0.5em] placeholder:tracking-normal placeholder:font-normal" 
                      />
                    </div>
                    {error && <p className="text-xs text-red-500 font-bold flex items-center justify-center gap-2 animate-bounce"><ShieldAlert size={14} /> {error}</p>}
                  </div>

                  <Button 
                    onClick={verifyAndEnable}
                    disabled={code.length !== 6}
                    isLoading={isLoading}
                    variant="secondary"
                    className="w-full py-4"
                    leftIcon={<ShieldCheck size={18} />}
                  >
                    Finalize Authentication
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
