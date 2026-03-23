'use client';

import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Product, mesh_COLORS, TicketType } from '../useRegister';

const MeshViewer = dynamic(() => import('@/components/MeshViewer'), { ssr: false });

/* ── Types ──────────────────────────────────────────────────────────────── */

interface Props {
  meshes: Product[];
  selectedmeshId: string | null;
  setSelectedmeshId: (id: string) => void;
  selectedmesh: Product | null;
  meshColor: string;
  setmeshColor: (c: string) => void;
  ticketType: TicketType;
  meshPrice: number;
}

/* ── Helpers ────────────────────────────────────────────────────────────── */

function itemPrice(mesh: Product, ticketType: TicketType) {
  return mesh.price * (ticketType === 'couple' ? 2 : 1);
}

/* ── MiniCard ───────────────────────────────────────────────────────────── */

interface MiniCardProps {
  mesh: Product;
  isSelected: boolean;
  ticketType: TicketType;
  onClick: () => void;
}

function MiniCard({ mesh, isSelected, ticketType, onClick }: MiniCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative p-2 rounded-xl border-2 text-left transition-all duration-200 w-full
        ${isSelected
          ? 'border-amber-400 bg-amber-400/10 shadow-[0_0_16px_rgba(251,191,36,0.12)]'
          : 'border-white/10 bg-white/5 hover:border-white/20'}`}
    >
      {isSelected && (
        <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_5px_rgba(251,191,36,0.9)] z-10" />
      )}
      <div className="relative w-full h-20 rounded-lg overflow-hidden bg-white/5 mb-1.5">
        <Image
          src={mesh.image_url}
          alt={mesh.name}
          fill
          sizes="140px"
          className="object-cover"
        />
        {mesh.model_url && (
          <span className="absolute bottom-1 left-1 text-[8px] font-bold bg-amber-400 text-black px-1 py-0.5 rounded-full">
            3D
          </span>
        )}
      </div>
      <p className={`font-semibold text-xs leading-tight truncate ${isSelected ? 'text-amber-400' : 'text-white'}`}>
        {mesh.name}
      </p>
      <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-amber-400/60' : 'text-white/40'}`}>
        ₦{itemPrice(mesh, ticketType).toLocaleString()}
      </p>
    </button>
  );
}

/* ── ColorPicker ────────────────────────────────────────────────────────── */

interface ColorPickerProps {
  meshColor: string;
  setmeshColor: (c: string) => void;
}

