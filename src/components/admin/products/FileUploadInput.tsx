"use client";

import { useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
import { AnimatedDecline, AnimatedSpinner } from "@/components/ui/Boop";

interface FileUploadInputProps {
  kind: "image" | "model";
  value: string;
  onChange: (url: string) => void;
  accept: string;
  placeholder: string;
  hint?: string;
  inputClassName?: string;
}

export function FileUploadInput({
  kind,
  value,
  onChange,
  accept,
  placeholder,
  hint,
  inputClassName = "",
}: FileUploadInputProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const endpoint = kind === "image" ? "productImage" : "productModel";

  const { startUpload } = useUploadThing(endpoint, {
    onUploadBegin(fileName) {
      console.log("[UploadThing] upload begin:", fileName);
    },
    onUploadProgress(progress) {
      console.log("[UploadThing] progress:", progress, "%");
    },
    onClientUploadComplete(res) {
      console.log("[UploadThing] client upload complete:", res);
    },
    onUploadError(err) {
      console.error("[UploadThing] upload error:", {
        message: err.message,
        code: err.code,
        data: err.data,
      });
    },
  });

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("[UploadThing] file selected:", {
      name: file.name,
      size: file.size,
      type: file.type,
      endpoint,
    });

    setIsUploading(true);
    setUploadError(null);

    try {
      console.log("[UploadThing] calling startUpload...");
      const res = await startUpload([file]);
      console.log("[UploadThing] startUpload response:", res);

      if (!res?.[0]?.url) {
        console.error("[UploadThing] no URL in response:", res);
        throw new Error("Upload failed, please try again");
      }

      console.log("[UploadThing] success, url:", res[0].url);
      onChange(res[0].url);
    } catch (err) {
      console.error("[UploadThing] caught error:", err);
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setUploadError(null);
            onChange(e.target.value);
          }}
          placeholder={placeholder}
          className={`flex-1 ${inputClassName}`}
        />
        {value && (
          <button
            type="button"
            aria-label="Clear"
            onClick={() => onChange("")}
            className="p-3 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 border border-neutral-700 rounded-lg transition-all"
          >
            <AnimatedDecline>
              <X size={15} />
            </AnimatedDecline>
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <input
          ref={fileRef}
          type="file"
          accept={accept}
          aria-label={`Upload ${kind} file`}
          className="hidden"
          onChange={handleFile}
        />
        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium border border-neutral-700 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 disabled:opacity-50 transition-all"
        >
          {isUploading ? (
            <>
              <AnimatedSpinner size={14} /> Uploading…
            </>
          ) : (
            <>
              <Upload size={13} /> Upload file
            </>
          )}
        </button>
        {hint && <p className="text-xs text-neutral-600">{hint}</p>}
      </div>

      {uploadError && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <AnimatedDecline>
          <X size={11} />
          </AnimatedDecline> {uploadError}
        </p>
      )}
    </div>
  );
}
