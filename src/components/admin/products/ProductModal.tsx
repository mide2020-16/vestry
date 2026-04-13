"use client";

import { Check, X, Plus } from "lucide-react";
import { useState } from "react";
import { ProductCategory } from "@/constants/ProductCategory";
import {
  ACCENT_MAP,
  CATEGORY_CONFIG,
} from "@/components/admin/products/config";
import { FileUploadInput } from "./FileUploadInput";
import type { ProductForm } from "@/types/product.types";
import Image from "next/image";
import { AnimatedCheck, AnimatedDecline } from "@/components/ui/Boop";

interface ProductModalProps {
  isEditing: boolean;
  activeCategory: ProductCategory;
  form: ProductForm;
  isSaving: boolean;
  onChange: (patch: Partial<ProductForm>) => void;
  onSave: () => void;
  onClose: () => void;
}

export function ProductModal({
  isEditing,
  activeCategory,
  form,
  isSaving,
  onChange,
  onSave,
  onClose,
}: ProductModalProps) {
  const config = CATEGORY_CONFIG[activeCategory];
  const accentClass = ACCENT_MAP[config.color];
  const inputCls = `w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-foreground text-base focus:outline-none focus:ring-2 ${accentClass} transition-colors`;

  const [newInscription, setNewInscription] = useState("");

  const addInscription = () => {
    const trimmed = newInscription.trim();
    if (!trimmed) return;
    const current = form.inscriptions ?? [];
    if (current.includes(trimmed)) return;
    onChange({ inscriptions: [...current, trimmed] });
    setNewInscription("");
  };

  const removeInscription = (index: number) => {
    const current = form.inscriptions ?? [];
    onChange({ inscriptions: current.filter((_, i) => i !== index) });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Sheet slides up from bottom on mobile, centered on sm+ */}
      <div className="bg-card border border-border rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 w-full sm:max-w-md shadow-2xl max-h-[92dvh] overflow-y-auto transition-colors">
        {/* Drag handle — mobile only */}
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5 sm:hidden" />

        {/* Title */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-foreground">
            {isEditing ? "Edit" : "Add"} {config.label}
          </h3>
          <button
            type="button"
            title="Close modal"
            aria-label="Close modal"
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all"
          >
            <AnimatedDecline>
              <X size={18} />
            </AnimatedDecline>
          </button>
        </div>

        <div className="space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground/80">
              Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder={
                activeCategory === ProductCategory.mesh
                  ? "e.g. Classic White Tee"
                  : "e.g. Jollof Rice"
              }
              className={`${inputCls} text-lg`}
            />
          </div>

          {/* Thumbnail image */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground/80">
              Thumbnail Image
            </label>
            <FileUploadInput
              kind="image"
              value={form.image_url}
              onChange={(url) => onChange({ image_url: url })}
              accept="image/jpeg,image/png,image/webp,image/gif"
              placeholder="https://... or /images/photo.jpg"
              hint="JPG, PNG, WebP — max 5 MB"
              inputClassName={inputCls}
            />
            {form.image_url && (
              <Image
                width={80}
                height={80}
                src={form.image_url}
                alt="Preview"
                className="mt-2 h-20 w-20 rounded-lg object-cover border border-border"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
          </div>

          {/* 3D model — mesh only */}
          {activeCategory === ProductCategory.mesh && (
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground/80">
                3D Model{" "}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <FileUploadInput
                kind="model"
                value={form.modelUrl ?? ""}
                onChange={(url) => onChange({ modelUrl: url })}
                accept=".glb"
                placeholder="/models/shirt.glb or https://..."
                hint=".glb only — max 50 MB"
                inputClassName={inputCls}
              />
            </div>
          )}

          {/* Price */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground/80">
              Price (₦)
              {activeCategory !== ProductCategory.mesh &&
                " — set 0 if included free"}
            </label>
            <input
              type="number"
              inputMode="numeric"
              value={form.price === 0 ? "" : form.price}
              min={0}
              placeholder="0"
              onChange={(e) =>
                onChange({
                  price: e.target.value === "" ? 0 : Number(e.target.value),
                })
              }
              className={`${inputCls} font-mono text-lg`}
            />
          </div>

          {/* Inscriptions — mesh only */}
          {activeCategory === ProductCategory.mesh && (
            <div className="space-y-3 pt-3 border-t border-border">
              <div>
                <label className="block text-sm font-medium text-amber-400">
                  Inscriptions
                </label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Text options customers can print on their merch.
                </p>
              </div>

              {/* Add row */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newInscription}
                  onChange={(e) => setNewInscription(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addInscription())
                  }
                  placeholder='e.g. "His" or "Hers"'
                  className={`${inputCls} flex-1`}
                />
                <button
                  type="button"
                  title="Add inscription"
                  aria-label="Add inscription"
                  onClick={addInscription}
                  className="bg-amber-500/20 text-amber-500 hover:bg-amber-500/30 px-3 rounded-lg font-bold transition-colors flex items-center gap-1 shrink-0"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 min-h-6">
                {(form.inscriptions ?? []).length === 0 ? (
                  <span className="text-xs text-muted-foreground/40 italic">
                    No inscriptions added yet.
                  </span>
                ) : (
                  (form.inscriptions ?? []).map((text, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1.5 bg-muted border border-border text-foreground/80 text-xs px-3 py-1.5 rounded-full"
                    >
                      {text}
                      <button
                        type="button"
                        title={`Remove "${text}"`}
                        aria-label={`Remove inscription ${text}`}
                        onClick={() => removeInscription(i)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <AnimatedDecline>
                          <X size={11} />
                        </AnimatedDecline>
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Available toggle */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              title={
                form.available ? "Hide from attendees" : "Show to attendees"
              }
              aria-label={
                form.available ? "Hide from attendees" : "Show to attendees"
              }
              onClick={() => onChange({ available: !form.available })}
              className={`w-10 h-6 rounded-full transition-all relative shrink-0 ${form.available ? "bg-emerald-500" : "bg-muted"}`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.available ? "left-5" : "left-1"}`}
              />
            </button>
            <span className="text-sm text-foreground/80">
              {form.available
                ? "Visible to attendees"
                : "Hidden from attendees"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-8">
          <button
            type="button"
            title="Cancel and close"
            onClick={onClose}
            className="flex-1 py-3.5 sm:py-3 bg-secondary hover:bg-secondary/80 text-foreground font-medium rounded-xl transition-colors border border-border"
          >
            CANCEL
          </button>
          <button
            type="submit"
            title={isEditing ? "Save changes" : "Create product"}
            onClick={onSave}
            disabled={isSaving}
            className="flex-1 py-3.5 sm:py-3 bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              "Saving…"
            ) : (
              <>
              <AnimatedCheck>
                <Check size={16} /> Save
              </AnimatedCheck>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
