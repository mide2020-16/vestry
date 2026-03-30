/* eslint-disable @typescript-eslint/no-explicit-any */
import { Registration } from '@/types/receipt.types';
import { TicketQR } from './TicketQR';

function ReceiptRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-4 py-2">
      <span className="text-neutral-500 text-sm shrink-0">{label}</span>
      <div className="text-right">{children}</div>
    </div>
  );
}

function TearLine() {
  return (
    <div className="flex items-center">
      <div className="w-5 h-5 rounded-full bg-neutral-950 -ml-2.5 shrink-0" />
      <div className="flex-1 border-t-2 border-dashed border-neutral-800 mx-1" />
      <div className="w-5 h-5 rounded-full bg-neutral-950 -mr-2.5 shrink-0" />
    </div>
  );
}

export function ReceiptCard({ registration }: { registration: Registration }) {
  const eventDate = new Date(registration.createdAt).toLocaleDateString('en-NG', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="w-full bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl mt-8">
      {/* Header */}
      <div className="bg-linear-to-r from-amber-400 to-amber-500 px-6 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-black font-black text-lg uppercase tracking-widest leading-none">Vestry</p>
            <p className="text-black/55 text-xs font-medium mt-0.5">Official Entry Ticket</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-black/50 text-[10px] uppercase tracking-widest">REF</p>
            <p className="text-black font-mono font-bold text-xs mt-0.5 break-all max-w-30">
              {registration.paystackReference}
            </p>
          </div>
        </div>
      </div>

      <TearLine />

      <div className="px-6 py-4">
        <ReceiptRow label={registration.ticketType === 'couple' ? 'Attendees' : 'Attendee'}>
          <p className="text-white font-semibold text-sm">{registration.name}</p>
          {registration.partnerName && (
            <p className="text-neutral-400 text-sm">💝 {registration.partnerName}</p>
          )}
        </ReceiptRow>
        <ReceiptRow label="Email">
          <p className="text-white text-sm break-all">{registration.email}</p>
        </ReceiptRow>
        <ReceiptRow label="Ticket">
          <span className="text-xs font-bold uppercase tracking-widest text-black bg-amber-400 px-2 py-0.5 rounded-full">
            {registration.ticketType}
          </span>
        </ReceiptRow>
        {registration.meshSelection && (
          <ReceiptRow label="mesh">
            <p className="text-white text-sm">{registration.meshSelection.name}</p>
          </ReceiptRow>
        )}
        {(registration.foodSelections?.length ?? 0) > 0 && (
          <ReceiptRow label="Food">
            {registration.foodSelections?.map((f: any) => (
              <p key={f.name} className="text-white text-sm">{f.name}</p>
            ))}
          </ReceiptRow>
        )}
        {registration.drinkSelection && (
          <ReceiptRow label="Drink">
            <p className="text-white text-sm">{registration.drinkSelection.name}</p>
          </ReceiptRow>
        )}
        <ReceiptRow label="Date">
          <p className="text-white text-sm">{eventDate}</p>
        </ReceiptRow>
      </div>

      <TearLine />

      <div className="px-6 py-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-neutral-500 text-xs uppercase tracking-widest mb-1">Amount Paid</p>
          <p className="text-3xl font-black text-white tracking-tight">
            ₦{registration.totalAmount.toLocaleString()}
          </p>
        </div>
        <TicketQR reference={registration.paystackReference} />
      </div>

      <div className="px-6 pb-5">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Payment Confirmed</span>
        </div>
      </div>
    </div>
  );
}