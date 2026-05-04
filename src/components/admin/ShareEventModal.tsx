"use client";

import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Share2, Download, Copy, Check, X } from "lucide-react";
import { AnimatedDecline } from "@/components/ui/Boop";
import { Button } from "@/components/ui/Button";

export default function ShareEventModal({ eventSlug }: { eventSlug: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<SVGSVGElement>(null);

  // Use the specific domain requested by the user
  const eventUrl = `https://vestry-beta.vercel.app/event/${eventSlug}/register`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  const handleDownloadQR = () => {
    if (!qrRef.current) return;
    const svg = qrRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `vestry-qr-${eventSlug}.png`;
        downloadLink.href = `${pngFile}`;
        downloadLink.click();
      }
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="bg-blue-500/10 border-blue-500/20 text-blue-500 hover:bg-blue-500/20 hover:border-blue-500/40"
        leftIcon={<Share2 size={16} />}
      >
        <span className="hidden sm:inline">Share Event</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border rounded-[2rem] w-full max-w-md p-8 shadow-2xl relative">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors"
            >
              <AnimatedDecline><X size={24} /></AnimatedDecline>
            </button>
            
            <h2 className="text-2xl font-black text-foreground mb-2">Share Your Event</h2>
            <p className="text-muted-foreground text-sm mb-8">
              Attendees can scan this QR code or use the link below to register.
            </p>

            <div className="flex flex-col items-center justify-center bg-white p-6 rounded-3xl mb-8 shadow-inner shadow-black/5">
              <QRCodeSVG
                value={eventUrl}
                size={200}
                bgColor={"#ffffff"}
                fgColor={"#0a0a0a"}
                level={"H"}
                ref={qrRef}
                includeMargin={false}
              />
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleDownloadQR}
                variant="secondary"
                className="w-full py-4"
                leftIcon={<Download size={16} />}
              >
                Download QR Code
              </Button>

              <div className="relative group">
                <input
                  type="text"
                  readOnly
                  value={eventUrl}
                  className="w-full bg-muted/50 border border-border rounded-xl px-4 py-4 pr-24 text-sm text-foreground font-mono focus:outline-hidden"
                />
                <button
                  onClick={handleCopy}
                  className="absolute right-2 top-2 bottom-2 px-4 bg-amber-500 text-amber-950 font-bold text-xs uppercase tracking-widest rounded-lg flex items-center gap-1 hover:bg-amber-400 transition-colors"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
