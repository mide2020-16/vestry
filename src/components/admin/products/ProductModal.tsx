'use client';

import { Check, X } from 'lucide-react';
import { ProductCategory } from '@/constants/ProductCategory';
import { ACCENT_MAP, CATEGORY_CONFIG } from '@/components/admin/products/config';
import { FileUploadInput } from './FileUploadInput';
import type { ProductForm } from '@/types/product.types';
import Image from 'next/image';

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
  const inputCls = `w-full bg-black/40 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 ${accentClass} transition-colors`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">

        {/* Title */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">
            {isEditing ? 'Edit' : 'Add'} {config.label}
          </h3>
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5">

          {/* Name */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-neutral-300">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder={activeCategory === ProductCategory.mesh ? 'e.g. Classic White Tee' : 'e.g. Jollof Rice'}
              className={inputCls}
            />
          </div>

          {/* Thumbnail image */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-neutral-300">Thumbnail Image</label>
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
                className="mt-2 h-20 w-20 rounded-lg object-cover border border-neutral-700"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
          </div>

          {/* 3D model — mesh only */}
          {activeCategory === ProductCategory.mesh && (
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-neutral-300">
                3D Model{' '}
                <span className="text-neutral-500 font-normal">(optional)</span>
              </label>
              <FileUploadInput
                kind="model"
                value={form.model_url ?? ''}
                onChange={(url) => onChange({ model_url: url })}
                accept=".glb"
                placeholder="/models/shirt.glb or https://..."
                hint=".glb only — max 50 MB"
                inputClassName={inputCls}
              />
            </div>
          )}
          
          {/* Price */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-neutral-300">
              Price (₦){activeCategory !== ProductCategory.mesh && ' — set 0 if included free'}
            </label>
            <input
              type="number"
              value={form.price === 0 ? '' : form.price}
              min={0}
              placeholder="0"
              onChange={(e) => onChange({ price: e.target.value === '' ? 0 : Number(e.target.value) })}
              className={`${inputCls} font-mono`}
            />
          </div>

          {/* Available toggle */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              aria-label={form.available ? 'Hide from attendees' : 'Show to attendees'}
              onClick={() => onChange({ available: !form.available })}
              className={`w-10 h-6 rounded-full transition-all relative ${form.available ? 'bg-emerald-500' : 'bg-neutral-700'}`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.available ? 'left-5' : 'left-1'}`} />
            </button>
            <span className="text-sm text-neutral-300">
              {form.available ? 'Visible to attendees' : 'Hidden from attendees'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-8">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={onSave}
            disabled={isSaving}
            className="flex-1 py-3 bg-white hover:bg-neutral-200 text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSaving ? 'Saving…' : <><Check size={16} /> Save</>}
          </button>
        </div>
      </div>
    </div>
  );
}