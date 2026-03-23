/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { Field, LogoField, SecretInput, Spinner, inputCls } from '@/components/admin/settings/SettingsUI';

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
}

const DEFAULTS: SettingsForm = {
  tenureName: '',
  singlePrice: 0,
  couplePrice: 0,
  meshSinglePrice: 0,
  meshCouplePrice: 0,
  paystackPublicKey: '',
  paystackSecretKey: '',
  logoUrl: '',
};

/* ── Page ────────────────────────────────────────────────────────────────── */

export default function AdminSettingsPage() {
  const [form, setForm] = useState<SettingsForm>(DEFAULTS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.success && data.data) {
          setForm({
            tenureName:        data.data.tenureName        ?? '',
            singlePrice:       data.data.singlePrice       ?? 0,
            couplePrice:       data.data.couplePrice        ?? 0,
            meshSinglePrice:   data.data.meshSinglePrice   ?? 0,
            meshCouplePrice:   data.data.meshCouplePrice   ?? 0,
            paystackPublicKey: data.data.paystackPublicKey ?? '',
            paystackSecretKey: data.data.paystackSecretKey ?? '',
            logoUrl:           data.data.logoUrl           ?? '',
          });
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
  };

  // React's onSubmit uses FormEvent, not SubmitEvent
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setMessage(
        data.success
          ? { text: 'Settings saved successfully!', ok: true }
          : { text: data.error ?? 'Failed to save settings.', ok: false },
      );
    } catch {
      setMessage({ text: 'An error occurred while saving.', ok: false });
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
        Configure global pricing, event tenure details, and payment gateway keys.
      </p>

      {/* Toast */}
      {message && (
        <div className={`p-4 mb-6 rounded-lg font-medium text-sm flex items-center justify-between
          ${message.ok
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}
        >
          {message.text}
          <button type="button" aria-label="Dismiss" onClick={() => setMessage(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-lg p-6 md:p-8">

        {/* Event Configuration */}
        <section className="space-y-5">
          <h3 className="text-xl font-bold text-amber-500 border-b border-neutral-800 pb-2">
            Event Configuration
          </h3>

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

          <Field
            label="Event Logo"
            hint="Shown in the top-left corner of the registration page when the user scrolls."
          >
            <LogoField
              logoUrl={form.logoUrl}
              onChange={(url: any) => setForm(prev => ({ ...prev, logoUrl: url }))}
            />
          </Field>

          <div>
            <p className="text-sm font-semibold text-neutral-300 mb-3">Ticket Pricing</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Single Ticket (₦)">
                <input title='singleprice' type="number" name="singlePrice" value={form.singlePrice} onChange={handleChange} required min="0" className={inputCls()} />
              </Field>
              <Field label="Couple Ticket (₦)">
                <input title='coupleprice' type="number" name="couplePrice" value={form.couplePrice} onChange={handleChange} required min="0" className={inputCls()} />
              </Field>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-neutral-300 mb-1">mesh / Outfit Pricing</p>
            <p className="text-xs text-neutral-500 mb-3">
              Base price per mesh item. Couple price is charged ×2 automatically.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="mesh — Single (₦)">
                <input title='meshprice' type="number" name="meshSinglePrice" value={form.meshSinglePrice} onChange={handleChange} min="0" className={inputCls()} />
              </Field>
              <Field label="mesh — Couple (₦ per person)">
                <input title='meshcouple' type="number" name="meshCouplePrice" value={form.meshCouplePrice} onChange={handleChange} min="0" className={inputCls()} />
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
              className={inputCls('emerald')}
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
            {isSaving
              ? <><Spinner className="h-4 w-4" /> Saving...</>
              : <><Check size={16} /> Save Configuration</>}
          </button>
        </div>
      </form>
    </div>
  );
}