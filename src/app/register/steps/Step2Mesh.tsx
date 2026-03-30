"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Product, TicketType } from "../useRegister";
import ColorPicker from "@/components/register/steps/step2/ColorPicker";
import SizePicker from "@/components/register/steps/step2/SizePicker";
import GridCard from "@/components/register/steps/step2/GridCard";
import SidebarList from "@/components/register/steps/step2/SidebarList";
import InscriptionPicker from "@/components/register/steps/step2/InscriptionPicker";

const MeshViewer = dynamic(() => import("@/components/MeshViewer"), {
  ssr: false,
});

interface Props {
  meshes: Product[];
  selectedmeshId: string | null;
  setSelectedmeshId: (id: string | null) => void;
  selectedmesh: Product | null;
  meshColor: string;
  setmeshColor: (c: string) => void;
  meshSize: string | null;
  setMeshSize: (s: string) => void;
  meshColors: { label: string; value: string }[];
  meshSizes: string[];
  meshInscriptions: string | null;
  setmeshInscriptions: (i: string) => void;
  ticketType: TicketType;
  meshPrice: number;
}

function itemPrice(mesh: Product, ticketType: TicketType) {
  return mesh.price * (ticketType === "couple" ? 2 : 1);
}

export default function Step2Mesh({
  meshes,
  selectedmeshId,
  setSelectedmeshId,
  selectedmesh,
  meshColor,
  meshColors,
  setmeshColor,
  meshSize,
  meshSizes,
  setMeshSize,
  meshInscriptions,
  setmeshInscriptions,
  ticketType,
  meshPrice,
}: Props) {
  const toggleMesh = (id: string) => {
    setSelectedmeshId(selectedmeshId === id ? null : id);
  };

  // ── Render Helpers ────────────────────────────────────────────────────────

  const renderViewport = () => {
    if (!selectedmesh) return null;

    if (selectedmesh.modelUrl) {
      return <MeshViewer modelUrl={selectedmesh.modelUrl} color={meshColor} />;
    }

    return (
      <div className="relative w-full aspect-square sm:h-75 rounded-2xl overflow-hidden border border-white/10 bg-white/5">
        <Image
          src={selectedmesh.image_url}
          alt={selectedmesh.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute bottom-0 inset-x-0 p-4 bg-linear-to-t from-black/80 to-transparent">
          <p className="text-white font-bold text-sm">{selectedmesh.name}</p>
          <p className="text-amber-400/80 text-xs tabular-nums">
            ₦{itemPrice(selectedmesh, ticketType).toLocaleString()}
            {ticketType === "couple" && (
              <span className="opacity-50 ml-1">×2</span>
            )}
          </p>
        </div>
      </div>
    );
  };

  // ── Main Layout ───────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">
      {/* Header Label */}
      <div className="flex items-center gap-4">
        <span className="text-amber-400/90 text-[11px] font-black uppercase tracking-[0.3em]">
          Merchandise Selection
        </span>
        <div className="flex-1 h-px bg-white/5" />
      </div>

      {/* Primary Selection Area */}
      {selectedmesh ? (
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          {/* Left: Quick Switch Sidebar */}
          <SidebarList
            meshes={meshes}
            selectedmeshId={selectedmeshId}
            ticketType={ticketType}
            onToggle={toggleMesh}
          />

          {/* Right: Preview & Controls */}
          <div className="flex-1 flex flex-col gap-4 w-full min-w-0">
            {renderViewport()}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ColorPicker 
                meshColor={meshColor} 
                setmeshColor={setmeshColor} 
                colors={meshColors}
              />
              <SizePicker 
                meshSize={meshSize} 
                setMeshSize={setMeshSize} 
                sizes={meshSizes}
              />
              <InscriptionPicker
                inscriptions={selectedmesh.inscriptions || []}
                selected={meshInscriptions}
                onSelect={setmeshInscriptions}
              />
            </div>
          </div>
        </div>
      ) : (
        /* Grid view when nothing is selected */
        <div className="grid grid-cols-2 gap-4">
          {meshes.map((m) => (
            <GridCard
              key={m._id}
              mesh={m}
              ticketType={ticketType}
              isSelected={selectedmeshId === m._id}
              onSelect={() => toggleMesh(m._id)}
            />
          ))}
        </div>
      )}

      {/* Validation Message */}
      {selectedmesh && !meshSize && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg py-2 px-4 animate-pulse">
          <p className="text-amber-500/80 text-[10px] font-bold text-center uppercase tracking-tighter">
            ⚠ Please choose a size to finalize selection
          </p>
        </div>
      )}

      {/* Persistent Footer / Summary */}
      <div className="sticky bottom-0 bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex justify-between items-center shadow-2xl">
        <div className="space-y-1">
          <span className="text-[9px] text-white/30 uppercase font-black tracking-widest block">
            Running Total
          </span>
          <div className="flex items-center gap-2">
            <p className="text-white text-xs font-bold truncate max-w-37.5">
              {selectedmesh ? selectedmesh.name : "Select an item"}
            </p>
            {selectedmesh && meshColor && (
              <div
                className="w-2.5 h-2.5 rounded-full ring-2 ring-black/50 shadow-sm"
                style={{ backgroundColor: meshColor }}
              />
            )}
            {meshSize && (
              <span className="text-[10px] font-black text-white/20 bg-white/5 px-1.5 py-0.5 rounded">
                {meshSize}
              </span>
            )}
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
