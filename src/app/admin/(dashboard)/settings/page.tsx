/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Check, X, Mail, ShieldCheck, Plus, Settings, Loader2, Trash2 } from "lucide-react";
import {
  Field,
  LogoField,
  SecretInput,
  Toggle,
  inputCls,
} from "@/components/admin/settings/SettingsUI";
import { useSearchParams } from "next/navigation";
import EventSwitcher from "@/components/admin/EventSwitcher";
import { AlertModal } from "@/components/ui/Modal";
import { motion, AnimatePresence } from "framer-motion";

/* ── Types ───────────────────────────────────────────────────────────────── */

interface TicketType {
  name: string;
  price: number;
  description?: string;
  capacity?: number;
}

interface SettingsForm {
  tenureName: string;
  description: string;
  bannerImageUrl: string;
  ticketTypes: TicketType[];
  paystackPublicKey: string;
  paystackSecretKey: string;
  logoUrl: string;
  registrationEndDate: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  maxFood: number;
  maxDrink: number;
  paystackEnabled: boolean;
  bankTransferEnabled: boolean;
  smtp: {
    host: string;
    port: number;
    user: string;
    pass: string;
    fromName: string;
    fromEmail: string;
  };
}

const DEFAULTS: SettingsForm = {
  tenureName: "",
  description: "",
  bannerImageUrl: "",
  ticketTypes: [{ name: "Standard", price: 0, description: "" }],
  paystackPublicKey: "",
  paystackSecretKey: "",
  logoUrl: "",
  registrationEndDate: "",
  bankName: "",
  accountName: "",
  accountNumber: "",
  maxFood: 2,
  maxDrink: 1,
  paystackEnabled: true,
  bankTransferEnabled: true,
  smtp: {
    host: "",
    port: 465,
    user: "",
    pass: "",
    fromName: "",
    fromEmail: "",
  }
};

