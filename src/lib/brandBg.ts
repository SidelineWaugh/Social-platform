/**
 * Code-drawn "Brand Kit" backgrounds.
 *
 * These render an event in a host club's colours with no image-generation cost:
 * every style is a layered CSS `background` string computed from two brand
 * colours (primary + accent). Because it's pure CSS/SVG it stays crisp at any
 * size and exports cleanly in the downloaded PNG. The same helper drives the
 * live graphic, the picker swatches, and the admin previews so they always match.
 */

export const BRAND_STYLE_KEYS = ["deep", "spotlight", "crest", "blades"] as const;
export type BrandStyleKey = (typeof BRAND_STYLE_KEYS)[number];

export const BRAND_STYLES: { key: BrandStyleKey; label: string }[] = [
  { key: "deep", label: "Deep" },
  { key: "spotlight", label: "Spotlight" },
  { key: "crest", label: "Crest" },
  { key: "blades", label: "Blades" },
];

export function isBrandStyle(v: string): v is BrandStyleKey {
  return (BRAND_STYLE_KEYS as readonly string[]).includes(v);
}

/**
 * The "crest" style renders the event logo as a large faded watermark (drawn in
 * the canvas, which has the logo). "palm" is the legacy key for the same slot.
 */
export function usesLogoWatermark(style: string): boolean {
  return style === "crest" || style === "palm";
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
  // A tonal vignette (a near-black shade of the brand colour) darkens the edges
  // for depth — the "designed" look real club graphics have, in-hue so it never
  // muddies the colour.
  const vignette = `radial-gradient(125% 108% at 50% 26%, transparent 40%, ${alpha(
    shade(primary, 0.9),
    0.6,
  )} 100%)`;

  switch (style) {
    case "spotlight":
      return [
        vignette,
        `radial-gradient(66% 50% at 50% 32%, ${alpha(tint(primary, 0.28), 0.95)} 0%, ${shade(
          primary,
          0.3,
        )} 46%, ${shade(primary, 0.85)} 100%)`,
      ].join(", ");

    // "crest" (and legacy "palm"): deep base; the event logo watermark is drawn
    // on top by the canvas. A soft off-centre glow gives the mark something to sit in.
    case "crest":
    case "palm":
      return [
        vignette,
        `radial-gradient(80% 60% at 68% 42%, ${alpha(a, 0.14)} 0%, transparent 58%)`,
        `linear-gradient(165deg, ${shade(primary, 0.2)} 0%, ${shade(primary, 0.56)} 55%, ${shade(
          primary,
          0.86,
        )} 100%)`,
      ].join(", ");

    case "blades":
      return [
        `repeating-linear-gradient(118deg, transparent 0 44px, ${alpha(a, 0.06)} 44px 46px)`,
        `linear-gradient(125deg, ${alpha(a, 0.2)} 0%, transparent 32%)`,
        vignette,
        `linear-gradient(150deg, ${shade(primary, 0.14)} 0%, ${shade(primary, 0.82)} 100%)`,
      ].join(", ");

    case "deep":
    default:
      return [
        `radial-gradient(92% 62% at 50% -12%, ${alpha(a, 0.2)} 0%, transparent 56%)`,
        vignette,
        `linear-gradient(180deg, ${shade(primary, 0.18)} 0%, ${shade(primary, 0.55)} 52%, ${shade(
          primary,
          0.87,
        )} 100%)`,
      ].join(", ");
  }
}
