"use client";

import { Pencil, Trash2 } from "lucide-react";
import { ProductCategory } from "@/constants/ProductCategory";
import { CATEGORY_CONFIG, COLOR_MAP } from "@/components/admin/products/config";
import type { Product } from "@/types/product.types";
import Image from "next/image";
import { AnimatedEdit, AnimatedTrash } from "@/components/ui/Boop";

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
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border gap-3 bg-muted/30">
        <div className="min-w-0">
          <h3 className={`font-semibold truncate ${colorClass.split(" ")[0]}`}>
            {config.label}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
            {config.description}
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-foreground text-background text-sm font-bold rounded-xl hover:opacity-90 transition-all shrink-0"
        >
          + <span className="hidden sm:inline">Add </span>
          {config.label}
        </button>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground px-4">
          <config.icon size={32} className="mx-auto mb-3 opacity-30" />
          <p>No {config.label.toLowerCase()} items yet</p>
          <button
            type="button"
            onClick={onAdd}
            className="mt-3 text-sm text-amber-400 hover:underline"
          >
            Add your first one →
          </button>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {filtered.map((product) => (
            <li
              key={product._id}
              className="flex items-center gap-3 px-4 sm:px-6 py-3.5 sm:py-4 hover:bg-muted/50 transition-colors"
            >
              {/* Thumbnail */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-muted shrink-0 border border-border/50">
                <Image
                  width={80}
                  height={80}
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.png";
                  }}
                />
              </div>

              {/* Name + price */}
              <div className="flex-1 min-w-0">
                <p className="text-foreground font-medium truncate text-sm sm:text-base">
                  {product.name}
                </p>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  {product.price > 0
                    ? `₦${product.price.toLocaleString()}`
                    : "Included"}
                </p>
              </div>

              {/* Available badge */}
              <button
                type="button"
                aria-label={
                  product.available ? "Mark as hidden" : "Mark as available"
                }
                onClick={() => onToggleAvailable(product)}
                className={`text-xs px-2 sm:px-3 py-1.5 rounded-full border font-medium transition-all shrink-0 ${
                  product.available
                    ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                    : "text-muted-foreground bg-muted border-border"
                }`}
              >
                <span className="sm:hidden">
                  {product.available ? "●" : "○"}
                </span>
                <span className="hidden sm:inline">
                  {product.available ? "Available" : "Hidden"}
                </span>
              </button>

              {/* Actions — using specialized animations */}
              <div className="flex gap-1 sm:gap-2 shrink-0">
                <button
                  type="button"
                  aria-label="Edit product"
                  onClick={() => onEdit(product)}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all"
                >
                  <AnimatedEdit>
                    <Pencil size={15} />
                  </AnimatedEdit>
                </button>
                <button
                  type="button"
                  aria-label="Delete product"
                  onClick={() => onDelete(product._id)}
                  disabled={deletingId === product._id}
                  className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-40"
                >
                  <AnimatedTrash>
                    <Trash2 size={15} />
                  </AnimatedTrash>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