export default function AdminSettingsPage() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");
  
  const [activeEventId, setActiveEventId] = useState<string | null>(eventId);
  const [form, setForm] = useState<SettingsForm>(DEFAULTS);
  const [isLoading, setIsLoading] = useState(true);
  const [hasEvents, setHasEvents] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [alert, setAlert] = useState<{ title: string; message: string; isOpen: boolean; variant: "success" | "error" | "info" }>({ title: "", message: "", isOpen: false, variant: "info" });

  const showAlert = (title: string, message: string, variant: "success" | "error" | "info" = "info") => {
    setAlert({ title, message, isOpen: true, variant });
  };

  useEffect(() => {
    setActiveEventId(eventId);
    (async () => {
      try {
        const eventRes = await fetch("/api/events");
        const eventData = await eventRes.json();
        const foundEvents = eventData.success && eventData.data && eventData.data.length > 0;
        setHasEvents(foundEvents);

        if (!foundEvents) {
          setIsLoading(false);
          return;
        }

        const url = eventId ? `/api/settings?eventId=${eventId}` : "/api/settings";
        const res = await fetch(url);
        const data = await res.json();
        if (data.success && data.data) {
          if (data.eventId) setActiveEventId(data.eventId);
          setForm({
            ...DEFAULTS,
            ...data.data,
            registrationEndDate: data.data.registrationEndDate
              ? new Date(data.data.registrationEndDate).toISOString().slice(0, 16)
              : "",
            smtp: { ...DEFAULTS.smtp, ...data.data.smtp },
            ticketTypes: data.data.ticketTypes?.length ? data.data.ticketTypes : DEFAULTS.ticketTypes
          });
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [eventId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    if (name.startsWith("smtp.")) {
      const field = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        smtp: { ...prev.smtp, [field]: type === "number" ? Number(value) : value }
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === "number" ? Number(value) : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, eventId: activeEventId }),
      });

      const data = await res.json();
      setMessage(
        data.success
          ? { text: "Settings saved successfully!", ok: true }
          : { text: data.error ?? "Failed to save settings.", ok: false },
      );
    } catch {
      setMessage({ text: "An error occurred while saving.", ok: false });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const addTicketType = () => {
    setForm(p => ({
      ...p,
      ticketTypes: [...p.ticketTypes, { name: "", price: 0, description: "" }]
    }));
  };

  const removeTicketType = (index: number) => {
    if (form.ticketTypes.length <= 1) return;
    setForm(p => ({
      ...p,
      ticketTypes: p.ticketTypes.filter((_, i) => i !== index)
    }));
  };

  const updateTicketType = (index: number, field: keyof TicketType, value: any) => {
    const next = [...form.ticketTypes];
    next[index] = { ...next[index], [field]: field === 'price' || field === 'capacity' ? Number(value) : value };
    setForm(p => ({ ...p, ticketTypes: next }));
  };

  if (isLoading) return <div className="py-20 flex flex-col items-center justify-center gap-4 text-muted-foreground"><Loader2 className="w-8 h-8" animate-spin /> Synchronizing settings...</div>;

  if (!hasEvents) {
    return (
      <div className="max-w-4xl py-20 flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-3xl flex items-center justify-center mb-4">
          <Settings className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-black text-foreground">No Events Found</h2>
        <p className="text-muted-foreground max-w-md">
          You haven&apos;t created any events yet. Settings are event-specific and will be available once your first event is live.
        </p>
        <a href="/admin/events" className="mt-4 px-8 py-4 bg-amber-500 text-amber-950 hover:bg-amber-400 font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-amber-500/20 hover:scale-105">
          Go to Events
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-4xl pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-border pb-6">
        <div>
          <h2 className="text-3xl font-black text-foreground mb-1">Event Settings</h2>
          <p className="text-muted-foreground text-sm">
            Configure pricing, infrastructure, and payment gateways for this event.
          </p>
        </div>
        <EventSwitcher />
      </div>

      {message && (
        <div className={`p-4 mb-6 rounded-lg font-medium text-sm flex items-center justify-between ${message.ok ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
          {message.text}
          <button title='message' type="button" onClick={() => setMessage(null)} className="cursor-pointer transition-all hover:scale-110 active:scale-90"><X size={14} /></button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Core Config */}
        <section className="bg-card border border-border rounded-3xl p-8 space-y-6">
           <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="text-amber-500" size={24} />
            <h3 className="text-xl font-bold">General Configuration</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Tenure Name">
              <input type="text" name="tenureName" value={form.tenureName} onChange={handleChange} required className={inputCls()} />
            </Field>
            <Field label="Registration End Date">
              <input type="datetime-local" name="registrationEndDate" value={form.registrationEndDate} onChange={handleChange} className={inputCls()} />
            </Field>
          </div>

          <Field label="Event Description">
            <textarea 
              name="description" 
              value={form.description} 
              onChange={(e: any) => setForm(p => ({ ...p, description: e.target.value }))}
              rows={3} 
              className={`${inputCls()} font-sans`} 
              placeholder="Tell attendees what your event is about..."
            />
          </Field>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Field label="Event Logo" hint="Appears on registration header">
              <LogoField logoUrl={form.logoUrl} onChange={(url: string) => setForm(p => ({ ...p, logoUrl: url }))} />
            </Field>
            <Field label="Banner Image" hint="Hero image for your event card">
              <LogoField logoUrl={form.bannerImageUrl} onChange={(url: string) => setForm(p => ({ ...p, bannerImageUrl: url }))} />
            </Field>
          </div>
        </section>

        {/* Dynamic Ticket Types */}
        <section className="bg-card border border-border rounded-3xl p-8 space-y-6" data-tour="ticket-inventory">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
              <Settings className="text-amber-500" size={24} />
              <h3 className="text-xl font-bold">Ticket Inventory</h3>
            </div>
            <button 
              type="button" 
              onClick={addTicketType}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-500 hover:text-black transition-all"
            >
              <Plus size={14} /> Add Ticket Type
            </button>
          </div>
          
          <div className="space-y-4">
             <AnimatePresence initial={false}>
              {form.ticketTypes.map((ticket, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-6 rounded-2xl border border-border bg-muted/20 relative group"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                    <div className="md:col-span-4">
                      <Field label="Name">
                        <input 
                          type="text" 
                          value={ticket.name} 
                          onChange={(e) => updateTicketType(index, 'name', e.target.value)}
                          placeholder="e.g. Early Bird" 
                          className={inputCls()} 
                        />
                      </Field>
                    </div>
                    <div className="md:col-span-3">
                      <Field label="Price (₦)">
                        <input 
                          type="number" 
                          value={ticket.price} 
                          onChange={(e) => updateTicketType(index, 'price', e.target.value)}
                          className={inputCls()} 
                        />
                      </Field>
                    </div>
                    <div className="md:col-span-3">
                      <Field label="Capacity" hint="Optional">
                        <input 
                          type="number" 
                          value={ticket.capacity || ""} 
                          onChange={(e) => updateTicketType(index, 'capacity', e.target.value)}
                          placeholder="Unlimited"
                          className={inputCls()} 
                        />
                      </Field>
                    </div>
                    <div className="md:col-span-2 pt-8 flex justify-end">
                       <button 
                        type="button" 
                        onClick={() => removeTicketType(index)}
                        disabled={form.ticketTypes.length <= 1}
                        className="p-2 text-muted-foreground hover:text-red-500 disabled:opacity-0 transition-all"
                       >
                         <Trash2 size={18} />
                       </button>
                    </div>
                    <div className="md:col-span-12">
                      <Field label="Short Description">
                        <input 
                          type="text" 
                          value={ticket.description} 
                          onChange={(e) => updateTicketType(index, 'description', e.target.value)}
                          placeholder="What is included in this ticket?" 
                          className={inputCls()} 
                        />
                      </Field>
                    </div>
                  </div>
                </motion.div>
              ))}
             </AnimatePresence>
          </div>
        </section>

        {/* SMTP Configuration */}
        <section className="bg-card border border-border rounded-3xl p-8 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Mail className="text-blue-500" size={24} />
              <h3 className="text-xl font-bold">SMTP Configuration</h3>
            </div>
            <button
              type="button"
              onClick={async () => {
                const res = await fetch("/api/settings/test-smtp", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ smtp: form.smtp }),
                });
                const data = await res.json();
                if (data.success) {
                  showAlert("SMTP Verification Success", data.message || "Configuration is valid!", "success");
                } else {
                  showAlert("SMTP Verification Failed", data.error || "Failed to validate SMTP settings.", "error");
                }
              }}
              className="px-4 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all cursor-pointer"
            >
              Verify Configuration
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="SMTP Host"><input type="text" name="smtp.host" value={form.smtp.host} onChange={handleChange} placeholder="smtp.gmail.com" className={inputCls("amber")} /></Field>
            <Field label="SMTP Port"><input type="number" name="smtp.port" value={form.smtp.port} onChange={handleChange} placeholder="465" className={inputCls("amber")} /></Field>
            <Field label="SMTP User"><input type="text" name="smtp.user" value={form.smtp.user} onChange={handleChange} className={inputCls("amber")} /></Field>
            <Field label="SMTP Password"><SecretInput name="smtp.pass" value={form.smtp.pass} onChange={handleChange} /></Field>
            <Field label="From Name"><input type="text" name="smtp.fromName" value={form.smtp.fromName} onChange={handleChange} className={inputCls("amber")} /></Field>
            <Field label="From Email"><input type="text" name="smtp.fromEmail" value={form.smtp.fromEmail} onChange={handleChange} className={inputCls("amber")} /></Field>
          </div>
        </section>

        {/* Paystack */}
        <section className="bg-card border border-border rounded-3xl p-8 space-y-6">
          <h3 className="text-xl font-bold text-emerald-500 border-b border-border pb-2">Payment Gateways</h3>
          <div className="grid grid-cols-1 gap-6">
            <Field label="Paystack Public Key"><input type="text" name="paystackPublicKey" value={form.paystackPublicKey} onChange={handleChange} className={inputCls("emerald")} /></Field>
            <Field label="Paystack Secret Key"><SecretInput name="paystackSecretKey" value={form.paystackSecretKey} onChange={handleChange} /></Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <Toggle label="Enable Online Payment (Paystack)" checked={form.paystackEnabled} onChange={v => setForm(p => ({ ...p, paystackEnabled: v }))} />
            <Toggle label="Enable Offline Payment (Bank Transfer)" checked={form.bankTransferEnabled} onChange={v => setForm(p => ({ ...p, bankTransferEnabled: v }))} />
          </div>
        </section>

        {/* Food & Drink Limits */}
        <section className="bg-card border border-border rounded-3xl p-8 space-y-6">
          <h3 className="text-xl font-bold text-blue-400 border-b border-border pb-2">Dietary Limits</h3>
          <p className="text-xs text-muted-foreground mb-6">Set the maximum number of food and drink items an attendee can select during registration.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Max Food Selections"><input type="number" name="maxFood" value={form.maxFood} onChange={handleChange} className={inputCls()} /></Field>
            <Field label="Max Drink Selections"><input type="number" name="maxDrink" value={form.maxDrink} onChange={handleChange} className={inputCls()} /></Field>
          </div>
        </section>

        {/* Bank Details */}
        <section className="bg-card border border-border rounded-3xl p-8 space-y-6">
          <h3 className="text-xl font-bold text-amber-500 border-b border-border pb-2">Bank Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Field label="Bank Name"><input type="text" name="bankName" value={form.bankName} onChange={handleChange} className={inputCls()} /></Field>
            <Field label="Account Name"><input type="text" name="accountName" value={form.accountName} onChange={handleChange} className={inputCls()} /></Field>
            <Field label="Account Number"><input type="text" name="accountNumber" value={form.accountNumber} onChange={handleChange} className={inputCls()} /></Field>
          </div>
        </section>

        <div className="flex justify-end pt-10">
          <button type="submit" disabled={isSaving} className="px-12 py-4 bg-amber-500 text-black font-black uppercase rounded-2xl hover:bg-amber-400 transition-all flex items-center gap-2 shadow-2xl shadow-amber-500/20 active:scale-95">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check size={20} />}
            Save All Settings
          </button>
        </div>
      </form>

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
