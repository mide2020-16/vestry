/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { RegistrationPDF } from "./RegistrationPDF";
import { FileText, Loader2 } from "lucide-react";

export interface RegistrationForPDF {
  _id: string;
  name: string;
  email: string;
  ticketType: string;
  meshSelection?: { name: string };
  meshSize?: string;
  meshColor?: string;
  meshInscriptions?: string;
  merch?: {
    name: string;
    quantity: number;
    color?: string;
    size?: string;
    inscriptions?: string;
  }[];
  totalAmount: number;
}

interface DownloadButtonProps {
  registrations: RegistrationForPDF[];
}

export default function DownloadButton({ registrations }: DownloadButtonProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <button
        type="button"
        disabled
        className="flex items-center gap-2 bg-neutral-800 text-neutral-500 px-6 py-3 rounded-xl font-bold text-sm border border-neutral-700 opacity-50"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        Initializing...
      </button>
    );
  }

  return (
    <PDFDownloadLink
      document={<RegistrationPDF registrations={registrations} />}
      fileName={`Vestry_Master_Registry_${new Date().toISOString().split("T")[0]}.pdf`}
      style={{ textDecoration: "none" }}
      className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 active:scale-95 transition-all text-black px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-amber-500/20"
    >
      {({ loading, error }) => (
        <>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          <span>
            {error
              ? "Error Generating"
              : loading
                ? "Compiling PDF..."
                : "Download Master Registry"}
          </span>
        </>
      )}
    </PDFDownloadLink>
  );
}