function ColorPicker({ meshColor, setmeshColor }: ColorPickerProps) {
  const activeLabel = mesh_COLORS.find((c) => c.value === meshColor)?.label;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-3">
      <div className="flex items-center justify-between mb-3">
        <p className="text-white/50 text-[10px] uppercase tracking-widest">Color</p>
        <p className="text-amber-400/70 text-[10px] font-medium">{activeLabel}</p>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {mesh_COLORS.map((c) => (
          <button
            type="button"
            key={c.value}
            title={c.label}
            onClick={() => setmeshColor(c.value)}
            aria-pressed={meshColor === c.value}
            style={{ backgroundColor: c.value }}
            className={`w-9 h-9 rounded-full border-2 transition-all duration-150
              ${meshColor === c.value
                ? 'border-amber-400 scale-110 shadow-[0_0_10px_rgba(251,191,36,0.55)]'
                : 'border-white/20 hover:border-white/50 hover:scale-105'}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ── GridCard (unselected full grid) ────────────────────────────────────── */

interface GridCardProps {
  mesh: Product;
  ticketType: TicketType;
  onSelect: () => void;
}

function GridCard({ mesh, ticketType, onSelect }: GridCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="relative p-3 rounded-2xl border-2 text-left transition-all duration-200 overflow-hidden border-white/10 bg-white/5 hover:border-white/20"
    >
      <div className="relative w-full h-28 rounded-xl mb-2.5 overflow-hidden bg-white/5">
        <Image
          src={mesh.image_url}
          alt={mesh.name}
          fill
          sizes="50vw"
          className="object-cover"
        />
        {mesh.model_url && (
          <span className="absolute bottom-1.5 left-1.5 text-[9px] font-bold bg-amber-400 text-black px-1.5 py-0.5 rounded-full">
            3D
          </span>
        )}
      </div>
      <p className="font-semibold text-sm leading-tight text-white">{mesh.name}</p>
      <p className="text-xs mt-0.5 text-white/40">
        ₦{itemPrice(mesh, ticketType).toLocaleString()}
        {ticketType === 'couple' && <span className="ml-1 text-white/25">×2</span>}
      </p>
    </button>
  );
}

/* ── SidebarList ────────────────────────────────────────────────────────── */

interface SidebarListProps {
  meshes: Product[];
  selectedmeshId: string | null;
  ticketType: TicketType;
  onSelect: (id: string) => void;
}

function SidebarList({ meshes, selectedmeshId, ticketType, onSelect }: SidebarListProps) {
  return (
    <div className="flex flex-col gap-2 w-35 shrink-0">
      {meshes.map((m) => (
        <MiniCard
          key={m._id}
          mesh={m}
          isSelected={selectedmeshId === m._id}
          ticketType={ticketType}
          onClick={() => onSelect(m._id)}
        />
      ))}
    </div>
  );
}

/* ── Step 2 ─────────────────────────────────────────────────────────────── */

export default function Step2mesh({
  meshes, selectedmeshId, setSelectedmeshId,
  selectedmesh, meshColor, setmeshColor,
  ticketType, meshPrice,
}: Props) {
  const has3D     = !!selectedmesh?.model_url;
  const hasImage  = !!selectedmesh && !has3D;

  return (
    <div className="flex flex-col gap-5">

      {/* Section label */}
      <div className="flex items-center gap-4 mb-6">
        <span className="text-amber-400/80 text-[13px] font-semibold uppercase tracking-[0.25em]">
          Select Your mesh
        </span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* 3D selected: sidebar + viewer */}
      {has3D && selectedmesh && (
        <div className="flex gap-4 items-start">
          <SidebarList
            meshes={meshes}
            selectedmeshId={selectedmeshId}
            ticketType={ticketType}
            onSelect={setSelectedmeshId}
          />
          <div className="flex-1 flex flex-col gap-3 min-w-0">
            <MeshViewer modelUrl={selectedmesh.model_url!} color={meshColor} />
            <ColorPicker meshColor={meshColor} setmeshColor={setmeshColor} />
          </div>
        </div>
      )}

      {/* Image-only selected: sidebar + large preview */}
      {hasImage && selectedmesh && (
        <div className="flex gap-4 items-start">
          <SidebarList
            meshes={meshes}
            selectedmeshId={selectedmeshId}
            ticketType={ticketType}
            onSelect={setSelectedmeshId}
          />
          <div className="flex-1 flex flex-col gap-3 min-w-0">
            <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 bg-white/5" style={{ height: 420 }}>
              <Image
                src={selectedmesh.image_url}
                alt={selectedmesh.name}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover"
                priority
              />
              <div className="absolute bottom-0 inset-x-0 px-4 py-3 bg-linear-to-t from-black/60 to-transparent">
                <p className="text-white font-semibold text-sm">{selectedmesh.name}</p>
                <p className="text-amber-400/70 text-xs mt-0.5">
                  ₦{itemPrice(selectedmesh, ticketType).toLocaleString()}
                  {ticketType === 'couple' && <span className="ml-1 text-white/30">×2</span>}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nothing selected: full grid */}
      {!selectedmesh && (
        <div className="grid grid-cols-2 gap-3">
          {meshes.map((m) => (
            <GridCard
              key={m._id}
              mesh={m}
              ticketType={ticketType}
              onSelect={() => setSelectedmeshId(m._id)}
            />
          ))}
        </div>
      )}

      {/* Subtotal */}
      <div className="flex justify-between items-center bg-white/5 rounded-xl px-4 py-3.5 border border-white/10 mt-6">
        <div>
          <span className="text-white/40 text-xs uppercase tracking-wide">Subtotal</span>
          <p className="text-white/25 text-[10px] mt-0.5">
            {selectedmesh ? selectedmesh.name : 'No mesh selected'}
          </p>
        </div>
        <span className="text-amber-400 font-bold text-lg">
          ₦{meshPrice.toLocaleString()}
        </span>
      </div>

    </div>
  );
}