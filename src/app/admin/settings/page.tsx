/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import {
  Field,
  LogoField,
  SecretInput,
  Spinner,
  inputCls,
} from "@/components/admin/settings/SettingsUI";

/* ── Helpers ─────────────────────────────────────────────────────────────── */

// Magic Canvas converter: Turns "Light Blue" into "#add8e6"
function textToHex(colorName: string): string {
  if (typeof window === "undefined") return "#ffffff";
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return "#ffffff";
  ctx.fillStyle = colorName.toLowerCase().replace(/\s+/g, "");
  return ctx.fillStyle;
}

/* ── Types ───────────────────────────────────────────────────────────────── */

interface SettingsForm {
  tenureName: string;
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
}

const DEFAULTS: SettingsForm = {
  tenureName: "",
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
};

/* ── Page ────────────────────────────────────────────────────────────────── */

export default function AdminSettingsPage() {
  const [form, setForm] = useState<SettingsForm>(DEFAULTS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(
    null,
  );
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#ffffff");
  const [newSize, setNewSize] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (data.success && data.data) {
          setForm({
            tenureName: data.data.tenureName ?? "",
            singlePrice: data.data.singlePrice ?? 0,
            couplePrice: data.data.couplePrice ?? 0,
            meshSinglePrice: data.data.meshSinglePrice ?? 0,
            meshCouplePrice: data.data.meshCouplePrice ?? 0,
            paystackPublicKey: data.data.paystackPublicKey ?? "",
            paystackSecretKey: data.data.paystackSecretKey ?? "",
            logoUrl: data.data.logoUrl ?? "",
            registrationEndDate: data.data.registrationEndDate
              ? new Date(data.data.registrationEndDate)
                  .toISOString()
                  .slice(0, 16)
              : "",
            meshColors: data.data.meshColors ?? [],
            meshSizes: data.data.meshSizes ?? [],
          });
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  /* ── Dynamic Handlers ── */

  const handleColorTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setNewColorName(text);
    setNewColorHex(textToHex(text)); // Auto-magically update hex based on text
  };

  const addColor = () => {
    if (!newColorName.trim()) return;
    setForm((prev) => ({
      ...prev,
      meshColors: [
        ...prev.meshColors,
        { label: newColorName.trim(), value: newColorHex },
      ],
    }));
    setNewColorName("");
  };

  const removeColor = (indexToRemove: number) => {
    setForm((prev) => ({
      ...prev,
      meshColors: prev.meshColors.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const addSize = () => {
    if (!newSize.trim()) return;
    setForm((prev) => ({
      ...prev,
      meshSizes: [...prev.meshSizes, newSize.trim().toUpperCase()],
    }));
    setNewSize("");
  };

  const removeSize = (indexToRemove: number) => {
    setForm((prev) => ({
      ...prev,
      meshSizes: prev.meshSizes.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  // React's onSubmit uses FormEvent, not SubmitEvent
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 text-neutral-400 py-10">
        <Spinner />
        Loading configuration...
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h2 className="text-3xl font-bold text-white mb-2">System Settings</h2>
      <p className="text-neutral-400 mb-8 border-b border-neutral-800 pb-4">
        Configure global pricing, event tenure details, and payment gateway
        keys.
      </p>

      {/* Toast */}
      {message && (
        <div
          className={`p-4 mb-6 rounded-lg font-medium text-sm flex items-center justify-between
          ${
            message.ok
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}
        >
          {message.text}
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setMessage(null)}
          >
            <X size={14} />
          </button>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-8 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-lg p-6 md:p-8"
      >
        {/* Event Configuration */}
        <section className="space-y-5">
          <h3 className="text-xl font-bold text-amber-500 border-b border-neutral-800 pb-2">
            Event Configuration
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Current Tenure Name">
              <input
                type="text"
                name="tenureName"
                value={form.tenureName}
                onChange={handleChange}
                required
                placeholder="e.g. 2026/2027 Singles Week"
                className={inputCls()}
              />
            </Field>

            <Field label="Registration End Date & Time">
              <input
                title="registration close"
                type="datetime-local"
                name="registrationEndDate"
                value={form.registrationEndDate}
                onChange={handleChange}
                className={inputCls()}
              />
            </Field>
          </div>

          <Field
            label="Event Logo"
            hint="Shown in the top-left corner of the registration page when the user scrolls."
          >
            <LogoField
              logoUrl={form.logoUrl}
              onChange={(url: any) =>
                setForm((prev) => ({ ...prev, logoUrl: url }))
              }
            />
          </Field>
        </section>

        {/* Merch Customization */}
        <section className="space-y-5 pt-6 border-t border-neutral-800">
          <h3 className="text-xl font-bold text-amber-500 border-b border-neutral-800 pb-2">
            Merch Settings (Colors & Sizes)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Colors */}
            <div>
              <Field
                label="Available Colors"
                hint="Type a human color like 'navy' or 'crimson'."
              >
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="e.g. Light Blue"
                    value={newColorName}
                    onChange={handleColorTextChange}
                    className={`${inputCls()} flex-1`}
                  />
                  <input
                    title="color to text"
                    type="color"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0"
                  />
                  <button
                    type="button"
                    onClick={addColor}
                    className="bg-amber-500/20 text-amber-500 hover:bg-amber-500/30 px-3 rounded-lg font-bold transition-colors"
                  >
                    Add
                  </button>
                </div>
              </Field>

              <div className="flex flex-wrap gap-2">
                {form.meshColors.length === 0 && (
                  <span className="text-xs text-neutral-600">
                    No colors added.
                  </span>
                )}
                {form.meshColors.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-neutral-800 px-3 py-1.5 rounded-full border border-neutral-700"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: c.value }}
                    />
                    <span className="text-xs text-neutral-300">{c.label}</span>
                    <button
                      title="remove color"
                      type="button"
                      onClick={() => removeColor(i)}
                      className="text-red-400 hover:text-red-300 ml-1"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div>
              <Field
                label="Available Sizes"
                hint="e.g. 'S', 'M', 'L', 'XL' or '32', '34'."
              >
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="e.g. XL"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addSize())
                    }
                    className={`${inputCls()} flex-1 uppercase`}
                  />
                  <button
                    type="button"
                    onClick={addSize}
                    className="bg-amber-500/20 text-amber-500 hover:bg-amber-500/30 px-3 rounded-lg font-bold transition-colors"
                  >
                    Add
                  </button>
                </div>
              </Field>

              <div className="flex flex-wrap gap-2">
                {form.meshSizes.length === 0 && (
                  <span className="text-xs text-neutral-600">
                    No sizes added.
                  </span>
                )}
                {form.meshSizes.map((s, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-2 bg-neutral-800 px-3 py-1.5 rounded-md border border-neutral-700 text-xs text-neutral-300"
                  >
                    {s}
                    <button
                      title="remove size"
                      type="button"
                      onClick={() => removeSize(i)}
                      className="text-red-400 hover:text-red-300 ml-1"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Configuration */}
        <section className="space-y-5 pt-6 border-t border-neutral-800">
          <h3 className="text-xl font-bold text-amber-500 border-b border-neutral-800 pb-2">
            Pricing Configuration
          </h3>
          <div>
            <p className="text-sm font-semibold text-neutral-300 mb-3">
              Ticket Pricing
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Single Ticket (₦)">
                <input
                  title="singleprice"
                  type="number"
                  name="singlePrice"
                  value={form.singlePrice}
                  onChange={handleChange}
                  required
                  min="0"
                  className={inputCls()}
                />
              </Field>
              <Field label="Couple Ticket (₦)">
                <input
                  title="coupleprice"
                  type="number"
                  name="couplePrice"
                  value={form.couplePrice}
                  onChange={handleChange}
                  required
                  min="0"
                  className={inputCls()}
                />
              </Field>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-neutral-300 mb-1">
              Merch / Outfit Pricing
            </p>
            <p className="text-xs text-neutral-500 mb-3">
              Base price per merch item. Couple price is charged ×2
              automatically.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Merch — Single (₦)">
                <input
                  title="meshprice"
                  type="number"
                  name="meshSinglePrice"
                  value={form.meshSinglePrice}
                  onChange={handleChange}
                  min="0"
                  className={inputCls()}
                />
              </Field>
              <Field label="Merch — Couple (₦ per person)">
                <input
                  title="meshcouple"
                  type="number"
                  name="meshCouplePrice"
                  value={form.meshCouplePrice}
                  onChange={handleChange}
                  min="0"
                  className={inputCls()}
                />
              </Field>
            </div>
          </div>
        </section>

        {/* Paystack Integration */}
        <section className="space-y-5 pt-6 border-t border-neutral-800">
          <h3 className="text-xl font-bold text-emerald-500 border-b border-neutral-800 pb-2">
            Paystack Integration
          </h3>
          <p className="text-xs text-neutral-500">
            Leave blank if you prefer to use environment variables directly.
          </p>

          <Field label="Public Key">
            <input
              type="text"
              name="paystackPublicKey"
              value={form.paystackPublicKey}
              onChange={handleChange}
              placeholder="pk_test_..."
              className={inputCls("emerald")}
            />
          </Field>

          <Field label="Secret Key">
            <SecretInput
              name="paystackSecretKey"
              value={form.paystackSecretKey}
              onChange={handleChange}
              placeholder="sk_test_..."
            />
          </Field>
        </section>

        {/* Submit */}
        <div className="pt-4 flex justify-end border-t border-neutral-800">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Spinner className="h-4 w-4" /> Saving...
              </>
            ) : (
              <>
                <Check size={16} /> Save Configuration
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
