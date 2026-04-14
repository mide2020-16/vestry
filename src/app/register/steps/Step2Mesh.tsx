/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Trash2, Maximize2 } from "lucide-react";
import { Product, TicketType } from "../useRegister";
import ColorPicker from "@/components/register/steps/step2/ColorPicker";
import SizePicker from "@/components/register/steps/step2/SizePicker";
import GridCard from "@/components/register/steps/step2/GridCard";
import SidebarList from "@/components/register/steps/step2/SidebarList";
import InscriptionPicker from "@/components/register/steps/step2/InscriptionPicker";
import { Interactive, AnimatedChevron, AnimatedTrash } from "@/components/ui/Boop";

const MeshViewer = dynamic(() => import("@/components/MeshViewer"), {
  ssr: false,
});

interface Props {
  meshes: Product[];
  selectedMerch: {
    productId: string;
    quantity: number;
    color?: string;
    size?: string;
    inscriptions?: string;
  }[];
  setSelectedMerch: React.Dispatch<React.SetStateAction<Props["selectedMerch"]>>;
  meshColors: { label: string; value: string }[];
  meshSizes: string[];
  ticketType: TicketType;
  meshPrice: number;
}

function itemPrice(mesh: Product, qty: number) {
  return mesh.price * qty;
}

export default function Step2Mesh({
  meshes,
  selectedMerch,
  setSelectedMerch,
  meshColors,
  meshSizes,
  ticketType,
  meshPrice,
}: Props) {
  const [activeProductId, setActiveProductId] = useState<string | null>(
    selectedMerch[0]?.productId || null
  );
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  const toggleCollapse = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation(); // Don't trigger active selection focus when toggling collapse
    setCollapsedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Sync active item if selections change externally
  useEffect(() => {
    if (!activeProductId && selectedMerch.length > 0) {
      setActiveProductId(selectedMerch[0].productId);
    } else if (selectedMerch.length === 0) {
      setActiveProductId(null);
    }
  }, [selectedMerch, activeProductId]);

  const handleMerchToggle = (productId: string) => {
    const exists = selectedMerch.find((p) => p.productId === productId);
    if (exists) {
      const filtered = selectedMerch.filter((p) => p.productId !== productId);
      setSelectedMerch(filtered);
      if (activeProductId === productId) {
        setActiveProductId(filtered[0]?.productId || null);
      }
    } else {
      const product = meshes.find((m) => m._id === productId);
      if (!product) return;
      setActiveProductId(productId);
      setSelectedMerch((prev) => [
        ...prev,
        {
          productId,
          quantity: 1,
          color: meshColors[0]?.value,
          size: meshSizes[0],
        },
      ]);
    }
  };


  const updateMerch = (productId: string, updates: Partial<Props["selectedMerch"][0]>) => {
    setSelectedMerch((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, ...updates } : item
      )
    );
  };
  // ── Render Helpers ────────────────────────────────────────────────────────

  const renderItemConfig = (item: typeof selectedMerch[0]) => {
    const product = meshes.find((m) => m._id === item.productId);
    if (!product) return null;

    const isActive = activeProductId === item.productId;
    const isCollapsed = collapsedIds.has(item.productId);

    return (
      <div 
        key={item.productId} 
        onClick={() => {
          setActiveProductId(item.productId);
          if (isCollapsed) toggleCollapse(item.productId);
        }}
        className={`bg-card/50 backdrop-blur-sm border rounded-2xl p-6 transition-all duration-300 cursor-pointer group/config relative overflow-hidden
          ${isActive ? "border-amber-500/50 bg-amber-500/[0.03] shadow-[0_0_20px_rgba(245,158,11,0.1)]" : "border-border hover:border-border/60"}
          ${isCollapsed ? "py-4" : "space-y-6"}
        `}
      >
        <div className="flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <div className={`relative rounded-xl overflow-hidden border border-border bg-muted transition-all ${isCollapsed ? "w-10 h-10" : "w-16 h-16"}`}>
              <Image src={product.image_url} alt={product.name} fill className="object-cover" />
            </div>
            <div>
              <h3 className={`text-foreground font-bold transition-all ${isCollapsed ? "text-sm" : "text-base"}`}>{product.name}</h3>
              {!isCollapsed && <p className="text-amber-500 dark:text-amber-400 text-xs font-mono">₦{product.price.toLocaleString()}</p>}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              title="Remove"
              onClick={(e) => {
                e.stopPropagation();
                handleMerchToggle(item.productId);
              }}
              className="p-2 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
            >
              <AnimatedTrash>
                <Trash2 size={16} />
              </AnimatedTrash>
            </button>
            <button
              type="button"
              title={isCollapsed ? "Expand" : "Minimize"}
              onClick={(e) => toggleCollapse(item.productId, e)}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all"
            >
              {isCollapsed ? 
              <AnimatedChevron direction="down">
                <ChevronDown size={18} />
              </AnimatedChevron>
              : 
              <AnimatedChevron direction='up'>
                <ChevronUp size={18} />
              </AnimatedChevron>}
            </button>
          </div>
        </div>

        {isActive && !isCollapsed && <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />}

        {isCollapsed ? (
          <div className="flex flex-wrap items-center gap-3 pl-14 mt-1">
            {/* Quick Summary Tags */}
            <div className="flex items-center gap-1.5 bg-muted/40 border border-border px-2 py-1 rounded-lg">
              <span className="w-2.5 h-2.5 rounded-full border border-foreground/10" style={{ backgroundColor: item.color }} />
              <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                {meshColors.find(c => c.value === item.color)?.label || "Color"}
              </span>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500 px-2 py-0.5 rounded-lg text-[10px] font-bold">
              {item.size || "NO SIZE"}
            </div>
            <div className="text-[10px] text-muted-foreground font-mono">
              QTY: <span className="text-foreground font-bold">{item.quantity}</span>
            </div>
            {item.inscriptions && (
              <div className="text-[10px] text-amber-600/60 dark:text-amber-400/60 italic truncate max-w-[120px]">
                &quot;{item.inscriptions}&quot;
              </div>
            )}
            <div className="ml-auto flex items-center gap-1 text-[9px] text-muted-foreground uppercase tracking-widest font-black group-hover/config:text-amber-500/50 transition-colors">
              <Interactive>
                <Maximize2 size={10} /> 
              </Interactive>
              Click to expand
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <ColorPicker
              meshColor={item.color || ""}
              setmeshColor={(c) => updateMerch(item.productId, { color: c })}
              colors={meshColors}
            />
            <SizePicker
              meshSize={item.size || null}
              setMeshSize={(s) => updateMerch(item.productId, { size: s })}
              sizes={meshSizes}
            />
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                Quantity
              </span>
              <div className="flex flex-row items-center gap-2 bg-muted border border-border rounded-xl p-1 w-max">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateMerch(item.productId, { quantity: Math.max(1, item.quantity - 1) });
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-card hover:bg-accent transition-colors text-foreground"
                >
                  -
                </button>
                <span className="font-bold tabular-nums text-sm min-w-[2ch] flex justify-center text-amber-500">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateMerch(item.productId, { quantity: item.quantity + 1 });
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-card hover:bg-accent transition-colors text-foreground"
                >
                  +
                </button>
              </div>
            </div>
            <div data-tour="inscriptions">
              <InscriptionPicker
                inscriptions={product.inscriptions || []}
                selected={item.inscriptions || null}
                onSelect={(i) => updateMerch(item.productId, { inscriptions: i })}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── Main Layout ───────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-8">
      {/* 0. 3D Model Viewer / Image Fallback */}
      {selectedMerch.length > 0 && activeProductId && (() => {
        const activeItem = selectedMerch.find(m => m.productId === activeProductId) || selectedMerch[0];
        const activeProduct = meshes.find((m) => m._id === activeItem.productId);
        if (!activeProduct) return null;

        return (
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-linear-to-r from-amber-500 to-amber-600 rounded-3xl blur-2xl opacity-10 group-hover:opacity-20 transition duration-1000" />
            
            {activeProduct.modelUrl ? (
              <MeshViewer
                color={activeItem.color || meshColors[0]?.value || "#ffffff"}
                modelUrl={activeProduct.modelUrl}
              />
            ) : (
              <div className="w-full h-105 rounded-2xl overflow-hidden bg-muted border border-border flex items-center justify-center relative">
                <Image 
                  src={activeProduct.image_url} 
                  alt={activeProduct.name} 
                  fill 
                  className="object-contain p-12 opacity-60 group-hover:opacity-80 transition-opacity"
                />
                <div className="absolute inset-0 bg-linear-to-t from-background/40 to-transparent" />
                <div className="absolute bottom-6 left-6 flex items-center gap-2">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" />
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                    3D Model Unavailable
                  </p>
                </div>
              </div>
            )}

            <div className="absolute top-4 left-4 bg-black/40 dark:bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
                {activeProduct.modelUrl ? "3D Interactive Preview" : "Static Preview"}
              </p>
            </div>
          </div>
        );
      })()}

      {/* 1. Header & Selection Grid */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-amber-600 dark:text-amber-400/90 text-[11px] font-black uppercase tracking-[0.3em] whitespace-nowrap">
            Available Merchandise
          </span>
          <div className="flex-1 h-px bg-border/50" />
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" data-tour="mesh-customization">
          {meshes.map((m) => {
            const isSelected = selectedMerch.some((item) => item.productId === m._id);
            return (
              <GridCard
                key={m._id}
                mesh={m}
                ticketType={ticketType}
                isSelected={isSelected}
                onSelect={() => handleMerchToggle(m._id)}
              />
            );
          })}
        </div>
      </div>

      {/* 2. Configuration for Selected Items */}
      {selectedMerch.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <span className="text-amber-600 dark:text-amber-400/90 text-[11px] font-black uppercase tracking-[0.3em] whitespace-nowrap">
              Customize Selections ({selectedMerch.length})
            </span>
            <div className="flex-1 h-px bg-border/50" />
          </div>

          <div className="flex flex-col gap-6">
            {selectedMerch.map(renderItemConfig)}
          </div>
        </div>
      )}

      {/* 3. Validation Messages */}
      {selectedMerch.some((item) => !item.size) && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg py-2 px-4 animate-pulse">
          <p className="text-amber-500/80 text-[10px] font-bold text-center uppercase tracking-tighter">
            ⚠ Please choose a size for all selected items
          </p>
        </div>
      )}

      {/* 4. Persistent Summary */}
      <div className="sticky bottom-0 bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-4 flex justify-between items-center shadow-2xl z-20">
        <div className="space-y-1">
          <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest block">
            Merchandise Total
          </span>
          <div className="flex items-center gap-2">
            <p className="text-foreground text-xs font-bold">
              {selectedMerch.length > 0 
                ? `${selectedMerch.length} item${selectedMerch.length > 1 ? 's' : ''} selected` 
                : "Select items above"}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-amber-500 text-2xl font-black tabular-nums tracking-tighter">
            ₦{meshPrice.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
