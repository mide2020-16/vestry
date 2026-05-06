/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Check, X, Mail, ShieldCheck, Plus, Settings, Loader2 } from "lucide-react";
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

/* ── Types ───────────────────────────────────────────────────────────────── */

interface SettingsForm {
  tenureName: string;
  description: string;
  bannerImageUrl: string;
  singlePrice: number;
  couplePrice: number;
  meshSinglePrice: number;
  meshCouplePrice: number;
  paystackPublicKey: string;
  paystackSecretKey: string;
  logoUrl: string;
  registrationEndDate: string;
  meshColors: { label: string; value: string }[];
  meshSizes: string[];
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
  singlePrice: 0,
  couplePrice: 0,
  meshSinglePrice: 0,
  meshCouplePrice: 0,
  paystackPublicKey: "",
  paystackSecretKey: "",
  logoUrl: "",
  registrationEndDate: "",
  meshColors: [],
  meshSizes: [],
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
        // First check for events
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
            smtp: { ...DEFAULTS.smtp, ...data.data.smtp }
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

  const addColor = () => {
    setForm(p => ({ ...p, meshColors: [...p.meshColors, { label: "", value: "#000000" }] }));
  };

  const removeColor = (index: number) => {
    setForm(p => ({ ...p, meshColors: p.meshColors.filter((_, i) => i !== index) }));
  };

  const updateColor = (index: number, field: "label" | "value", val: string) => {
    const next = [...form.meshColors];
    next[index] = { ...next[index], [field]: val };
    setForm(p => ({ ...p, meshColors: next }));
  };

  const addSize = (size: string) => {
    const cleanSize = size.trim().toUpperCase();
    if (!cleanSize || form.meshSizes.includes(cleanSize)) return;
    setForm(p => ({ ...p, meshSizes: [...p.meshSizes, cleanSize] }));
  };

  const removeSize = (size: string) => {
    setForm(p => ({ ...p, meshSizes: p.meshSizes.filter(s => s !== size) }));
  };

  const COMMON_SIZES = ["S", "M", "L", "XL", "XXL", "XXXL"];

  // Automated color naming helper
  const getColorName = (hex: string) => {
    const colors: Record<string, string> = {
      "#000000": "Black", "#ffffff": "White", "#ff0000": "Red", "#00ff00": "Lime",
      "#0000ff": "Blue", "#ffff00": "Yellow", "#00ffff": "Cyan", "#ff00ff": "Magenta",
      "#c0c0c0": "Silver", "#808080": "Gray", "#800000": "Maroon", "#808000": "Olive",
      "#008000": "Green", "#800080": "Purple", "#008080": "Teal", "#000080": "Navy",
      "#f59e0b": "Amber", "#10b981": "Emerald", "#3b82f6": "Blue", "#ef4444": "Red",
      "#8b5cf6": "Violet", "#ec4899": "Pink", "#f97316": "Orange", "#6366f1": "Indigo",
      "#14b8a6": "Teal", "#a855f7": "Purple", "#f43f5e": "Rose", "#0ea5e9": "Sky",
      "#d97706": "Amber", "#d946ef": "Fuchsia", "#d1d5db": "Light Gray",
      "#4b5563": "Dark Gray", "#1f2937": "Slate", "#7c3aed": "Violet",
      "#ffd700": "Gold", "#cd7f32": "Bronze", "#b87333": "Copper", "#030303": "Pure Black",
      "#fbfbfb": "Pure White", "#eeeeee": "Off White", "#333333": "Charcoal",
    };
    return colors[hex.toLowerCase()] || "";
  };

  const getHexFromName = (name: string) => {
    const names: Record<string, string> = {
      "black": "#000000", "white": "#ffffff", "red": "#ff0000", "lime": "#00ff00",
      "blue": "#0000ff", "yellow": "#ffff00", "cyan": "#00ffff", "magenta": "#ff00ff",
      "silver": "#c0c0c0", "gray": "#808080", "maroon": "#800000", "olive": "#808000",
      "green": "#008000", "purple": "#800080", "teal": "#008080", "navy": "#000080",
      "amber": "#f59e0b", "emerald": "#10b981", "violet": "#8b5cf6", "pink": "#ec4899",
      "orange": "#f97316", "indigo": "#6366f1", "rose": "#f43f5e", "sky": "#0ea5e9",
      "fuchsia": "#d946ef", "gold": "#ffd700", "bronze": "#cd7f32", "silver-fox": "#c0c0c0",
    };
    return names[name.toLowerCase()] || null;
  };

  if (isLoading) return <div className="py-20 flex flex-col items-center justify-center gap-4 text-muted-foreground"><Loader2 className="w-8 h-8" /> Synchronizing settings...</div>;

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
              <LogoField logoUrl={form.logoUrl} onChange={(url: any) => setForm(p => ({ ...p, logoUrl: url }))} />
            </Field>
            <Field label="Banner Image" hint="Hero image for your event card">
              <LogoField logoUrl={form.bannerImageUrl} onChange={(url: any) => setForm(p => ({ ...p, bannerImageUrl: url }))} />
            </Field>
          </div>
        </section>

