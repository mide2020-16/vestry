/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { ProductCategory } from "@/constants/ProductCategory";
import { ProductList } from "@/components/admin/products/ProductList";
import { ProductModal } from "@/components/admin/products/ProductModal";
import {
  CATEGORY_CONFIG,
  COLOR_MAP,
  EMPTY_FORM,
} from "@/components/admin/products/config";
import type { Product, ProductForm } from "@/types/product.types";
import { useSearchParams } from "next/navigation";
import EventSwitcher from "@/components/admin/EventSwitcher";
import { ConfirmationModal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export default function AdminProductsPage() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<ProductCategory>(
    ProductCategory.mesh,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  useEffect(() => {
    if (!eventId) return;
    (async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/products?eventId=${eventId}`);
        const data = await res.json();
        if (data.success) setProducts(data.data);
      } catch {
        showMessage("Failed to load products", "error");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [eventId]);

  const openCreate = () => {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      image_url: product.image_url,
      modelUrl: product.modelUrl ?? "",
      price: product.price,
      available: product.available,
      inscriptions: product.inscriptions ?? [],
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async () => {
    if (!form.name || !form.image_url || !eventId) {
      showMessage("Missing required fields or event selection", "error");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch(
        editingProduct
          ? `/api/products/${editingProduct._id}`
          : "/api/products",
        {
          method: editingProduct ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, category: activeCategory, eventId }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showMessage(editingProduct ? "Product updated!" : "Product created!", "success");
      closeModal();

      const updated = await fetch(`/api/products?eventId=${eventId}`).then((r) => r.json());
      if (updated.success) setProducts(updated.data);
    } catch (err: any) {
      showMessage(err.message || "Failed to save product", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setSelectedProductId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProductId) return;
    const id = selectedProductId;
    setIsDeleteModalOpen(false);
    setDeletingId(id);
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setProducts((prev) => prev.filter((p) => p && p._id !== id));
      showMessage("Product deleted", "success");
    } catch {
      showMessage("Failed to delete product", "error");
    } finally {
      setDeletingId(null);
      setSelectedProductId(null);
    }
  };

  const handleToggleAvailable = async (product: Product) => {
    try {
      const res = await fetch(`/api/products/${product._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: !product.available }),
      });
      if (!res.ok) throw new Error();
      setProducts((prev) =>
        prev.map((p) =>
          (p && p._id === product._id) ? { ...p, available: !p.available } : p,
        ),
      );
    } catch {
      showMessage("Failed to update availability", "error");
    }
  };

  if (!eventId) return (
    <div className="text-white p-10 flex flex-col items-center gap-6">
      <p className="text-muted-foreground">Please select an event to manage products.</p>
      <EventSwitcher />
    </div>
  );

  if (isLoading) return <div className="text-white p-20 text-center"><Button variant="ghost" isLoading /></div>;

  return (
    <div className="max-w-4xl px-4 sm:px-0 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-1.5 border-b border-neutral-800 pb-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Product Management</h2>
          <p className="text-neutral-400 text-sm">Manage items for this specific event.</p>
        </div>
        <EventSwitcher />
      </div>

      {message && (
        <div className={`p-4 rounded-lg mb-6 font-medium text-sm ${message.type === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
          {message.text}
        </div>
      )}

      <div className="mb-6">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {Object.entries(CATEGORY_CONFIG).map(([cat, cfg]) => {
            const isActive = activeCategory === cat;
            return (
              <Button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat as ProductCategory)}
                variant={isActive ? "outline" : "ghost"}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${isActive ? `${COLOR_MAP[cfg.color]} border-current` : "text-neutral-400"}`}
                leftIcon={<cfg.icon size={15} />}
              >
                {cfg.label}
              </Button>
            );
          })}
        </div>
      </div>

      <ProductList
        products={products}
        activeCategory={activeCategory}
        deletingId={deletingId}
        onEdit={openEdit}
        onDelete={handleDeleteClick}
        onToggleAvailable={handleToggleAvailable}
        onAdd={openCreate}
      />

      {isModalOpen && (
        <ProductModal
          isEditing={!!editingProduct}
          activeCategory={activeCategory}
          form={form}
          isSaving={isSaving}
          onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Product?"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        isLoading={deletingId !== null}
      />
    </div>
  );
}
