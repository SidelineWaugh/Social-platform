"use client";

import { useRef, useState, type ReactNode } from "react";

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

/** Downscale an image file to a data URL no larger than `maxDim` on its long edge. */
async function resizeToDataUrl(file: File, maxDim: number, mime: string): Promise<string> {
  const img = await loadImage(file);
  let w = img.naturalWidth || maxDim;
  let h = img.naturalHeight || maxDim;
  const scale = Math.min(1, maxDim / Math.max(w, h));
  w = Math.max(1, Math.round(w * scale));
  h = Math.max(1, Math.round(h * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas context");
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL(mime, mime === "image/jpeg" ? 0.85 : undefined);
}

/**
 * A form whose file input is resized to a compact data URL in the browser
 * before submit, then posted to a Server Action as `fieldName`. Keeps uploads
 * small and reliable (works within the Server Action body limit, renders in the
 * exported PNG, and stays light in the DB).
 */
export function ImageUploadForm({
  action,
  fieldName,
  hidden,
  maxDim = 256,
  mime = "image/png",
  buttonLabel = "Upload",
  children,
}: {
  action: (formData: FormData) => void | Promise<void>;
  fieldName: string;
  hidden: Record<string, string>;
  maxDim?: number;
  mime?: string;
  buttonLabel?: string;
  children?: ReactNode;
}) {
  const dataRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  async function onFile(file?: File) {
    if (!file) return;
    setWorking(true);
    setError("");
    try {
      if (dataRef.current) dataRef.current.value = await resizeToDataUrl(file, maxDim, mime);
      setFileName(file.name);
    } catch {
      setError("Couldn't read that image");
      setFileName("");
    } finally {
      setWorking(false);
    }
  }

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      {Object.entries(hidden).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <input ref={dataRef} type="hidden" name={fieldName} />
      {children}
      <label className="cursor-pointer rounded bg-panel-2 px-2.5 py-1 text-xs text-ink transition hover:bg-white/10">
        Choose image
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
      </label>
      <span className="max-w-[120px] truncate text-xs text-ink-faint">
        {working ? "Processing…" : error || fileName || "No file"}
      </span>
      <button
        type="submit"
        disabled={working}
        className="rounded bg-brand px-2.5 py-1 font-cond text-xs font-bold uppercase text-white transition hover:brightness-110 disabled:opacity-60"
      >
        {buttonLabel}
      </button>
    </form>
  );
}
