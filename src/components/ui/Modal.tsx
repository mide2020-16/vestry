"use client";

import { X, AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react";
import { useEffect } from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
}: ConfirmationModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              variant === "danger" ? "bg-red-500/10 text-red-500" : 
              variant === "warning" ? "bg-amber-500/10 text-amber-500" : 
              "bg-blue-500/10 text-blue-500"
            }`}>
              <AlertTriangle size={24} />
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground"
            >
              <X size={20} />
            </button>
          </div>

          <h3 className="text-xl font-black text-foreground mb-2">{title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{message}</p>
        </div>

        <div className="p-6 bg-muted/30 border-t border-border flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-border text-xs font-black uppercase tracking-widest hover:bg-card transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
              variant === "danger" ? "bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-500/20" : 
              variant === "warning" ? "bg-amber-500 text-black hover:bg-amber-400 shadow-lg shadow-amber-500/20" : 
              "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20"
            }`}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

interface PromptModalProps extends ConfirmationModalProps {
  inputValue: string;
  onInputChange: (val: string) => void;
  placeholder?: string;
  label?: string;
}

export function PromptModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Submit",
  cancelText = "Cancel",
  variant = "info",
  isLoading = false,
  inputValue,
  onInputChange,
  placeholder = "Enter reason...",
  label = "Reason",
}: PromptModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground"
            >
              <X size={20} />
            </button>
          </div>

          <h3 className="text-xl font-black text-foreground mb-2">{title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">{message}</p>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">
              {label}
            </label>
            <textarea
              autoFocus
              className="w-full bg-muted/50 border border-border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all min-h-[100px] resize-none"
              placeholder={placeholder}
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
            />
          </div>
        </div>

        <div className="p-6 bg-muted/30 border-t border-border flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-border text-xs font-black uppercase tracking-widest hover:bg-card transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading || !inputValue.trim()}
            className="flex-1 py-3 px-4 rounded-xl bg-amber-500 text-black text-xs font-black uppercase tracking-widest hover:bg-amber-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  variant = "info",
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  variant?: "success" | "error" | "info";
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-sm bg-card border border-border rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 text-center">
          <div className={`w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center ${
            variant === "success" ? "bg-emerald-500/10 text-emerald-500" : 
            variant === "error" ? "bg-red-500/10 text-red-500" : 
            "bg-blue-500/10 text-blue-500"
          }`}>
             {variant === "success" ? <CheckCircle size={32} /> : 
              variant === "error" ? <XCircle size={32} /> : 
              <Info size={32} />}
          </div>

          <h3 className="text-2xl font-black text-foreground mb-2">{title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{message}</p>
        </div>

        <div className="p-6 bg-muted/30 border-t border-border">
          <button
            onClick={onClose}
            className="w-full py-4 px-4 rounded-2xl bg-foreground text-background text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

// Icons imported at top
