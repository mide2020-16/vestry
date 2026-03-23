'use client';

import { useEffect, useState } from 'react';
import { ProductCategory } from '@/constants/ProductCategory';
import { ProductList } from '@/components/admin/products/ProductList';
import { ProductModal } from '@/components/admin/products/ProductModal';
import { CATEGORY_CONFIG, COLOR_MAP, EMPTY_FORM } from '@/components/admin/products/config';
import type { Product, ProductForm } from '@/types/product.types';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<ProductCategory>(ProductCategory.mesh);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success) setProducts(data.data);
      } catch {
        showMessage('Failed to load products', 'error');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const openCreate = () => {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name:      product.name,
      image_url: product.image_url,
      model_url: product.model_url ?? '',
      price:     product.price,
      available: product.available,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async () => {
    if (!form.name || !form.image_url) {
      showMessage('Name and image URL are required', 'error');
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch(
        editingProduct ? `/api/products/${editingProduct._id}` : '/api/products',
        {
          method: editingProduct ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, category: activeCategory }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showMessage(editingProduct ? 'Product updated!' : 'Product created!', 'success');
      closeModal();
      const updated = await fetch('/api/products').then(r => r.json());
      if (updated.success) setProducts(updated.data);
    } catch (err: unknown) {
      showMessage(err instanceof Error ? err.message : 'Failed to save product', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setProducts(prev => prev.filter(p => p._id !== id));
      showMessage('Product deleted', 'success');
    } catch {
      showMessage('Failed to delete product', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleAvailable = async (product: Product) => {
    try {
      const res = await fetch(`/api/products/${product._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: !product.available }),
      });
      if (!res.ok) throw new Error();
      setProducts(prev =>
        prev.map(p => p._id === product._id ? { ...p, available: !p.available } : p),
      );
    } catch {
      showMessage('Failed to update availability', 'error');
    }
  };

  if (isLoading) return <div className="text-white p-4">Loading products…</div>;

  return (
    <div className="max-w-4xl px-4 sm:px-0">
      {/* Header */}
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1.5">Product Management</h2>
      <p className="text-neutral-400 mb-6 border-b border-neutral-800 pb-4 text-sm sm:text-base">
        Manage mesh outfits, food, and drink options available during registration.
      </p>

      {/* Toast — fixed on mobile so it's always visible */}
      {message && (
        <div className={`fixed bottom-4 left-4 right-4 sm:static sm:mb-6 z-50 p-4 rounded-lg font-medium text-sm shadow-lg sm:shadow-none ${
          message.type === 'success'
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          {message.text}
        </div>
      )}

      {/* Category Tabs — scrollable row on mobile */}
      <div className="-mx-4 sm:mx-0 px-4 sm:px-0 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory">
          {Object.entries(CATEGORY_CONFIG).map(([cat, cfg]) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat as ProductCategory)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all whitespace-nowrap shrink-0 snap-start
                  ${isActive
                    ? `${COLOR_MAP[cfg.color]} border-current`
                    : 'text-neutral-400 bg-neutral-900 border-neutral-800 hover:border-neutral-600'
                  }`}
              >
                <cfg.icon size={15} />
                {cfg.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/10' : 'bg-neutral-800'}`}>
                  {products.filter(p => p.category === cat).length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <ProductList
        products={products}
        activeCategory={activeCategory}
        deletingId={deletingId}
        onEdit={openEdit}
        onDelete={handleDelete}
        onToggleAvailable={handleToggleAvailable}
        onAdd={openCreate}
      />

      {isModalOpen && (
        <ProductModal
          isEditing={!!editingProduct}
          activeCategory={activeCategory}
          form={form}
          isSaving={isSaving}
          onChange={(patch) => setForm(prev => ({ ...prev, ...patch }))}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}
    </div>
  );
}