"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { toPng } from "html-to-image";
import { GraphicCanvas } from "./GraphicCanvas";
import { Controls } from "./Controls";
import { FORMAT_MAP } from "@/lib/formats";
import type {
  GraphicState,
  EventBrand,
  ClubData,
  BackgroundData,
  TemplateId,
} from "@/lib/types";

export function Studio({
  event,
  clubs,
  backgrounds,
}: {
  event: EventBrand;
  clubs: ClubData[];
  backgrounds: BackgroundData[];
}) {
  const [state, setState] = useState<GraphicState>(() => ({
    template: (event.enabledTemplates[0] ?? "were-in") as TemplateId,
    format: "portrait",
    clubName: "",
    backgroundId: backgrounds[0]?.id ?? "none",
    uploadedImage: null,
    ageGroup: "U14 Boys Elite",
    opponent: "",
    kickoff: "Fri · 10:00 AM",
    field: "Field 3",
    ourScore: "3",
    theirScore: "1",
    championTitle: "Division Champions",
    games: [
      { opponent: "", detail: "Fri 10:00 AM · Field 3" },
      { opponent: "", detail: "Sat 8:00 AM · Field 1" },
      { opponent: "", detail: "Sun 12:00 PM · Field 5" },
    ],
    targetDate: event.startDateIso ?? "",
    countdownLabel: "Kickoff",
    bracketName: "U14 Boys Elite",
    bracketTeams: clubs.slice(0, 8).map((c) => c.name),
  }));

  const [today, setToday] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  useEffect(() => setToday(new Date().toISOString().slice(0, 10)), []);

  const update = useCallback(
    (patch: Partial<GraphicState>) => setState((s) => ({ ...s, ...patch })),
    [],
  );

  const fmt = FORMAT_MAP[state.format];
  const clubLogo = clubs.find((c) => c.name === state.clubName)?.logoUrl ?? null;

  const download = async () => {
    const node = captureRef.current;
    if (!node) return;
    setDownloading(true);
    try {
      await document.fonts?.ready;
      const dataUrl = await toPng(node, {
        width: fmt.width,
        height: fmt.height,
        pixelRatio: 1,
        cacheBust: true,
      });
      const slug = (state.clubName || "club")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const a = document.createElement("a");
      a.download = `${event.shortName.toLowerCase().replace(/\s+/g, "-")}-${state.template}-${slug}.png`;
      a.href = dataUrl;
      a.click();
    } catch (err) {
      console.error(err);
      alert("Sorry — rendering the image failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  // Theme the studio chrome (buttons/borders) to the event's brand color.
  const brandStyle = { ["--color-brand"]: event.brandColor } as CSSProperties;

  return (
    <div
      style={brandStyle}
      className="mx-auto grid max-w-[1240px] gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:px-6"
    >
      {/* Live preview */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <PreviewStage width={fmt.width} height={fmt.height} captureRef={captureRef}>
          <GraphicCanvas
            event={event}
            backgrounds={backgrounds}
            clubs={clubs}
            clubLogo={clubLogo}
            state={state}
            today={today}
          />
        </PreviewStage>

        <div className="mt-5 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={download}
            disabled={downloading}
            className="inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3 font-cond text-[15px] font-bold uppercase tracking-[0.14em] text-white shadow-[0_12px_30px_-10px_rgba(232,58,72,0.9)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {downloading ? "Rendering…" : "⬇  Download graphic"}
          </button>
          <p className="text-xs text-ink-faint">
            {fmt.width} × {fmt.height}px · ready to post
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="thin-scroll lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pr-1">
        <Controls
          state={state}
          update={update}
          event={event}
          clubs={clubs}
          backgrounds={backgrounds}
        />
      </div>
    </div>
  );
}

/* ----------------------------- preview stage ---------------------------- */

function PreviewStage({
  width,
  height,
  captureRef,
  children,
}: {
  width: number;
  height: number;
  captureRef: RefObject<HTMLDivElement | null>;
  children: ReactNode;
}) {
  const holder = useRef<HTMLDivElement>(null);
  const [avail, setAvail] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const el = holder.current;
    if (!el) return;
    const measure = () =>
      setAvail({ w: el.clientWidth, h: Math.max(360, window.innerHeight * 0.74) });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const scale = avail.w > 0 ? Math.min(avail.w / width, avail.h / height) : 0;
  const dispW = Math.round(width * scale);
  const dispH = Math.round(height * scale);

  return (
    <div ref={holder} className="flex w-full justify-center">
      <div
        style={{
          width: dispW || "100%",
          height: dispH || undefined,
          borderRadius: 20,
          overflow: "hidden",
          background: "#0b1020",
          boxShadow: "0 34px 70px -28px rgba(0,0,0,0.8)",
        }}
      >
        <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
          <div ref={captureRef} style={{ width, height }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
