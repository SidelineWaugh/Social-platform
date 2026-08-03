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

/** Render an image onto a canvas at a given long-edge size and return a data URL. */
function encodeAt(img: HTMLImageElement, maxDim: number, mime: string, quality: number): string {
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
  return canvas.toDataURL(mime, mime === "image/jpeg" ? quality : undefined);
}

// Keep every upload comfortably under the Server Action body limit (default 1MB
// on some hosts). A logo that encodes larger than this was silently dropped
// before — now we shrink it (quality first for JPEG, then dimensions) until it
// fits, so uploads always persist.
const MAX_DATAURL_CHARS = 900_000;

/**
 * Downscale an image file to a data URL that starts at `maxDim` on its long edge
 * and is guaranteed to fit within MAX_DATAURL_CHARS. Detailed crests can encode
 * larger than expected, so we back off dimensions/quality until it's safe.
 */
async function resizeToDataUrl(file: File, maxDim: number, mime: string): Promise<string> {
  const img = await loadImage(file);
  let dim = maxDim;
  let quality = 0.85;
  let out = encodeAt(img, dim, mime, quality);
  let guard = 0;
  while (out.length > MAX_DATAURL_CHARS && guard < 12) {
    guard++;
    if (mime === "image/jpeg" && quality > 0.5) {
      quality -= 0.1;
    } else {
      dim = Math.max(96, Math.round(dim * 0.82));
    }
    out = encodeAt(img, dim, mime, quality);
    if (dim <= 96 && quality <= 0.5) break;
  }
  return out;
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
