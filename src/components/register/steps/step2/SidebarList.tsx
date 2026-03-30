'use client';

import { Product, TicketType } from '@/app/register/useRegister';
import MiniCard from './MiniCard';

interface SidebarListProps {
  meshes: Product[];
  selectedmeshId: string | null;
  ticketType: TicketType;
  onToggle: (id: string) => void;
}

export default function SidebarList({ meshes, selectedmeshId, ticketType, onToggle }: SidebarListProps) {
  return (
    <div className="flex flex-col gap-2 w-36 shrink-0">
      {meshes.map((m) => (
        <MiniCard
          key={m._id}
          mesh={m}
          isSelected={selectedmeshId === m._id}
          ticketType={ticketType}
          onClick={() => onToggle(m._id)}
        />
      ))}
    </div>
  );
}