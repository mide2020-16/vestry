'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { ProductCategory } from '@/constants/ProductCategory';
import { CATEGORY_CONFIG, COLOR_MAP } from '@/components/admin/products/config';
import type { Product } from '@/types/product.types';
import Image from 'next/image';

interface ProductListProps {
  products: Product[];
  activeCategory: ProductCategory;
  deletingId: string | null;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onToggleAvailable: (product: Product) => void;
  onAdd: () => void;
}

export function ProductList({
  products,
  activeCategory,
  deletingId,
  onEdit,
  onDelete,
  onToggleAvailable,
  onAdd,
}: ProductListProps) {
  const config = CATEGORY_CONFIG[activeCategory];
  const colorClass = COLOR_MAP[config.color];
  const filtered = products.filter((p) => p.category === activeCategory);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-neutral-800 gap-3">
        <div className="min-w-0">
          <h3 className={`font-semibold truncate ${colorClass.split(' ')[0]}`}>{config.label}</h3>
          <p className="text-xs text-neutral-500 mt-0.5 hidden sm:block">{config.description}</p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-white text-black text-sm font-bold rounded-xl hover:bg-neutral-200 transition-all shrink-0"
        >
          + <span className="hidden sm:inline">Add </span>{config.label}
        </button>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-neutral-500 px-4">
          <config.icon size={32} className="mx-auto mb-3 opacity-30" />
          <p>No {config.label.toLowerCase()} items yet</p>
          <button type="button" onClick={onAdd} className="mt-3 text-sm text-amber-400 hover:underline">
            Add your first one →
          </button>
        </div>
      ) : (
        <ul className="divide-y divide-neutral-800">
          {filtered.map((product) => (
            <li
              key={product._id}
              className="flex items-center gap-3 px-4 sm:px-6 py-3.5 sm:py-4 hover:bg-white/2 transition-colors"
            >
              {/* Thumbnail */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-neutral-800 shrink-0">
                <Image
                  width={80}
                  height={80}
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png'; }}
                />
              </div>

              {/* Name + price */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate text-sm sm:text-base">{product.name}</p>
                <p className="text-neutral-400 text-xs sm:text-sm">
                  {product.price > 0 ? `₦${product.price.toLocaleString()}` : 'Included'}
                </p>
              </div>

              {/* Available badge — icon-only on xs, text on sm+ */}
              <button
                type="button"
                aria-label={product.available ? 'Mark as hidden' : 'Mark as available'}
                onClick={() => onToggleAvailable(product)}
                className={`text-xs px-2 sm:px-3 py-1.5 rounded-full border font-medium transition-all shrink-0 ${
                  product.available
                    ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
                    : 'text-neutral-500 bg-neutral-800 border-neutral-700'
                }`}
              >
                <span className="sm:hidden">{product.available ? '●' : '○'}</span>
                <span className="hidden sm:inline">{product.available ? 'Available' : 'Hidden'}</span>
              </button>

              {/* Actions */}
              <div className="flex gap-1 sm:gap-2 shrink-0">
                <button
                  type="button"
                  aria-label="Edit product"
                  onClick={() => onEdit(product)}
                  className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  <Pencil size={15} />
                </button>
                <button
                  type="button"
                  aria-label="Delete product"
                  onClick={() => onDelete(product._id)}
                  disabled={deletingId === product._id}
                  className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-40"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}