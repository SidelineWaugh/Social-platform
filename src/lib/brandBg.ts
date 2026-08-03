/**
 * Code-drawn "Brand Kit" backgrounds.
 *
 * These render an event in a host club's colours with no image-generation cost:
 * every style is a layered CSS `background` string computed from two brand
 * colours (primary + accent). Because it's pure CSS/SVG it stays crisp at any
 * size and exports cleanly in the downloaded PNG. The same helper drives the
 * live graphic, the picker swatches, and the admin previews so they always match.
 */

export const BRAND_STYLE_KEYS = ["deep", "spotlight", "palm", "blades"] as const;
export type BrandStyleKey = (typeof BRAND_STYLE_KEYS)[number];

export const BRAND_STYLES: { key: BrandStyleKey; label: string }[] = [
  { key: "deep", label: "Deep" },
  { key: "spotlight", label: "Spotlight" },
  { key: "palm", label: "Palm" },
  { key: "blades", label: "Blades" },
];

export function isBrandStyle(v: string): v is BrandStyleKey {
  return (BRAND_STYLE_KEYS as readonly string[]).includes(v);
}

/* ------------------------------- colour math ------------------------------ */

type Rgb = [number, number, number];

/** Parse `#rgb`, `#rrggbb`, or `rgb(r,g,b)` to a tuple. */
function toRgb(color: string): Rgb {
  const c = color.trim();
  const m = c.match(/^rgba?\(([^)]+)\)$/i);
  if (m) {
    const parts = m[1].split(",").map((n) => parseInt(n, 10));
    if (parts.length >= 3 && parts.every((n) => !Number.isNaN(n))) {
      return [parts[0], parts[1], parts[2]];
    }
  }
  let h = c.replace("#", "");
  if (h.length === 3) h = h.split("").map((ch) => ch + ch).join("");
  if (h.length !== 6) return [20, 67, 42]; // sensible pine-green fallback
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function toHex([r, g, b]: Rgb): string {
  const h = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

/** rgba() from any colour string + alpha. */
function alpha(color: string, a: number): string {
  const [r, g, b] = toRgb(color);
  return `rgba(${r},${g},${b},${a})`;
}

/** Mix a colour toward black (t=0 unchanged … t=1 black). */
function shade(color: string, t: number): string {
  const [r, g, b] = toRgb(color);
  const k = 1 - t;
  return toHex([r * k, g * k, b * k]);
}

/** Mix a colour toward white (t=0 unchanged … t=1 white). */
function tint(color: string, t: number): string {
  const [r, g, b] = toRgb(color);
  return toHex([r + (255 - r) * t, g + (255 - g) * t, b + (255 - b) * t]);
}

/**
 * Derive a bright accent from a primary colour when the event has no explicit
 * second colour set — a lighter version of the same hue.
 */
export function deriveAccent(primary: string): string {
  return tint(primary, 0.55);
}

/* -------------------------------- palm SVG -------------------------------- */

/** A stylised palm silhouette, tinted with the accent colour, for the "palm" style. */
function palmLayer(accent: string): string {
  const fill = alpha(accent, 0.075);
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>` +
    `<g fill='${fill}'>` +
    // trunk
    `<path d='M99 74 C104 108 112 140 128 190 L138 190 C120 140 112 108 110 74 Z'/>` +
    // fronds radiating from the crown (~100,72)
    `<path d='M100 72 C60 40 26 40 4 58 C34 52 66 58 100 78 Z'/>` +
    `<path d='M100 72 C140 40 174 40 196 58 C166 52 134 58 100 78 Z'/>` +
    `<path d='M100 72 C70 30 44 16 20 14 C48 26 74 46 100 80 Z'/>` +
    `<path d='M100 72 C130 30 156 16 180 14 C152 26 126 46 100 80 Z'/>` +
    `<path d='M100 72 C92 34 86 18 92 2 C100 24 104 46 104 78 Z'/>` +
    `<path d='M100 72 C108 34 114 18 108 2 C100 24 96 46 96 78 Z'/>` +
    `<circle cx='100' cy='72' r='7'/>` +
    `</g></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/* --------------------------------- styles --------------------------------- */

/**
 * Return a CSS `background` shorthand for a brand style, computed from the
 * event's primary + accent colours. Usable anywhere a single `background`
 * value is accepted (the graphic, swatches, previews).
 */
export function brandBackground(
  style: string,
  primary: string,
  accent: string | null | undefined,
): string {
  const a = accent && accent.trim() ? accent : deriveAccent(primary);

  switch (style) {
    case "spotlight":
      return [
        `radial-gradient(70% 55% at 50% 34%, ${alpha(tint(primary, 0.22), 0.9)} 0%, ${shade(
          primary,
          0.15,
        )} 44%, ${shade(primary, 0.72)} 100%)`,
      ].join(", ");

    case "palm":
      return [
        `${palmLayer(a)} no-repeat 116% -12% / 52% auto`,
        `radial-gradient(90% 60% at 80% 0%, ${alpha(a, 0.1)} 0%, transparent 55%)`,
        `linear-gradient(165deg, ${shade(primary, 0.32)} 0%, ${shade(primary, 0.62)} 55%, ${shade(
          primary,
          0.82,
        )} 100%)`,
      ].join(", ");

    case "blades":
      return [
        `repeating-linear-gradient(118deg, transparent 0 46px, ${alpha(a, 0.05)} 46px 48px)`,
        `linear-gradient(125deg, ${alpha(a, 0.14)} 0%, transparent 30%)`,
        `linear-gradient(150deg, ${shade(primary, 0.1)} 0%, ${shade(primary, 0.72)} 100%)`,
      ].join(", ");

    case "deep":
    default:
      return [
        `radial-gradient(95% 65% at 50% -12%, ${alpha(a, 0.16)} 0%, transparent 58%)`,
        `linear-gradient(180deg, ${shade(primary, 0.06)} 0%, ${shade(primary, 0.5)} 52%, ${shade(
          primary,
          0.8,
        )} 100%)`,
      ].join(", ");
  }
}