        {/* Pricing */}
        <section className="bg-card border border-border rounded-3xl p-8 space-y-6">
          <h3 className="text-xl font-bold text-amber-500 border-b border-border pb-2">Pricing</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Single Ticket (₦)"><input type="number" name="singlePrice" value={form.singlePrice} onChange={handleChange} className={inputCls()} /></Field>
            <Field label="Couple Ticket (₦)"><input type="number" name="couplePrice" value={form.couplePrice} onChange={handleChange} className={inputCls()} /></Field>
            <Field label="Merch Single (₦)"><input type="number" name="meshSinglePrice" value={form.meshSinglePrice} onChange={handleChange} className={inputCls()} /></Field>
            <Field label="Merch Couple (₦)"><input type="number" name="meshCouplePrice" value={form.meshCouplePrice} onChange={handleChange} className={inputCls()} /></Field>
          </div>
        </section>

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
          <p className="text-xs text-muted-foreground mb-6">Used for sending tickets and notifications to users.</p>
          
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
          <h3 className="text-xl font-bold text-emerald-500 border-b border-border pb-2">Paystack Keys</h3>
          <div className="grid grid-cols-1 gap-6">
            <Field label="Public Key"><input type="text" name="paystackPublicKey" value={form.paystackPublicKey} onChange={handleChange} className={inputCls("emerald")} /></Field>
            <Field label="Secret Key"><SecretInput name="paystackSecretKey" value={form.paystackSecretKey} onChange={handleChange} /></Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Toggle label="Enable Paystack" checked={form.paystackEnabled} onChange={v => setForm(p => ({ ...p, paystackEnabled: v }))} />
            <Toggle label="Enable Bank Transfer" checked={form.bankTransferEnabled} onChange={v => setForm(p => ({ ...p, bankTransferEnabled: v }))} />
          </div>
        </section>

        {/* Merch Customization */}
        <section className="bg-card border border-border rounded-3xl p-8 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-amber-500">Merch Customization</h3>
          </div>
          
          <div className="space-y-6">
            <Field label="Color Palette" hint="Colors available for inscriptions (e.g., Gold, White)">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {form.meshColors.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 bg-muted/20 p-2 rounded-xl border border-border">
                    <input 
                      type="color" 
                      value={c.value} 
                      onChange={e => {
                        const hex = e.target.value;
                        const guessedName = getColorName(hex);
                        updateColor(i, 'value', hex);
                        if (guessedName) updateColor(i, 'label', guessedName);
                      }}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent"
                    />
                    <input 
                      type="text" 
                      placeholder="Label (e.g. Gold)" 
                      value={c.label} 
                      onChange={e => {
                        const name = e.target.value;
                        updateColor(i, 'label', name);
                        const hex = getHexFromName(name);
                        if (hex) updateColor(i, 'value', hex);
                      }}
                      className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold"
                    />
                    <button title='remove' type="button" onClick={() => removeColor(i)} className="p-1 hover:text-red-500"><X size={14} /></button>
                  </div>
                ))}
                <button 
                  type="button" 
                  onClick={addColor}
                  className="flex items-center justify-center gap-2 p-3 border border-dashed border-border rounded-xl hover:border-amber-500/50 hover:bg-amber-500/5 transition-all text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-amber-500"
                >
                  <Plus size={14} /> Add Color
                </button>
              </div>
            </Field>

            <Field label="Available Sizes" hint="Enter sizes in uppercase (e.g. S, M, L, XL)">
              <div className="flex flex-wrap gap-2 mb-3">
                {COMMON_SIZES.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => addSize(s)}
                    disabled={form.meshSizes.includes(s)}
                    className="px-3 py-1.5 rounded-lg border border-border text-[10px] font-black uppercase tracking-widest hover:border-amber-500/50 hover:bg-amber-500/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    + {s}
                  </button>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4 p-4 bg-muted/10 rounded-2xl border border-dashed border-border min-h-[60px] items-center">
                {form.meshSizes.length === 0 && <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">No sizes added</p>}
                {form.meshSizes.map(size => (
                  <span key={size} className="px-3 py-1.5 bg-amber-500 text-black rounded-lg text-xs font-black flex items-center gap-2 animate-in zoom-in-95">
                    {size}
                    <button type="button" onClick={() => removeSize(size)} className="hover:scale-110 transition-all"><X size={14} /></button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input 
                  type="text" 
                  id="new-size-input"
                  placeholder="Type custom size (e.g. XXL)..." 
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSize((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                  className={`${inputCls()} !py-3 !text-xs font-bold uppercase`}
                />
                <button 
                  title='add'
                  type="button" 
                  onClick={() => {
                    const el = document.getElementById('new-size-input') as HTMLInputElement;
                    addSize(el.value);
                    el.value = '';
                  }}
                  className="px-6 bg-muted border border-border rounded-xl hover:bg-muted/80 transition-all text-amber-500"
                >
                  <Plus size={20} />
                </button>
              </div>
            </Field>
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
          <button type="submit" disabled={isSaving} className="px-12 py-4 bg-amber-500 text-black font-black uppercase rounded-2xl hover:bg-amber-400 transition-all flex items-center gap-2">
            {isSaving ? <Loader2 className="h-4 w-4" /> : <Check size={20} />}
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
