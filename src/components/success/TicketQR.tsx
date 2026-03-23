'use client';

import { QRCodeSVG } from 'qrcode.react';

export function TicketQR({ reference }: { reference: string }) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="w-14 h-14 bg-white rounded-xl p-1.5 shrink-0">
      <QRCodeSVG
        value={`${origin}/success?ref=${reference}`}
        size={44}
        bgColor="#ffffff"
        fgColor="#000000"
        level="M"
      />
    </div>
  );
}