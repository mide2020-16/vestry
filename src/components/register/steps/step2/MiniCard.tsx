'use client';

import Image from 'next/image';
import { Product, TicketType } from '@/app/register/useRegister';

function itemPrice(mesh: Product, ticketType: TicketType) {
  return mesh.price * (ticketType === 'couple' ? 2 : 1);
}

interface MiniCardProps {
  mesh: Product;
  isSelected: boolean;
  ticketType: TicketType;
  onClick: () => void;
}

export default function MiniCard({ mesh, isSelected, ticketType, onClick }: MiniCardProps) {
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
        <Image src={mesh.image_url} alt={mesh.name} fill sizes="140px" className="object-cover" />
        {mesh.modelUrl && (
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