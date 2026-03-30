"use client";

import Image from "next/image";
import { Product, TicketType } from "@/app/register/useRegister";

function itemPrice(mesh: Product, ticketType: TicketType) {
  return mesh.price * (ticketType === "couple" ? 2 : 1);
}

interface GridCardProps {
  mesh: Product;
  ticketType: TicketType;
  isSelected: boolean;
  onSelect: () => void;
}

export default function GridCard({
  mesh,
  ticketType,
  isSelected,
  onSelect,
}: GridCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative p-3 rounded-2xl border-2 text-left transition-all duration-200 overflow-hidden
        ${
          isSelected
            ? "border-amber-400 bg-amber-400/10 shadow-[0_0_16px_rgba(251,191,36,0.12)]"
            : "border-white/10 bg-white/5 hover:border-white/20"
        }`}
    >
      {/* Deselect hint shown when selected */}
      {isSelected && (
        <span className="absolute top-2 right-2 z-10 text-[9px] font-semibold bg-amber-400 text-black px-1.5 py-0.5 rounded-full">
          ✕ deselect
        </span>
      )}
      <div className="relative w-full h-28 rounded-xl mb-2.5 overflow-hidden bg-white/5">
        <Image
          src={mesh.image_url}
          alt={mesh.name}
          fill
          sizes="50vw"
          className="object-cover"
        />
        {mesh.modelUrl && (
          <span className="absolute bottom-1.5 left-1.5 text-[9px] font-bold bg-amber-400 text-black px-1.5 py-0.5 rounded-full">
            3D
          </span>
        )}
      </div>
      <p
        className={`font-semibold text-sm leading-tight ${isSelected ? "text-amber-400" : "text-white"}`}
      >
        {mesh.name}
      </p>
      <p className="text-xs mt-0.5 text-white/40">
        ₦{itemPrice(mesh, ticketType).toLocaleString()}
        {ticketType === "couple" && (
          <span className="ml-1 text-white/25">×2</span>
        )}
      </p>
    </button>
  );
}
